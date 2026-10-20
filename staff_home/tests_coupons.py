import datetime
from decimal import Decimal
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.utils import timezone
from accounts.models import UserRole
from staff_home.models import Coupon, PaymentConfig
from team_profile.models import Team
from django.urls import reverse
from user_profile.models import UserProfile

class CouponSystemTestCase(TestCase):
    def setUp(self):
        # 1. Organizer setup
        self.organizer = User.objects.create_user(username="organizer1", password="password123", email="org@sim2real.com")
        role_org, _ = UserRole.objects.get_or_create(user=self.organizer)
        role_org.is_organiser = True
        role_org.save()

        # 2. Leader setup
        self.leader = User.objects.create_user(username="teamleader", password="password123", email="leader@gmail.com")
        role_user, _ = UserRole.objects.get_or_create(user=self.leader)
        role_user.is_organiser = False
        role_user.save()
        UserProfile.objects.create(
            user=self.leader,
            first_name="Team",
            last_name="Leader",
            contact="9876543210",
            branch="Robotics",
            college="Outsider Engineering College",
            year="3",
            dob="2003-01-01"
        )

        # 3. Team setup
        self.team = Team.objects.create(name="CyberRobots", leader=self.leader)
        self.team.members.add(self.leader)

        # 4. Payment config setup
        self.config, _ = PaymentConfig.objects.get_or_create(id=1, defaults={"amount": Decimal("500.00"), "payee_name": "Test Payee"})

    def test_coupon_creation_and_ttl(self):
        # Coupon valid for 120 minutes (2 hours)
        coupon = Coupon.objects.create(
            code="EARLYBIRD50",
            target_amount=Decimal("250.00"),
            ttl_minutes=120,
            max_uses=5,
            max_failures=3,
            created_by=self.organizer
        )
        self.assertTrue(coupon.is_active)
        self.assertFalse(coupon.is_expired)
        self.assertEqual(coupon.code, "EARLYBIRD50")
        self.assertEqual(coupon.target_amount, Decimal("250.00"))
        
        is_val, msg = coupon.is_valid()
        self.assertTrue(is_val)
        self.assertEqual(msg, "Valid")

    def test_coupon_ttl_expiration(self):
        # Expired coupon (TTL ended)
        past_time = timezone.now() - datetime.timedelta(minutes=10)
        coupon = Coupon.objects.create(
            code="EXPIRED10",
            target_amount=Decimal("200.00"),
            ttl_minutes=60,
            expires_at=past_time,
            created_by=self.organizer
        )
        self.assertTrue(coupon.is_expired)
        is_val, msg = coupon.is_valid()
        self.assertFalse(is_val)
        self.assertIn("expired", msg.lower())

    def test_coupon_failure_limit(self):
        coupon = Coupon.objects.create(
            code="FAILTEST",
            target_amount=Decimal("300.00"),
            ttl_minutes=60,
            max_failures=2,
            failure_count=2,
            created_by=self.organizer
        )
        self.assertTrue(coupon.is_locked)
        is_val, msg = coupon.is_valid()
        self.assertFalse(is_val)
        self.assertIn("locked", msg.lower())

    def test_apply_and_remove_coupon_by_team(self):
        coupon = Coupon.objects.create(
            code="DISCOUNT200",
            target_amount=Decimal("200.00"),
            ttl_minutes=120,
            created_by=self.organizer
        )

        client = Client()
        client.login(username="teamleader", password="password123")

        payment_url = reverse('payment_page')

        # 1. Apply valid coupon
        response = client.post(payment_url, {"apply_coupon": "1", "coupon_code": "discount200"}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.team.refresh_from_db()
        self.assertEqual(self.team.applied_coupon, coupon)
        self.assertEqual(self.team.discounted_amount, Decimal("200.00"))

        # 2. Check payment page amounts
        response = client.get(payment_url)
        self.assertEqual(response.context["effective_base_amount"], Decimal("200.00"))
        # 18% GST of 200 = 36. Total = 236.
        self.assertEqual(response.context["gst_amount"], Decimal("36.00"))
        self.assertEqual(response.context["total_payable"], Decimal("236.00"))

        # 3. Remove coupon
        response = client.post(payment_url, {"remove_coupon": "1"}, follow=True)
        self.assertEqual(response.status_code, 200)
        self.team.refresh_from_db()
        self.assertIsNone(self.team.applied_coupon)
        self.assertIsNone(self.team.discounted_amount)

    def test_apply_invalid_or_expired_coupon_increments_failure(self):
        past_time = timezone.now() - datetime.timedelta(minutes=5)
        coupon = Coupon.objects.create(
            code="ALREADYEXPIRED",
            target_amount=Decimal("150.00"),
            ttl_minutes=30,
            expires_at=past_time,
            failure_count=0,
            max_failures=3,
            created_by=self.organizer
        )

        client = Client()
        client.login(username="teamleader", password="password123")

        payment_url = reverse('payment_page')

        response = client.post(payment_url, {"apply_coupon": "1", "coupon_code": "ALREADYEXPIRED"}, follow=True)
        self.assertEqual(response.status_code, 200)
        coupon.refresh_from_db()
        # Failure count should have incremented
        self.assertEqual(coupon.failure_count, 1)

    def test_organizer_rejection_increments_coupon_failure(self):
        coupon = Coupon.objects.create(
            code="REJECTPROMO",
            target_amount=Decimal("250.00"),
            ttl_minutes=120,
            failure_count=0,
            max_failures=3,
            created_by=self.organizer
        )
        self.team.applied_coupon = coupon
        self.team.discounted_amount = coupon.target_amount
        self.team.is_paid = True
        self.team.save()

        client = Client()
        client.login(username="organizer1", password="password123")

        # Organizer rejects the submission
        response = client.post(f"/staff/verify-payments/{self.team.id}/", {
            "action": "reject",
            "rejection_reason": "Fake payment screenshot"
        }, follow=True)
        self.assertEqual(response.status_code, 200)

        coupon.refresh_from_db()
        self.assertEqual(coupon.failure_count, 1)

    def test_organizer_coupon_actions(self):
        client = Client()
        client.login(username="organizer1", password="password123")

        # 1. Create Coupon via Organizer portal
        response = client.post("/staff/verify-payments/", {
            "create_coupon": "1",
            "code": "ORGTEST",
            "target_amount": "220.00",
            "ttl_value": "48",
            "ttl_unit": "hours",
            "max_uses": "10",
            "max_failures": "4",
            "description": "Test waiver"
        }, follow=True)
        self.assertEqual(response.status_code, 200)

        coupon = Coupon.objects.filter(code="ORGTEST").first()
        self.assertIsNotNone(coupon)
        self.assertEqual(coupon.target_amount, Decimal("220.00"))
        self.assertEqual(coupon.ttl_minutes, 48 * 60)
        self.assertEqual(coupon.max_failures, 4)

        # 2. Toggle Active
        client.post("/staff/verify-payments/", {"toggle_coupon": "1", "coupon_id": coupon.id}, follow=True)
        coupon.refresh_from_db()
        self.assertFalse(coupon.is_active)

        # 3. Reset Failures
        coupon.failure_count = 3
        coupon.save()
        client.post("/staff/verify-payments/", {"reset_coupon_failures": "1", "coupon_id": coupon.id}, follow=True)
        coupon.refresh_from_db()
        self.assertEqual(coupon.failure_count, 0)

        # 4. Delete Coupon
        client.post("/staff/verify-payments/", {"delete_coupon": "1", "coupon_id": coupon.id}, follow=True)
        self.assertFalse(Coupon.objects.filter(id=coupon.id).exists())
