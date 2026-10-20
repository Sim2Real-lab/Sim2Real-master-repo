from django.test import TestCase, Client
from django.contrib.auth.models import User
from staff_home.models import Track, ProblemStatementConfig, ProblemStatementSection, Resource
from team_profile.models import Team
from accounts.models import UserRole

class MultiTrackTestCase(TestCase):
    def setUp(self):
        # Create Track 1
        self.track1 = Track.objects.create(
            name="Robotics Track",
            description="Robotics track description",
            enabled=True,
            qualifying_status="approved",
            order=1
        )
        self.section1 = ProblemStatementSection.objects.create(
            track=self.track1,
            title="Robotics Challenge",
            content="Build an autonomous robot.",
            order=1
        )
        self.resource1 = Resource.objects.create(
            track=self.track1,
            title="Robotics SDK",
            description="SDK docs",
            link="https://example.com/robotics"
        )

        # Create Track 2
        self.track2 = Track.objects.create(
            name="AI Track",
            description="AI track description",
            enabled=True,
            qualifying_status="pending",
            order=2
        )
        self.section2 = ProblemStatementSection.objects.create(
            track=self.track2,
            title="AI Challenge",
            content="Train a vision model.",
            order=1
        )

        # Create user and team
        self.leader = User.objects.create_user(username="leader", password="password123")
        role, _ = UserRole.objects.get_or_create(user=self.leader)
        role.is_organiser = False
        role.save()

        self.team = Team.objects.create(
            name="Alpha Team",
            leader=self.leader,
            is_paid=True,
            is_verified=True,
            track=self.track1
        )
        self.team.members.add(self.leader)

    def test_track_relationships(self):
        self.assertEqual(self.track1.sections.count(), 1)
        self.assertEqual(self.track1.resources.count(), 1)
        self.assertEqual(self.team.track, self.track1)

    def test_participant_view_track_filtering(self):
        client = Client()
        client.login(username="leader", password="password123")

        response = client.get("/user/problem_statement/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Robotics Track")
        self.assertContains(response, "Build an autonomous robot.")
        self.assertContains(response, "Approved")
        self.assertContains(response, "Robotics SDK")
        self.assertNotContains(response, "Train a vision model.")

    def test_check_teams_track_display_and_filter(self):
        import datetime
        from user_profile.models import UserProfile

        # Create organiser user
        organiser = User.objects.create_user(username="organiser", password="password123")
        role_org, _ = UserRole.objects.get_or_create(user=organiser)
        role_org.is_organiser = True
        role_org.save()
        UserProfile.objects.create(
            user=organiser,
            first_name="Admin",
            last_name="Staff",
            contact="1234567890",
            branch="CS",
            college="NITK",
            year="4",
            dob=datetime.date(2000, 1, 1),
            event_year=2026
        )

        UserProfile.objects.create(
            user=self.leader,
            first_name="Alpha",
            last_name="Leader",
            contact="9876543210",
            branch="IT",
            college="NITK",
            year="3",
            dob=datetime.date(2001, 1, 1),
            event_year=2026
        )

        # Team 2 with track2
        user2 = User.objects.create_user(username="user2", password="password123")
        role2, _ = UserRole.objects.get_or_create(user=user2)
        role2.is_organiser = False
        role2.save()
        UserProfile.objects.create(
            user=user2,
            first_name="Beta",
            last_name="Leader",
            contact="9876543211",
            branch="ECE",
            college="NITK",
            year="2",
            dob=datetime.date(2002, 1, 1),
            event_year=2026
        )
        team2 = Team.objects.create(
            name="Beta Team",
            leader=user2,
            is_paid=True,
            is_verified=True,
            track=self.track2
        )
        team2.members.add(user2)

        # Team 3 with no track
        user3 = User.objects.create_user(username="user3", password="password123")
        role3, _ = UserRole.objects.get_or_create(user=user3)
        role3.is_organiser = False
        role3.save()
        UserProfile.objects.create(
            user=user3,
            first_name="Gamma",
            last_name="Leader",
            contact="9876543212",
            branch="ME",
            college="NITK",
            year="1",
            dob=datetime.date(2003, 1, 1),
            event_year=2026
        )
        team3 = Team.objects.create(
            name="Gamma Team",
            leader=user3,
            is_paid=False,
            is_verified=False,
            track=None
        )
        team3.members.add(user3)

        client = Client()
        client.login(username="organiser", password="password123")

        # 1. Default view shows tracks
        res = client.get("/staff/check/registration/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Robotics Track")
        self.assertContains(res, "AI Track")
        self.assertContains(res, "No Track")
        self.assertContains(res, "Alpha Team")
        self.assertContains(res, "Beta Team")
        self.assertContains(res, "Gamma Team")

        # 2. Filter by track1
        res_t1 = client.get(f"/staff/check/registration/?track={self.track1.id}")
        self.assertEqual(res_t1.status_code, 200)
        self.assertContains(res_t1, "Alpha Team")
        self.assertNotContains(res_t1, "Beta Team")
        self.assertNotContains(res_t1, "Gamma Team")

        # 3. Filter by track2
        res_t2 = client.get(f"/staff/check/registration/?track={self.track2.id}")
        self.assertEqual(res_t2.status_code, 200)
        self.assertContains(res_t2, "Beta Team")
        self.assertNotContains(res_t2, "Alpha Team")
        self.assertNotContains(res_t2, "Gamma Team")

        # 4. Filter by none
        res_none = client.get("/staff/check/registration/?track=none")
        self.assertEqual(res_none.status_code, 200)
        self.assertContains(res_none, "Gamma Team")
        self.assertNotContains(res_none, "Alpha Team")
        self.assertNotContains(res_none, "Beta Team")

        # 5. CSV download
        res_csv = client.get("/staff/check/registration/?download=csv")
        self.assertEqual(res_csv.status_code, 200)
        csv_text = res_csv.content.decode("utf-8")
        self.assertIn("Team Name,Track,Leader", csv_text)
        self.assertIn("Alpha Team,Robotics Track", csv_text)
        self.assertIn("Beta Team,AI Track", csv_text)
        self.assertIn("Gamma Team,No Track", csv_text)

    def test_all_users_track_display_and_filter(self):
        import datetime
        from user_profile.models import UserProfile

        # Create organiser user
        organiser = User.objects.create_user(username="organiser2", password="password123")
        role_org, _ = UserRole.objects.get_or_create(user=organiser)
        role_org.is_organiser = True
        role_org.save()

        UserProfile.objects.create(
            user=self.leader,
            first_name="Alpha",
            last_name="Leader",
            contact="9876543210",
            branch="IT",
            college="NITK",
            year="3",
            dob=datetime.date(2001, 1, 1),
            event_year=2026
        )

        user2 = User.objects.create_user(username="user2b", password="password123")
        role2, _ = UserRole.objects.get_or_create(user=user2)
        role2.is_organiser = False
        role2.save()
        UserProfile.objects.create(
            user=user2,
            first_name="Beta",
            last_name="Leader",
            contact="9876543211",
            branch="ECE",
            college="NITK",
            year="2",
            dob=datetime.date(2002, 1, 1),
            event_year=2026
        )
        team2 = Team.objects.create(
            name="Beta Team",
            leader=user2,
            is_paid=True,
            is_verified=True,
            track=self.track2
        )
        team2.members.add(user2)

        client = Client()
        client.login(username="organiser2", password="password123")

        # 1. Default view shows tracks
        res = client.get("/staff/users/")
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Robotics Track")
        self.assertContains(res, "AI Track")

        # 2. Filter by track1
        res_t1 = client.get(f"/staff/users/?track={self.track1.id}")
        self.assertEqual(res_t1.status_code, 200)
        self.assertContains(res_t1, "Alpha Leader")
        self.assertNotContains(res_t1, "Beta Leader")

        # 3. Filter by track2
        res_t2 = client.get(f"/staff/users/?track={self.track2.id}")
        self.assertEqual(res_t2.status_code, 200)
        self.assertContains(res_t2, "Beta Leader")
        self.assertNotContains(res_t1, "Beta Leader")

        # 4. CSV download
        res_csv = client.get("/staff/users/?download=csv")
        self.assertEqual(res_csv.status_code, 200)
        csv_text = res_csv.content.decode("utf-8")
        self.assertIn("Name,Email,Contact,College,Branch,Year,Team,Track,Role", csv_text)
        self.assertIn("Robotics Track", csv_text)
        self.assertIn("AI Track", csv_text)

