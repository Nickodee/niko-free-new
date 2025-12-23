#!/usr/bin/env python3
"""
Complete migration: Upload all local files to Azure and update database records
"""
import os
import sys
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import uuid

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

def upload_file_to_azure(local_file_path, folder='general'):
    """Upload a local file to Azure Blob Storage and return URL with SAS token"""
    try:
        from azure.storage.blob import BlobServiceClient, ContentSettings, generate_account_sas, ResourceTypes, AccountSasPermissions
        from datetime import datetime, timedelta
        
        account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
        account_key = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
        container_name = os.getenv('AZURE_STORAGE_CONTAINER', 'uploads')
        
        if not account_name or not account_key:
            return None
        
        # Get filename and create unique name
        filename = os.path.basename(local_file_path)
        name, ext = os.path.splitext(secure_filename(filename))
        unique_filename = f"{folder}/{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Initialize Blob Service Client
        account_url = f"https://{account_name}.blob.core.windows.net"
        blob_service_client = BlobServiceClient(account_url=account_url, credential=account_key)
        
        # Get blob client
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=unique_filename)
        
        # Determine content type
        content_type = 'application/octet-stream'
        if ext.lower() in ['.jpg', '.jpeg']:
            content_type = 'image/jpeg'
        elif ext.lower() == '.png':
            content_type = 'image/png'
        elif ext.lower() == '.gif':
            content_type = 'image/gif'
        elif ext.lower() == '.pdf':
            content_type = 'application/pdf'
        
        # Upload file
        with open(local_file_path, 'rb') as file:
            blob_client.upload_blob(
                file,
                overwrite=True,
                content_settings=ContentSettings(content_type=content_type)
            )
        
        # Generate SAS token
        sas_token = generate_account_sas(
            account_name=account_name,
            account_key=account_key,
            resource_types=ResourceTypes(object=True),
            permission=AccountSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(days=365)
        )
        
        blob_url = f"{blob_client.url}?{sas_token}"
        return blob_url
        
    except Exception as e:
        print(f"   ❌ Error uploading {local_file_path}: {str(e)}")
        return None

def find_local_file(local_path):
    """Find local file, checking multiple possible locations"""
    # Try as absolute path first
    if os.path.isabs(local_path):
        if os.path.exists(local_path):
            return local_path
    
    # Try relative to uploads folder
    uploads_paths = [
        'uploads',
        os.path.join('..', 'uploads'),
        os.path.join(os.path.dirname(__file__), '..', 'uploads'),
    ]
    
    for base in uploads_paths:
        full_path = os.path.join(base, local_path.lstrip('/'))
        if os.path.exists(full_path):
            return os.path.abspath(full_path)
    
    return None

def migrate_all():
    """Migrate all files and update database"""
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("🚀 Complete Azure Migration")
        print("=" * 60)
        print()
        
        # Track statistics
        stats = {
            'events_updated': 0,
            'partners_updated': 0,
            'users_updated': 0,
            'files_uploaded': 0,
            'errors': 0
        }
        
        # Import models inside app context
        from app.models.event import Event
        from app.models.partner import Partner
        from app.models.user import User
        
        # 1. Migrate Event poster images
        print("📸 Migrating Event poster images...")
        events = Event.query.filter(Event.poster_image.isnot(None)).all()
        print(f"   Found {len(events)} events with poster images")
        
        for event in events:
            if not event.poster_image:
                continue
            
            # Skip if already Azure URL
            if 'blob.core.windows.net' in event.poster_image:
                print(f"   ⏭️  Event {event.id} ({event.title[:30]}...): Already using Azure")
                continue
            
            # Find local file
            local_path = find_local_file(event.poster_image)
            
            if local_path and os.path.exists(local_path):
                print(f"   📤 Event {event.id} ({event.title[:30]}...): Uploading to Azure...")
                azure_url = upload_file_to_azure(local_path, folder='events')
                
                if azure_url:
                    old_path = event.poster_image
                    event.poster_image = azure_url
                    db.session.commit()
                    stats['events_updated'] += 1
                    stats['files_uploaded'] += 1
                    print(f"      ✅ Updated: {azure_url[:80]}...")
                else:
                    stats['errors'] += 1
                    print(f"      ❌ Failed to upload")
            else:
                print(f"   ⚠️  Event {event.id}: Local file not found: {event.poster_image}")
                stats['errors'] += 1
        
        print()
        
        # 2. Migrate Partner logos
        print("🏢 Migrating Partner logos...")
        partners = Partner.query.filter(Partner.logo.isnot(None)).all()
        print(f"   Found {len(partners)} partners with logos")
        
        for partner in partners:
            if not partner.logo:
                continue
            
            # Skip if already Azure URL
            if 'blob.core.windows.net' in partner.logo:
                print(f"   ⏭️  Partner {partner.id} ({partner.business_name[:30]}...): Already using Azure")
                continue
            
            # Find local file
            local_path = find_local_file(partner.logo)
            
            if local_path and os.path.exists(local_path):
                print(f"   📤 Partner {partner.id} ({partner.business_name[:30]}...): Uploading to Azure...")
                azure_url = upload_file_to_azure(local_path, folder='logos')
                
                if azure_url:
                    old_path = partner.logo
                    partner.logo = azure_url
                    db.session.commit()
                    stats['partners_updated'] += 1
                    stats['files_uploaded'] += 1
                    print(f"      ✅ Updated: {azure_url[:80]}...")
                else:
                    stats['errors'] += 1
                    print(f"      ❌ Failed to upload")
            else:
                print(f"   ⚠️  Partner {partner.id}: Local file not found: {partner.logo}")
                stats['errors'] += 1
        
        print()
        
        # 3. Migrate User profile pictures
        print("👤 Migrating User profile pictures...")
        users = User.query.filter(User.profile_picture.isnot(None)).all()
        print(f"   Found {len(users)} users with profile pictures")
        
        for user in users:
            if not user.profile_picture:
                continue
            
            # Skip if already Azure URL
            if 'blob.core.windows.net' in user.profile_picture:
                print(f"   ⏭️  User {user.id} ({user.email}): Already using Azure")
                continue
            
            # Find local file
            local_path = find_local_file(user.profile_picture)
            
            if local_path and os.path.exists(local_path):
                print(f"   📤 User {user.id} ({user.email}): Uploading to Azure...")
                azure_url = upload_file_to_azure(local_path, folder='profiles')
                
                if azure_url:
                    old_path = user.profile_picture
                    user.profile_picture = azure_url
                    db.session.commit()
                    stats['users_updated'] += 1
                    stats['files_uploaded'] += 1
                    print(f"      ✅ Updated: {azure_url[:80]}...")
                else:
                    stats['errors'] += 1
                    print(f"      ❌ Failed to upload")
            else:
                print(f"   ⚠️  User {user.id}: Local file not found: {user.profile_picture}")
                stats['errors'] += 1
        
        print()
        print("=" * 60)
        print("📊 Migration Summary")
        print("=" * 60)
        print(f"✅ Events updated: {stats['events_updated']}")
        print(f"✅ Partners updated: {stats['partners_updated']}")
        print(f"✅ Users updated: {stats['users_updated']}")
        print(f"📤 Files uploaded to Azure: {stats['files_uploaded']}")
        print(f"❌ Errors: {stats['errors']}")
        print()
        print("🎉 Migration complete! All database records now use Azure URLs.")
        print("   New uploads will automatically go to Azure.")

if __name__ == '__main__':
    try:
        migrate_all()
    except KeyboardInterrupt:
        print("\n\nMigration interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

