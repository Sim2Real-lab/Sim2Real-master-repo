import threading
import time
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
import logging
from user_profile.models import UserProfile

logger = logging.getLogger(__name__)

# Assumed Batch Size
BATCH_SIZE = 50
MAX_RETRIES = 3

def send_announcement_emails_batch(announcement):
    """
    Kicks off a background thread to process emails in batches.
    """
    subject = f"New Announcement: {announcement.category}"
    message = announcement.message
    
    thread = threading.Thread(
        target=_process_email_batches, 
        args=(subject, message)
    )
    thread.daemon = True
    thread.start()

def _process_email_batches(subject, message):
    # Fetching all registered users (who have a UserProfile)
    users = User.objects.filter(userprofile__isnull=False).exclude(email__exact='').exclude(email__isnull=True).values_list('email', flat=True).distinct()
    emails = list(users)
    
    # Process in batches
    for i in range(0, len(emails), BATCH_SIZE):
        batch_emails = emails[i:i + BATCH_SIZE]
        
        for email in batch_emails:
            _send_with_retry(subject, message, email)
            
def _send_with_retry(subject, message, recipient_email):
    # --- DEVELOPMENT / LOCAL MODE ---
    # Instead of sending a real email, we print the details to the terminal.
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@sim2real.com')
    print(f"\n{'='*40}")
    print(f"Sent from: {from_email}")
    print(f"Sent to: {recipient_email}")
    print(f"Subject: {subject}")
    print(f"Message: {message}")
    print(f"{'='*40}\n")
    
    '''
    # --- PRODUCTION MODE SNIPPET ---
    # Uncomment this block and remove the print statements above for production
    retries = 0
    while retries < MAX_RETRIES:
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@sim2real.com'),
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            break  # Success, exit loop
        except Exception as e:
            retries += 1
            logger.error(f"Failed to send email to {recipient_email}. Retry {retries}/{MAX_RETRIES}. Error: {e}")
            if retries < MAX_RETRIES:
                time.sleep(1) # wait a bit before retrying
    '''
