from flask import current_app, render_template_string
from flask_mail import Message
from app import mail
from threading import Thread
from datetime import datetime
import sys


def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        try:
            print(f"📧 [EMAIL] Sending email to: {', '.join(msg.recipients)}")
            print(f"📧 [EMAIL] Subject: {msg.subject}")
            mail.send(msg)
            print(f"✅ [EMAIL] Successfully sent email to: {', '.join(msg.recipients)}")
        except Exception as e:
            print(f"❌ [EMAIL] Error sending email to {', '.join(msg.recipients)}: {str(e)}")


def send_email(subject, recipient, html_body, text_body=None, sync=False):
    """Send email - sync=True for immediate sending, sync=False for async"""
    from flask import current_app
    
    # Check email configuration
    mail_server = current_app.config.get('MAIL_SERVER')
    mail_username = current_app.config.get('MAIL_USERNAME')
    mail_password = current_app.config.get('MAIL_PASSWORD')
    
    if not mail_server or not mail_username or not mail_password:
        error_msg = f"Email not configured. MAIL_SERVER: {mail_server}, MAIL_USERNAME: {mail_username}, MAIL_PASSWORD: {'SET' if mail_password else 'NOT SET'}"
        current_app.logger.error(f"❌ [EMAIL] {error_msg}")
        print(f"❌ [EMAIL] {error_msg}", file=sys.stderr, flush=True)
        raise ValueError(error_msg)
    
    msg = Message(
        subject=subject,
        recipients=[recipient] if isinstance(recipient, str) else recipient,
        html=html_body,
        body=text_body or html_body
    )
    
    if sync:
        # Send synchronously for immediate delivery
        try:
            current_app.logger.info(f"📧 [EMAIL] Sending email synchronously to: {', '.join(msg.recipients)}")
            current_app.logger.info(f"📧 [EMAIL] Subject: {msg.subject}")
            print(f"📧 [EMAIL] Sending email synchronously to: {', '.join(msg.recipients)}", file=sys.stderr, flush=True)
            print(f"📧 [EMAIL] Subject: {msg.subject}", file=sys.stderr, flush=True)
            mail.send(msg)
            current_app.logger.info(f"✅ [EMAIL] Successfully sent email to: {', '.join(msg.recipients)}")
            print(f"✅ [EMAIL] Successfully sent email to: {', '.join(msg.recipients)}", file=sys.stderr, flush=True)
        except Exception as e:
            error_msg = f"Error sending email to {', '.join(msg.recipients)}: {str(e)}"
            current_app.logger.error(f"❌ [EMAIL] {error_msg}")
            current_app.logger.exception("Full traceback:")
            print(f"❌ [EMAIL] {error_msg}", file=sys.stderr, flush=True)
            import traceback
            print(traceback.format_exc(), file=sys.stderr, flush=True)
            raise
    else:
        # Send asynchronously
        app = current_app._get_current_object()
        Thread(target=send_async_email, args=(app, msg)).start()


def send_welcome_email(user):
    """Send welcome email to new user"""
    subject = "Welcome to Niko Free!"
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4CAF50;">Welcome to Niko Free, {user.first_name}! 🎉</h2>
                <p>Thank you for joining Niko Free - your gateway to amazing events in Kenya!</p>
                <p>With Niko Free, you can:</p>
                <ul>
                    <li>Discover exciting events near you</li>
                    <li>Book tickets easily and securely</li>
                    <li>Save events to your bucketlist</li>
                    <li>Get digital tickets with QR codes</li>
                </ul>
                <p>Start exploring events now!</p>
                <a href="{current_app.config.get('FRONTEND_URL')}/events" 
                   style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; 
                          color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                    Browse Events
                </a>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    If you have any questions, feel free to contact us.
                </p>
            </div>
        </body>
    </html>
    """
    send_email(subject, user.email, html_body)


def send_booking_confirmation_email(booking, tickets):
    """Send booking confirmation email"""
    user = booking.user
    event = booking.event
    
    subject = f"Booking Confirmed: {event.title}"
    
    tickets_html = ""
    for ticket in tickets:
        tickets_html += f"""
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <p><strong>Ticket #{ticket.ticket_number}</strong></p>
            <p>Type: {ticket.ticket_type.name}</p>
            <img src="{ticket.qr_code}" alt="QR Code" style="max-width: 200px;">
        </div>
        """
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4CAF50;">Booking Confirmed! 🎉</h2>
                <p>Hi {user.first_name},</p>
                <p>Your booking for <strong>{event.title}</strong> has been confirmed!</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Event Details</h3>
                    <p><strong>Event:</strong> {event.title}</p>
                    <p><strong>Date:</strong> {event.start_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Venue:</strong> {event.venue_name or event.venue_address}</p>
                    <p><strong>Booking Number:</strong> {booking.booking_number}</p>
                    <p><strong>Total Amount:</strong> KES {booking.total_amount}</p>
                </div>
                
                <h3>Your Tickets</h3>
                {tickets_html}
                
                <p style="margin-top: 30px;">
                    Please present your QR code at the event entrance for check-in.
                </p>
                
                <a href="{current_app.config.get('FRONTEND_URL')}/bookings/{booking.id}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; 
                          color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                    View Booking Details
                </a>
            </div>
        </body>
    </html>
    """
    send_email(subject, user.email, html_body)


def send_partner_approval_email(partner, approved=True):
    """Send partner approval/rejection email"""
    if approved:
        subject = "Your Partner Account Has Been Approved! 🎉"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50;">Congratulations! Your Account is Approved</h2>
                    <p>Hi {partner.business_name},</p>
                    <p>Great news! Your partner account has been approved and you can now start creating events.</p>
                    
                    <a href="{current_app.config.get('FRONTEND_URL')}/partner/dashboard" 
                       style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; 
                              color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        Go to Dashboard
                    </a>
                    
                    <p style="margin-top: 30px;">
                        Start creating your first event and reach thousands of potential attendees!
                    </p>
                </div>
            </body>
        </html>
        """
    else:
        subject = "Partner Application Update"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Partner Application Update</h2>
                    <p>Hi {partner.business_name},</p>
                    <p>Thank you for your interest in becoming a partner with Niko Free.</p>
                    <p>Unfortunately, we are unable to approve your application at this time.</p>
                    <p><strong>Reason:</strong> {partner.rejection_reason}</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </body>
        </html>
        """
    
    send_email(subject, partner.email, html_body)


def send_event_approval_email(event, approved=True):
    """Send event approval/rejection email"""
    partner = event.organizer
    
    if approved:
        subject = f"Event Approved: {event.title}"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50;">Your Event Has Been Approved! 🎉</h2>
                    <p>Hi {partner.business_name},</p>
                    <p>Your event <strong>{event.title}</strong> has been approved and is now live!</p>
                    
                    <a href="{current_app.config.get('FRONTEND_URL')}/events/{event.id}" 
                       style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; 
                              color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        View Event
                    </a>
                </div>
            </body>
        </html>
        """
    else:
        subject = f"Event Update: {event.title}"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Event Update</h2>
                    <p>Hi {partner.business_name},</p>
                    <p>Your event <strong>{event.title}</strong> could not be approved.</p>
                    <p><strong>Reason:</strong> {event.rejection_reason}</p>
                    <p>Please review and resubmit your event with the necessary changes.</p>
                </div>
            </body>
        </html>
        """
    
    send_email(subject, partner.email, html_body)



def send_staff_credentials_email(user, password, partner, role):
    """Send staff credentials email with login information"""
    from flask import current_app
    current_app.logger.info(f"📧 [STAFF EMAIL] ===== ENTERING send_staff_credentials_email =====")
    current_app.logger.info(f"📧 [STAFF EMAIL] Preparing to send staff credentials email")
    current_app.logger.info(f"📧 [STAFF EMAIL] Recipient Email: {user.email}")
    current_app.logger.info(f"📧 [STAFF EMAIL] Staff Name: {user.first_name} {user.last_name}")
    current_app.logger.info(f"📧 [STAFF EMAIL] Partner: {partner.business_name}")
    current_app.logger.info(f"📧 [STAFF EMAIL] Role: {role}")
    
    subject = f"Welcome to {partner.business_name} - Staff Account Created"
    
    frontend_url = current_app.config.get('FRONTEND_URL', 'https://niko-free.com')
    login_url = f"{frontend_url}/partner/login"
    
    manager_permissions = '<li>Edit events and manage tickets</li><li>View analytics and reports</li>' if role.lower() == 'manager' else ''
    
    html_body = f"""
    <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                <div style="background: linear-gradient(135deg, #27aae2 0%, #1e8bb8 100%); padding: 40px 30px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">NIKO FREE</div>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">👋 Staff Account Created</h1>
                </div>
                
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi <strong>{user.first_name}</strong>,</p>
                    <p style="font-size: 16px; color: #555; margin: 0 0 30px 0;">You have been added as a <strong>{role}</strong> for <strong>{partner.business_name}</strong> on Niko Free.</p>
                    
                    <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 15px 0; color: #e65100; font-size: 18px;">🔐 Your Login Credentials</h3>
                        <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> {user.email}</p>
                        <p style="margin: 5px 0; color: #333;"><strong>Password:</strong> <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">{password}</code></p>
                        <p style="margin: 15px 0 5px 0; color: #666; font-size: 14px;"><strong>⚠️ Important:</strong> Please change your password after first login for security.</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 8px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #1e8bb8; font-size: 18px;">📋 Your Access</h3>
                        <p style="margin: 0; color: #555; font-size: 14px;">As a {role}, you can:</p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #555; font-size: 14px;">
                            <li>View events for {partner.business_name}</li>
                            <li>Scan and validate tickets at events</li>
                            {manager_permissions}
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{login_url}" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #27aae2 0%, #1e8bb8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(39, 170, 226, 0.3);">Login to Dashboard</a>
                    </div>
                    
                    <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                        <p style="font-size: 14px; color: #999; margin: 0;">Questions? Contact <a href="mailto:{partner.email}" style="color: #27aae2; text-decoration: none;">{partner.email}</a></p>
                    </div>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                    <p style="font-size: 12px; color: #999; margin: 0;">© {datetime.now().year} Niko Free. All rights reserved.</p>
                </div>
            </div>
        </body>
    </html>
    """
    from flask import current_app
    current_app.logger.info(f"📧 [STAFF EMAIL] Calling send_email function (SYNCHRONOUS)...")
    current_app.logger.info(f"📧 [STAFF EMAIL] Subject: {subject}")
    current_app.logger.info(f"📧 [STAFF EMAIL] Recipient: {user.email}")
    try:
        # Send email synchronously for immediate delivery
        send_email(subject, user.email, html_body, sync=True)
        current_app.logger.info(f"✅ [STAFF EMAIL] Email sent successfully to {user.email}!")
    except Exception as e:
        current_app.logger.error(f"❌ [STAFF EMAIL] Failed to send email to {user.email}: {str(e)}")
        current_app.logger.exception("Full traceback:")
        raise
    current_app.logger.info(f"📧 [STAFF EMAIL] ===== EXITING send_staff_credentials_email =====")
