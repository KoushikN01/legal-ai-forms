# Email Service Extensions
# Additional email methods for admin notifications

from services.email_service import EmailService
from config import FRONTEND_URL

class EmailServiceExtensions:
    """Extended email service methods for admin notifications"""
    
    @staticmethod
    def _get_status_info(status: str) -> dict:
        """Get status-specific information for styling"""
        status_configs = {
            "submitted": {
                "color": "#4299e1",
                "bg_color": "#ebf8ff", 
                "border_color": "#90cdf4",
                "icon": "📝",
                "title": "Form Submitted",
                "message": "Your form has been received and is being reviewed."
            },
            "processing": {
                "color": "#ed8936",
                "bg_color": "#fffaf0",
                "border_color": "#fbd38d", 
                "icon": "⚙️",
                "title": "Processing",
                "message": "Our team is currently reviewing your submission."
            },
            "approved": {
                "color": "#38a169",
                "bg_color": "#f0fff4",
                "border_color": "#9ae6b4",
                "icon": "✅", 
                "title": "Approved",
                "message": "Congratulations! Your form has been approved."
            },
            "rejected": {
                "color": "#e53e3e",
                "bg_color": "#fed7d7",
                "border_color": "#feb2b2",
                "icon": "❌",
                "title": "Rejected", 
                "message": "Your form requires some corrections."
            }
        }
        return status_configs.get(status, status_configs["submitted"])
    
    @staticmethod
    def _get_status_update_template(tracking_id: str, status_display: str, message: str, status_info: dict) -> str:
        """Beautiful status update template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, {status_info['color']} 0%, {status_info['color']}dd 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        {status_info['icon']} {status_info['title']}
                    </h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                        {status_info['message']}
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Status Update for Your Submission
                    </h2>
                    
                    <div style="background-color: {status_info['bg_color']}; border: 1px solid {status_info['border_color']}; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: {status_info['color']}; margin: 0 0 15px 0; font-size: 18px;">📊 Submission Details</h3>
                        <p style="color: {status_info['color']}; margin: 5px 0; font-size: 14px;"><strong>Tracking ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{tracking_id}</code></p>
                        <p style="color: {status_info['color']}; margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: {status_info['color']}; font-weight: 600;">{status_display}</span></p>
                    </div>
                    
                    {f'''
                    <div style="background-color: #f7fafc; border-left: 4px solid {status_info['color']}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">💬 Admin Message</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.6;">{message}</p>
                    </div>
                    ''' if message else ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/track/{tracking_id}" style="background: linear-gradient(135deg, {status_info['color']} 0%, {status_info['color']}dd 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            View Submission Details
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: {status_info['color']}; text-decoration: none; padding: 15px 30px; border: 2px solid {status_info['color']}; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Questions? Contact our support team for assistance.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_help_ticket_response_template(ticket_id: str, subject: str, response: str, user_name: str) -> str:
        """Beautiful help ticket response template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Help Ticket Response</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        💬 Help Ticket Response
                    </h1>
                    <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                        We've responded to your support request
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Hello {user_name}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for contacting our support team. We've reviewed your request and provided a response below.
                    </p>
                    
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 18px;">📋 Ticket Details</h3>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Ticket ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{ticket_id}</code></p>
                        <p style="color: #2f855a; margin: 5px 0; font-size: 14px;"><strong>Subject:</strong> {subject}</p>
                    </div>
                    
                    <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">💬 Our Response</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.6;">{response}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/help" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            View All Tickets
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #4299e1; text-decoration: none; padding: 15px 30px; border: 2px solid #4299e1; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        Need more help? Contact our support team anytime.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_feedback_response_template(feedback_id: str, feedback_type: str, response: str, user_name: str) -> str:
        """Beautiful feedback response template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Feedback Response</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        ⭐ Feedback Response
                    </h1>
                    <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">
                        Thank you for your valuable feedback
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Hello {user_name}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We appreciate you taking the time to share your feedback with us. Your input helps us improve our service.
                    </p>
                    
                    <div style="background-color: #fffaf0; border: 1px solid #fbd38d; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #c05621; margin: 0 0 15px 0; font-size: 18px;">📋 Feedback Details</h3>
                        <p style="color: #9c4221; margin: 5px 0; font-size: 14px;"><strong>Feedback ID:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">{feedback_id}</code></p>
                        <p style="color: #9c4221; margin: 5px 0; font-size: 14px;"><strong>Type:</strong> {feedback_type.replace('_', ' ').title()}</p>
                    </div>
                    
                    <div style="background-color: #f7fafc; border-left: 4px solid #ed8936; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">💬 Our Response</h3>
                        <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.6;">{response}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{FRONTEND_URL}/help" style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Contact Support
                        </a>
                        <a href="{FRONTEND_URL}" style="background: transparent; color: #ed8936; text-decoration: none; padding: 15px 30px; border: 2px solid #ed8936; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 0 10px;">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; margin: 0; font-size: 14px;">
                        We value your feedback and are committed to improving our service.
                    </p>
                    <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 12px;">
                        © 2024 Legal Voice App. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
