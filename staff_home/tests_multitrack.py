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
