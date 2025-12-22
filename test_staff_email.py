#!/usr/bin/env python3
"""
Test script to create staff member and send email
"""
import os
import sys
import secrets
import string

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.partner import Partner, PartnerStaff
from app.utils.email import send_staff_credentials_email

def test_create_staff_and_send_email():
    """Create a test staff member and send email"""
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        print("=" * 80)
        print("TEST: Creating staff member and sending email")
        print("=" * 80)
        
        # Get partner with ID 23
        partner = Partner.query.get(23)
        if not partner:
            print(f"❌ Partner with ID 23 not found!")
            return
        
        print(f"✅ Found partner: {partner.business_name} ({partner.email})")
        
        # Test staff details
        name = "Test Staff"
        email = "nebod56873@gamintor.com"
        phone = None
        role = "Staff"
        permissions = ['View Events', 'Scan Tickets']
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"⚠️ User with email {email} already exists. Deleting...")
            # Delete existing staff record if any
            existing_staff = PartnerStaff.query.filter_by(user_id=existing_user.id).first()
            if existing_staff:
                db.session.delete(existing_staff)
            db.session.delete(existing_user)
            db.session.commit()
            print(f"✅ Deleted existing user")
        
        # Generate password
        password_length = 12
        alphabet = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(alphabet) for i in range(password_length))
        
        print(f"\n📧 Creating staff member:")
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Role: {role}")
        print(f"   Partner: {partner.business_name}")
        print(f"   Password: {password}")
        
        # Create User account
        user = User(
            email=email,
            first_name=name.split()[0] if name.split() else name,
            last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
            phone_number=phone,
            password_hash=None,
            oauth_provider='email',
            is_active=True
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.flush()
        
        print(f"✅ Created user with ID: {user.id}")
        
        # Create PartnerStaff record
        staff = PartnerStaff(
            partner_id=partner.id,
            user_id=user.id,
            name=name,
            email=email,
            phone=phone,
            role=role,
            permissions=permissions,
            is_active=True
        )
        
        db.session.add(staff)
        db.session.commit()
        
        print(f"✅ Created staff record with ID: {staff.id}")
        
        # Check email configuration
        print(f"\n📧 Email Configuration:")
        print(f"   MAIL_SERVER: {app.config.get('MAIL_SERVER')}")
        print(f"   MAIL_PORT: {app.config.get('MAIL_PORT')}")
        print(f"   MAIL_USE_TLS: {app.config.get('MAIL_USE_TLS')}")
        print(f"   MAIL_USERNAME: {app.config.get('MAIL_USERNAME')}")
        print(f"   MAIL_PASSWORD: {'***' if app.config.get('MAIL_PASSWORD') else 'NOT SET'}")
        print(f"   MAIL_DEFAULT_SENDER: {app.config.get('MAIL_DEFAULT_SENDER')}")
        
        # Send email
        print(f"\n📧 Sending email to {email}...")
        try:
            send_staff_credentials_email(user, password, partner, role)
            print(f"✅ Email sent successfully!")
        except Exception as e:
            print(f"❌ Error sending email: {str(e)}")
            import traceback
            traceback.print_exc()
        
        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)

if __name__ == '__main__':
    test_create_staff_and_send_email()

