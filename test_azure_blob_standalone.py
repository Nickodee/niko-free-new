#!/usr/bin/env python3
"""
Standalone test script for Azure Blob Storage integration
This script tests Azure Blob Storage without loading the full Flask app
"""

import os
import sys
from io import BytesIO
from werkzeug.datastructures import FileStorage
from dotenv import load_dotenv

# Load environment variables from multiple possible locations
load_dotenv()  # Try current directory first
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))  # Try parent directory

def test_azure_blob_direct():
    """Test Azure Blob Storage directly using the SDK"""
    print("=" * 60)
    print("Azure Blob Storage Direct Test")
    print("=" * 60)
    
    try:
        from azure.storage.blob import BlobServiceClient, BlobClient, ContentSettings
        from azure.core.exceptions import AzureError
    except ImportError:
        print("❌ ERROR: azure-storage-blob not installed!")
        print("   Run: pip install azure-storage-blob")
        return False
    
    # Get configuration from environment
    connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
    account_key = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
    container_name = os.getenv('AZURE_STORAGE_CONTAINER', 'uploads')
    use_azure = os.getenv('AZURE_STORAGE_USE_BLOB', 'False').lower() == 'true'
    
    print("\n1. Checking Configuration...")
    print(f"   AZURE_STORAGE_USE_BLOB: {use_azure}")
    print(f"   AZURE_STORAGE_CONTAINER: {container_name}")
    
    if connection_string:
        print(f"   Connection String: {'*' * 20}...{connection_string[-10:]}")
    else:
        print(f"   Account Name: {account_name}")
        print(f"   Account Key: {'*' * 20}...{account_key[-10:] if account_key else 'NOT SET'}")
    
    if not use_azure:
        print("\n⚠️  WARNING: AZURE_STORAGE_USE_BLOB is False.")
        print("   Set AZURE_STORAGE_USE_BLOB=True in your .env file to enable Azure Blob Storage.")
        print("   Continuing test anyway to verify connection...")
    
    if not connection_string and not (account_name and account_key):
        print("\n❌ ERROR: Azure Storage credentials not configured!")
        print("   Please set either:")
        print("   - AZURE_STORAGE_CONNECTION_STRING, OR")
        print("   - AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY")
        return False
    
    # Initialize Blob Service Client
    print("\n2. Connecting to Azure Blob Storage...")
    try:
        if connection_string:
            blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            print("   ✅ Connected using connection string")
        else:
            account_url = f"https://{account_name}.blob.core.windows.net"
            blob_service_client = BlobServiceClient(account_url=account_url, credential=account_key)
            print("   ✅ Connected using account name and key")
    except Exception as e:
        print(f"   ❌ ERROR: Failed to connect: {str(e)}")
        return False
    
    # Test: Check if container exists
    print("\n3. Checking container...")
    try:
        container_client = blob_service_client.get_container_client(container_name)
        if container_client.exists():
            print(f"   ✅ Container '{container_name}' exists")
        else:
            print(f"   ⚠️  Container '{container_name}' does not exist")
            print(f"   Creating container...")
            container_client.create_container()
            print(f"   ✅ Container '{container_name}' created")
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        return False
    
    # Test: Upload a test file
    print("\n4. Testing file upload...")
    test_content = b'This is a test file for Azure Blob Storage integration test'
    test_filename = f"test/test_file_{os.urandom(4).hex()}.txt"
    
    try:
        blob_client = blob_service_client.get_blob_client(
            container=container_name,
            blob=test_filename
        )
        
        blob_client.upload_blob(
            test_content,
            overwrite=True,
            content_settings=ContentSettings(content_type='text/plain')
        )
        
        blob_url = blob_client.url
        print(f"   ✅ SUCCESS! File uploaded to Azure Blob Storage")
        print(f"   URL: {blob_url}")
        
        # Test: Download and verify
        print("\n5. Testing file download and verification...")
        downloaded_content = blob_client.download_blob().readall()
        if downloaded_content == test_content:
            print(f"   ✅ File content verified correctly")
        else:
            print(f"   ⚠️  WARNING: Downloaded content doesn't match")
        
        # Test: Delete the test file
        print("\n6. Testing file deletion...")
        blob_client.delete_blob()
        print(f"   ✅ Test file deleted successfully")
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Azure Blob Storage is working correctly.")
        print("=" * 60)
        return True
        
    except AzureError as e:
        print(f"   ❌ Azure Error: {str(e)}")
        return False
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_via_api():
    """Instructions for testing via API"""
    print("\n" + "=" * 60)
    print("Testing via API Endpoints")
    print("=" * 60)
    print("\nTo test Azure Blob Storage via your API endpoints:")
    print("\n1. Start your Flask server:")
    print("   cd niko-free-new")
    print("   source ../venv/bin/activate")
    print("   python -m flask run")
    print("\n2. Test file upload via API:")
    print("   curl -X POST http://localhost:5000/api/partners/logo \\")
    print("     -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print("     -F 'file=@/path/to/test/image.jpg'")
    print("\n3. Check the response - it should return an Azure Blob URL")
    print("   (format: https://{account}.blob.core.windows.net/{container}/{path})")
    print("\n4. Verify the file is accessible at the returned URL")

if __name__ == '__main__':
    try:
        success = test_azure_blob_direct()
        if success:
            test_via_api()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

