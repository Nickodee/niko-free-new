#!/usr/bin/env python3
"""
Check if files are being uploaded to Azure and list files in Azure Blob Storage
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def check_azure_files():
    """List files in Azure Blob Storage"""
    try:
        from azure.storage.blob import BlobServiceClient, generate_account_sas, ResourceTypes, AccountSasPermissions
        from datetime import datetime, timedelta
        
        account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
        account_key = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
        container_name = os.getenv('AZURE_STORAGE_CONTAINER', 'uploads')
        
        if not account_name or not account_key:
            print("❌ Azure Storage credentials not found in environment variables")
            return
        
        print(f"📦 Connecting to Azure Storage Account: {account_name}")
        print(f"📁 Container: {container_name}\n")
        
        # Initialize Blob Service Client
        account_url = f"https://{account_name}.blob.core.windows.net"
        blob_service_client = BlobServiceClient(account_url=account_url, credential=account_key)
        
        # Get container client
        container_client = blob_service_client.get_container_client(container_name)
        
        # List all blobs
        print("🔍 Listing files in Azure Blob Storage:\n")
        blob_count = 0
        for blob in container_client.list_blobs():
            blob_count += 1
            # Generate SAS token for the blob
            sas_token = generate_account_sas(
                account_name=account_name,
                account_key=account_key,
                resource_types=ResourceTypes(object=True),
                permission=AccountSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(days=365)
            )
            blob_url = f"https://{account_name}.blob.core.windows.net/{container_name}/{blob.name}?{sas_token}"
            
            print(f"  {blob_count}. {blob.name}")
            print(f"     Size: {blob.size} bytes")
            print(f"     Modified: {blob.last_modified}")
            print(f"     URL: {blob_url}\n")
        
        if blob_count == 0:
            print("  ⚠️  No files found in Azure Blob Storage")
            print("  This means files are being stored locally, not in Azure")
        else:
            print(f"\n✅ Found {blob_count} file(s) in Azure Blob Storage")
        
    except ImportError:
        print("❌ azure-storage-blob not installed. Run: pip install azure-storage-blob")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    check_azure_files()

