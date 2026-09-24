from django.db import models
from django.contrib.auth.models import User
import datetime
from team_profile.models import Team
from django.utils import timezone
# Create your models here.
class Announcments(models.Model):
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)  # more precise
    valid_till = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    schedule_for_later = models.DateField(help_text="Schedule time", null=True, blank=True)

    # Manual override flags
    manual_visibility = models.BooleanField(null=True, blank=True, help_text="Set visibility manually")
    manual_validity = models.BooleanField(null=True, blank=True, help_text="Set validity manually")

    CATEGORY_CHOICES = [
        ('GENERAL', 'General'),
        ('REGISTERED', 'Registered'),
        ('NOT_REGISTERED', 'Not Registered'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    def is_visible(self):
        today = datetime.date.today()
        if self.manual_visibility is not None:
            return self.manual_visibility
        if self.schedule_for_later:
            return self.schedule_for_later <= today
        return True

    def is_valid(self):
        today = datetime.date.today()
        if self.manual_validity is not None:
            return self.manual_validity
        return today <= self.valid_till

    def __str__(self):
        return f"Announcement ({self.category}) by {self.created_by}"


class Track(models.Model):
    QUALIFYING_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("archived", "Archived"),
        ("rejected", "Rejected"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    enabled = models.BooleanField(default=False, help_text="Enable/disable problem statement visibility for this track")
    file = models.FileField(upload_to="problem_statements/", blank=True, null=True, help_text="Problem Statement document")
    qualifying_status = models.CharField(max_length=50, choices=QUALIFYING_STATUS_CHOICES, default="pending", help_text="Qualifying status for this track")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class ProblemStatementConfig(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="configs", null=True, blank=True)
    enabled = models.BooleanField(default=False)
    file = models.FileField(upload_to="problem_statements/", blank=True, null=True)

    def __str__(self):
        return f"Config for {self.track.name}" if self.track else "Problem Statement Configuration"


class ProblemStatementSection(models.Model):
    config = models.ForeignKey(ProblemStatementConfig, on_delete=models.CASCADE, related_name="sections", null=True, blank=True)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="sections", null=True, blank=True)
    title = models.CharField(max_length=200)
    content = models.TextField()

    order = models.PositiveIntegerField(default=0)  # for ordering

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title
    
class Resource(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="resources", null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="resources/", blank=True, null=True)
    link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title

class Brochure(models.Model):
    file = models.FileField(upload_to="brochures/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Brochure ({self.file.name})"


class SubmissionWindow(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_visible = models.BooleanField(default=True)  # 👈 organiser toggle
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Submission(models.Model):
    window = models.ForeignKey(SubmissionWindow, on_delete=models.CASCADE, related_name="submissions")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="submissions")
    link = models.URLField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # grading

    def __str__(self):
        return f"{self.team.name} → {self.window.title}"
    
class Test(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=10, unique=True)
    start_datetime = models.DateTimeField()
    end_datetime= models.DateTimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    is_visible = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    event_year = models.IntegerField(default=2025)
    def __str__(self):
        return f"{self.title} ({self.code})"
    
class Question(models.Model):
    test = models.ForeignKey(Test,related_name='questions',on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=[("single", "Single Choice"), ("multiple", "Multiple Choice"), ("code", "Code")])
    marks = models.FloatField()
    negative_marks = models.FloatField(default=0)
    options = models.JSONField(blank=True,null=True)
    correct_answer = models.JSONField(blank=True, null=True)
    compiler_enabled = models.BooleanField(default=False)

class ParticipantTest(models.Model):
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    score = models.FloatField(default=0)
    status = models.CharField(max_length=20, choices=[("attempted", "Attempted"), ("not_attempted", "Not Attempted")], default="not_attempted")

class ParticipantAnswer(models.Model):
    participant_test = models.ForeignKey(ParticipantTest, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.JSONField()
    marks_awarded = models.FloatField(default=0)
