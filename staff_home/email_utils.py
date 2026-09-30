import threading
import time
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
import logging
from user_profile.models import UserProfile
from staff_home.models import EmailLog

logger = logging.getLogger(__name__)

BATCH_SIZE = 50
MAX_RETRIES = 3

def _execute_email_send(subject, message, from_email, recipient_email):
    """
    Executes the actual email send or prints to terminal for dev mode.
    """
    # --- DEVELOPMENT / LOCAL MODE ---
    print(f"\n{'='*40}")
    print(f"Sent from: {from_email}")
    print(f"Sent to: {recipient_email}")
    print(f"Subject: {subject}")
    print(f"Message: {message}")
    print(f"{'='*40}\n")
    # In DEV mode, this always succeeds. 
    # To test failures locally, you could raise Exception("Simulated failure") here.
    return True

    '''
    # --- PRODUCTION MODE SNIPPET ---
    # Uncomment below and remove the dev block above for production
    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[recipient_email],
        fail_silently=False,
    )
    return True
    '''

def _send_with_retry(subject, message, recipient_email, task_type='announcement'):
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@sim2real.com')
    
    # 1. Create a pending log entry
    log_entry = EmailLog.objects.create(
        recipient=recipient_email,
        subject=subject,
        message=message,
        status='pending',
        task_type=task_type,
        attempts=0
    )

    retries = 0
    success = False

    while retries < MAX_RETRIES:
        try:
            log_entry.attempts += 1
            log_entry.save()
            
            _execute_email_send(subject, message, from_email, recipient_email)
            
            success = True
            break  # Success, exit loop
        except Exception as e:
            retries += 1
            logger.error(f"Failed to send {task_type} email to {recipient_email}. Retry {retries}/{MAX_RETRIES}. Error: {e}")
            if retries < MAX_RETRIES:
                time.sleep(1) # wait a bit before retrying

    if success:
        # Cascade (delete) the log if it succeeds
        log_entry.delete()
    else:
        # Keep the log if it fails completely
        log_entry.status = 'failed'
        log_entry.save()

def send_announcement_emails_batch(announcement):
    subject = f"New Announcement: {announcement.category}"
    message = announcement.message
    
    thread = threading.Thread(
        target=_process_email_batches, 
        args=(subject, message)
    )
    thread.daemon = True
    thread.start()

def _process_email_batches(subject, message):
    users = User.objects.filter(userprofile__isnull=False).exclude(email__exact='').exclude(email__isnull=True).values_list('email', flat=True).distinct()
    emails = list(users)
    
    for i in range(0, len(emails), BATCH_SIZE):
        batch_emails = emails[i:i + BATCH_SIZE]
        for email in batch_emails:
            _send_with_retry(subject, message, email, task_type='announcement')

# --- QUERIES SECTION ---

def send_query_received_email(query):
    """
    Called when someone puts up a query. Sent to the designated organizer email.
    """
    subject = f"New Query Received: {query.query_type.upper()} - Ticket {query.ticket}"
    message = f"Contact: {query.contact}\nFrom: {query.email}\n\nMessage:\n{query.message}"
    
    # Designated email for organizers (can be changed)
    designated_email = getattr(settings, 'ORGANIZER_EMAIL', 'support@sim2real.com')
    
    thread = threading.Thread(
        target=_send_with_retry, 
        args=(subject, message, designated_email, 'query_received')
    )
    thread.daemon = True
    thread.start()

def send_query_reply_email(query):
    """
    Called when an organizer replies to a query. Sent to the user who asked.
    """
    subject = f"Reply to your Query: {query.ticket}"
    message = f"Hello {query.name},\n\nAn organizer has replied to your query:\n\n{query.response}"
    
    thread = threading.Thread(
        target=_send_with_retry, 
        args=(subject, message, query.email, 'query_reply')
    )
    thread.daemon = True
    thread.start()

