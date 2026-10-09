from django.db import models
import uuid
from django.contrib.auth.models import User
# Create your models here.

class Team(models.Model):
    name=models.CharField(max_length=100)
    join_code=models.UUIDField(default=uuid.uuid4,unique=True,editable=False)
    leader=models.OneToOneField(User,related_name="led_team",on_delete=models.CASCADE)
    members=models.ManyToManyField(User,related_name="team")
    is_paid = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    payment_screenshot = models.ImageField(upload_to="payments/", blank=True, null=True)
    payment_ref = models.CharField(max_length=50, blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    track = models.ForeignKey('staff_home.Track', on_delete=models.SET_NULL, null=True, blank=True, related_name="teams")
    event_year = models.IntegerField(default=2026)
    policy_accepted_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when team accepted policies and code of conduct")

    ROUND1_STATUS_CHOICES = [
        ('pending', 'Pending / Under Evaluation'),
        ('disqualified', 'Disqualified'),
        ('qualified_r2', 'Qualified for Round 2'),
        ('waitlist', 'Waitlist'),
        ('moved_ideathon', 'Moved for Sim2Real Ideathon'),
        ('moved_waitlist_r2', 'Moved from Waitlist to Round 2'),
    ]

    round1_status = models.CharField(max_length=50, choices=ROUND1_STATUS_CHOICES, default='pending')
    round1_score = models.FloatField(default=0.0, null=True, blank=True)
    round2_status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('qualified', 'Qualified'), ('disqualified', 'Disqualified')], default='pending')
    round2_score = models.FloatField(default=0.0, null=True, blank=True)

    def is_registered(self):
        return self.is_paid and self.is_verified
    def is_outsider(self):
        for member in self.members.all():
            try:
                profile = getattr(member, 'userprofile', None)
                if not profile or not profile.is_nitk_user():
                    return True
            except Exception:
                return True  # treat users without profile as outsider
        return False


    def is_full(self):
        return self.members.count() >= 4
    
    def __str__(self):
        return self.name
    
class JoinRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='requests')
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending')

    class Meta():
        unique_together=('user','team')