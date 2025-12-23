#!/usr/bin/env python3
"""
Test creating an event with image upload to verify Azure integration
"""
import os
import sys
from dotenv import load_dotenv
from io import BytesIO

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from werkzeug.datastructures import FileStorage
from app.utils.file_upload import upload_file
from config import config

def test_event_image_upload():
    """Test uploading an event image"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    
    with app.app_context():
        print("=" * 60)
        print("🧪 Testing Event Image Upload to Azure")
        print("=" * 60)
        print()
        
        # Check configuration
        use_azure = app.config.get('AZURE_STORAGE_USE_BLOB', False)
        account_name = app.config.get('AZURE_STORAGE_ACCOUNT_NAME')
        
        print(f"📋 Configuration:")
        print(f"   AZURE_STORAGE_USE_BLOB: {use_azure}")
        print(f"   AZURE_STORAGE_ACCOUNT_NAME: {account_name}")
        print()
        
        if not use_azure:
            print("❌ Azure Blob Storage is not enabled!")
            print("   Set AZURE_STORAGE_USE_BLOB=True in your .env file")
            return False
        
        # Find a test image
        uploads_path = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'events')
        test_images = []
        
        if os.path.exists(uploads_path):
            for file in os.listdir(uploads_path):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    test_images.append(os.path.join(uploads_path, file))
        
        if not test_images:
            print("❌ No test images found in uploads/events/")
            print("   Please add an image file to test with")
            return False
        
        # Use the first available image
        test_image_path = test_images[0]
        test_image_name = os.path.basename(test_image_path)
        
        print(f"📤 Testing with image: {test_image_name}")
        print()
        
        # Create a FileStorage object
        with open(test_image_path, 'rb') as f:
            file_content = f.read()
            file_storage = FileStorage(
                stream=BytesIO(file_content),
                filename=test_image_name,
                content_type='image/jpeg' if test_image_name.lower().endswith(('.jpg', '.jpeg')) else 'image/png'
            )
            
            # Upload the file
            print("🔄 Uploading image...")
            result_url = upload_file(file_storage, folder='events')
            
            if result_url:
                print(f"✅ Upload successful!")
                print()
                print(f"📎 Result URL:")
                print(f"   {result_url}")
                print()
                
                # Check if it's an Azure URL
                if 'blob.core.windows.net' in result_url:
                    print("✅ Confirmed: Image uploaded to Azure Blob Storage!")
                    print(f"   Account: {account_name}")
                    print()
                    print("🌐 You can access this image at:")
                    print(f"   {result_url}")
                    return True
                else:
                    print("⚠️  Warning: URL doesn't look like Azure Blob Storage")
                    print("   It might be using local storage instead")
                    return False
            else:
                print("❌ Upload failed - returned None")
                return False

if __name__ == '__main__':
    try:
        success = test_event_image_upload()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

