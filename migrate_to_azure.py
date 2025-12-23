#!/usr/bin/env python3
"""
Migrate local files to Azure Blob Storage and generate Azure URLs
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def migrate_file_to_azure(local_file_path, folder='events'):
    """Upload a local file to Azure Blob Storage"""
    try:
        from azure.storage.blob import BlobServiceClient, ContentSettings, generate_account_sas, ResourceTypes, AccountSasPermissions
        from datetime import datetime, timedelta
        import uuid
        from werkzeug.utils import secure_filename
        
        account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
        account_key = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
        container_name = os.getenv('AZURE_STORAGE_CONTAINER', 'uploads')
        
        if not account_name or not account_key:
            print("❌ Azure Storage credentials not found")
            return None
        
        # Get filename from local path
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
        print(f"❌ Error uploading {local_file_path}: {str(e)}")
        return None

def find_and_migrate_files():
    """Find local files and migrate them to Azure"""
    # Check both current directory and parent directory
    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        upload_folder = os.path.join('..', 'uploads')
        if not os.path.exists(upload_folder):
            print(f"❌ Upload folder not found in current or parent directory")
            return
    
    upload_folder = os.path.abspath(upload_folder)
    print(f"📁 Using upload folder: {upload_folder}")
    
    print(f"🔍 Scanning local uploads folder: {upload_folder}\n")
    
    migrated = []
    failed = []
    
    # Walk through all subdirectories
    for root, dirs, files in os.walk(upload_folder):
        for file in files:
            if file.startswith('.'):
                continue
            
            local_path = os.path.join(root, file)
            # Get folder name (e.g., 'events', 'logos', 'profiles')
            folder = os.path.basename(root) if root != upload_folder else 'general'
            
            print(f"📤 Uploading: {local_path} → Azure/{folder}/")
            
            azure_url = migrate_file_to_azure(local_path, folder)
            
            if azure_url:
                migrated.append({
                    'local': local_path,
                    'azure_url': azure_url,
                    'folder': folder
                })
                print(f"   ✅ Success: {azure_url}\n")
            else:
                failed.append(local_path)
                print(f"   ❌ Failed\n")
    
    # Summary
    print("\n" + "="*60)
    print("📊 Migration Summary")
    print("="*60)
    print(f"✅ Successfully migrated: {len(migrated)} file(s)")
    print(f"❌ Failed: {len(failed)} file(s)")
    
    if migrated:
        print("\n📋 Azure URLs:")
        for item in migrated:
            print(f"\n  Local: {item['local']}")
            print(f"  Azure: {item['azure_url']}")
    
    return migrated

if __name__ == '__main__':
    print("="*60)
    print("🚀 Migrating Local Files to Azure Blob Storage")
    print("="*60)
    print()
    
    migrated = find_and_migrate_files()
    
    if migrated:
        print("\n💡 Tip: Update your database records with the new Azure URLs")
        print("   The local files are still there - you can delete them after verifying Azure uploads")

