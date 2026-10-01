from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from user_profile.models import UserProfile
from accounts.models import UserRole
from datetime import date


class UserProfileModelAndViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='student1',
            email='student1@nitk.edu.in',
            password='Password@123'
        )
        self.role, _ = UserRole.objects.get_or_create(user=self.user)
        self.role.is_organiser = False
        self.role.save()

    def test_model_is_nitk_user(self):
        profile = UserProfile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            contact='9876543210',
            branch='Computer Science',
            college='National Institute of Technology Karnataka',
            year='2nd Year',
            dob=date(2002, 5, 15)
        )
        self.assertTrue(profile.is_nitk_user())
        self.assertTrue(profile.is_complete())

    def test_profile_view_get(self):
        self.client.login(username='student1', password='Password@123')
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context['is_nitk'])
        self.assertEqual(response.context['college_value'], 'National Institute of Technology Karnataka')

    def test_profile_view_post_create(self):
        self.client.login(username='student1', password='Password@123')
        post_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'contact': '9123456780',
            'branch': 'ECE',
            'college': 'Random College',  # Should be overridden by NITK
            'year': '3rd Year',
            'dob': '2001-08-20'
        }
        response = self.client.post(reverse('profile'), data=post_data)
        self.assertRedirects(response, reverse('home'))

        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(profile.first_name, 'Jane')
        self.assertEqual(profile.college, 'National Institute of Technology Karnataka')

    def test_profile_view_post_update(self):
        UserProfile.objects.create(
            user=self.user,
            first_name='Original',
            last_name='Name',
            contact='9876543210',
            branch='CSE',
            college='NITK',
            year='1st Year',
            dob=date(2003, 1, 1)
        )
        self.client.login(username='student1', password='Password@123')
        post_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'contact': '9876543210',
            'branch': 'AI',
            'college': '',
            'year': '2nd Year',
            'dob': '2003-01-01'
        }
        response = self.client.post(reverse('profile'), data=post_data)
        self.assertRedirects(response, reverse('profile'))

        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(profile.first_name, 'Updated')
        self.assertEqual(profile.branch, 'AI')

    def test_validation_invalid_contact(self):
        self.client.login(username='student1', password='Password@123')
        post_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'contact': '12345',  # Invalid contact
            'branch': 'ECE',
            'college': 'NITK',
            'year': '3rd Year',
            'dob': '2001-08-20'
        }
        response = self.client.post(reverse('profile'), data=post_data)
        self.assertRedirects(response, reverse('profile'))
        self.assertFalse(UserProfile.objects.filter(user=self.user).exists())

    def test_validation_age_under_18(self):
        self.client.login(username='student1', password='Password@123')
        post_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'contact': '9876543210',
            'branch': 'ECE',
            'college': 'NITK',
            'year': '3rd Year',
            'dob': '2020-01-01'  # Under 18
        }
        response = self.client.post(reverse('profile'), data=post_data)
        self.assertRedirects(response, reverse('profile'))
        self.assertFalse(UserProfile.objects.filter(user=self.user).exists())

    def test_validation_age_over_30(self):
        self.client.login(username='student1', password='Password@123')
        post_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'contact': '9876543210',
            'branch': 'ECE',
            'college': 'NITK',
            'year': '3rd Year',
            'dob': '1980-01-01'  # Over 30
        }
        response = self.client.post(reverse('profile'), data=post_data)
        self.assertRedirects(response, reverse('profile'))
        self.assertFalse(UserProfile.objects.filter(user=self.user).exists())
