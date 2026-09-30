from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=10)
    branch = models.CharField(max_length=50)
    college = models.CharField(max_length=100)
    year = models.CharField(max_length=10)
    dob = models.DateField()
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    event_year = models.IntegerField(default=2026)
    user_state = models.CharField(
        max_length=10,
        choices=[('Archived', 'archived'), ('Active', 'active')],
        default='active'
    )

    def is_nitk_user(self):
        email = self.user.email.lower() if self.user and self.user.email else ""
        email_domain_check = email.endswith('.nitk.edu.in') or email.endswith('@nitk.edu.in')
        college_check = bool(
            self.college and self.college.strip().lower() in ["nitk", "national institute of technology karnataka"]
        )
        return email_domain_check or college_check

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def is_complete(self):
        # Completeness check - all mandatory fields must be non-empty
        required_fields = [
            self.first_name,
            self.last_name,
            self.contact,
            self.branch,
            self.college,
            self.year,
            self.dob,
        ]
        return all(bool(field and str(field).strip()) for field in required_fields)
