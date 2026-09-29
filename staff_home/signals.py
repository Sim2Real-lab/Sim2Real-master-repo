from django.db.models.signals import post_save
from django.dispatch import receiver
from home.models import Announcments
from .email_utils import send_announcement_emails_batch

@receiver(post_save, sender=Announcments)
def handle_new_announcement(sender, instance, created, **kwargs):
    if created:
        # Only trigger for new announcements
        send_announcement_emails_batch(instance)
