#!/usr/bin/env python3
"""
Test script for Azure Blob Storage integration
Run this script to test your Azure Blob Storage configuration locally
"""

import os
import sys
from io import BytesIO
from werkzeug.datastructures import FileStorage
from dotenv import load_dotenv
from flask import Flask

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Create a minimal Flask app for testing
app = Flask(__name__)
app.config.from_object('config.Config')

# Import file upload functions
from app.utils.file_upload import upload_file, upload_to_azure_blob, delete_from_azure_blob

def create_test_file(filename='test_image.jpg', content=b'fake image content'):
    """Create a test file object"""
    file_obj = BytesIO(content)
    file_storage = FileStorage(
        stream=file_obj,
        filename=filename,
        content_type='image/jpeg'
    )
    return file_storage

def test_azure_blob_storage():
    """Test Azure Blob Storage upload and delete"""
    print("=" * 60)
    print("Azure Blob Storage Test")
    print("=" * 60)
    
    # Use Flask app context
    with app.app_context():
        # Check configuration
        print("\n1. Checking Configuration...")
        use_azure = app.config.get('AZURE_STORAGE_USE_BLOB', False)
        connection_string = app.config.get('AZURE_STORAGE_CONNECTION_STRING')
        account_name = app.config.get('AZURE_STORAGE_ACCOUNT_NAME')
        account_key = app.config.get('AZURE_STORAGE_ACCOUNT_KEY')
        container = app.config.get('AZURE_STORAGE_CONTAINER', 'uploads')
        
        print(f"   AZURE_STORAGE_USE_BLOB: {use_azure}")
        print(f"   AZURE_STORAGE_CONTAINER: {container}")
        
        if connection_string:
            print(f"   Connection String: {'*' * 20}...{connection_string[-10:]}")
        else:
            print(f"   Account Name: {account_name}")
            print(f"   Account Key: {'*' * 20}...{account_key[-10:] if account_key else 'NOT SET'}")
        
        if not use_azure:
            print("\n⚠️  WARNING: AZURE_STORAGE_USE_BLOB is False. Azure Blob Storage will not be used.")
            print("   Set AZURE_STORAGE_USE_BLOB=True in your .env file to enable Azure Blob Storage.")
            return False
        
        if not connection_string and not (account_name and account_key):
            print("\n❌ ERROR: Azure Storage credentials not configured!")
            print("   Please set either:")
            print("   - AZURE_STORAGE_CONNECTION_STRING, OR")
            print("   - AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY")
            return False
        
        # Test 1: Direct Azure Blob upload
        print("\n2. Testing Direct Azure Blob Upload...")
        test_file = create_test_file('test_azure.jpg', b'This is a test file for Azure Blob Storage')
        try:
            blob_url = upload_to_azure_blob(test_file, folder='test')
            if blob_url:
                print(f"   ✅ SUCCESS! File uploaded to Azure Blob Storage")
                print(f"   URL: {blob_url}")
                
                # Test 2: Delete from Azure Blob
                print("\n3. Testing Azure Blob Delete...")
                if delete_from_azure_blob(blob_url):
                    print(f"   ✅ SUCCESS! File deleted from Azure Blob Storage")
                else:
                    print(f"   ⚠️  WARNING: Could not delete file (may not exist or already deleted)")
            else:
                print(f"   ❌ FAILED: upload_to_azure_blob returned None")
                return False
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
        # Test 3: Using upload_file (should use Azure when configured)
        print("\n4. Testing upload_file() function (should use Azure)...")
        test_file2 = create_test_file('test_upload_file.jpg', b'This is another test file')
        try:
            result_url = upload_file(test_file2, folder='test')
            if result_url:
                print(f"   ✅ SUCCESS! File uploaded via upload_file()")
                print(f"   URL: {result_url}")
                
                # Check if it's an Azure URL
                if 'blob.core.windows.net' in result_url:
                    print(f"   ✅ Confirmed: Using Azure Blob Storage (URL contains 'blob.core.windows.net')")
                else:
                    print(f"   ⚠️  WARNING: URL doesn't look like Azure Blob Storage URL")
                    print(f"   This might be using local storage instead")
                
                # Clean up
                if 'blob.core.windows.net' in result_url:
                    print("\n5. Cleaning up test file...")
                    if delete_from_azure_blob(result_url):
                        print(f"   ✅ Test file deleted successfully")
            else:
                print(f"   ❌ FAILED: upload_file returned None")
                return False
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Azure Blob Storage is working correctly.")
        print("=" * 60)
        return True

if __name__ == '__main__':
    try:
        success = test_azure_blob_storage()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

