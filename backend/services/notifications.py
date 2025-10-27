import os
from typing import Optional

def send_sms(phone: str, message: str) -> bool:
    """Send SMS notification via Twilio"""
    try:
        api_choice = os.getenv("NOTIFICATION_API", "mock").lower()
        
        if api_choice == "twilio":
            return send_sms_twilio(phone, message)
        else:
            return send_sms_mock(phone, message)
    except Exception as e:
        print(f"SMS error: {e}")
        return False


def send_sms_mock(phone: str, message: str) -> bool:
    """Mock SMS for testing"""
    print(f"[MOCK SMS] To: {phone}")
    print(f"[MOCK SMS] Message: {message}")
    return True


def send_sms_twilio(phone: str, message: str) -> bool:
    """Send SMS via Twilio"""
    try:
        from twilio.rest import Client
        
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=message,
            from_=from_number,
            to=phone
        )
        
        print(f"SMS sent: {message.sid}")
        return True
    except Exception as e:
        print(f"Twilio error: {e}")
        return False


def send_email(email: str, subject: str, body: str) -> bool:
    """Send email notification via SendGrid"""
    try:
        api_choice = os.getenv("EMAIL_API", "mock").lower()
        
        if api_choice == "sendgrid":
            return send_email_sendgrid(email, subject, body)
        else:
            return send_email_mock(email, subject, body)
    except Exception as e:
        print(f"Email error: {e}")
        return False


def send_email_mock(email: str, subject: str, body: str) -> bool:
    """Mock email for testing"""
    print(f"[MOCK EMAIL] To: {email}")
    print(f"[MOCK EMAIL] Subject: {subject}")
    print(f"[MOCK EMAIL] Body: {body}")
    return True


def send_email_sendgrid(email: str, subject: str, body: str) -> bool:
    """Send email via SendGrid"""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        api_key = os.getenv("SENDGRID_API_KEY")
        from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@legalvoice.com")
        
        message = Mail(
            from_email=from_email,
            to_emails=email,
            subject=subject,
            html_content=body
        )
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        print(f"Email sent: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        print(f"SendGrid error: {e}")
        return False
