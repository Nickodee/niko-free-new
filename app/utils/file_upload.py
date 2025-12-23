import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app


def allowed_file(filename):
    """Check if file extension is allowed"""
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'pdf'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def upload_to_azure_blob(file, folder='general'):
    """
    Upload file to Azure Blob Storage
    
    Args:
        file: FileStorage object
        folder: Blob folder/prefix
        
    Returns:
        str: Blob URL with SAS token or None if failed
    """
    try:
        from azure.storage.blob import BlobServiceClient, BlobClient, ContentSettings, generate_account_sas, ResourceTypes, AccountSasPermissions
        from azure.core.exceptions import AzureError
        from datetime import datetime, timedelta
        
        if not file or file.filename == '':
            return None
        
        if not allowed_file(file.filename):
            raise ValueError('File type not allowed')
        
        # Get Azure Storage configuration
        connection_string = current_app.config.get('AZURE_STORAGE_CONNECTION_STRING')
        account_name = current_app.config.get('AZURE_STORAGE_ACCOUNT_NAME')
        account_key = current_app.config.get('AZURE_STORAGE_ACCOUNT_KEY')
        container_name = current_app.config.get('AZURE_STORAGE_CONTAINER', 'uploads')
        
        if not connection_string and not (account_name and account_key):
            raise ValueError('Azure Storage credentials not configured')
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{folder}/{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Initialize Blob Service Client and extract account name if needed
        if connection_string:
            blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            # Extract account name and key from connection string for SAS token generation
            if not account_name or not account_key:
                # Parse connection string to get account name and key
                for part in connection_string.split(';'):
                    if part.startswith('AccountName='):
                        account_name = part.split('=')[1]
                    elif part.startswith('AccountKey='):
                        account_key = part.split('=')[1]
        else:
            if not account_name or not account_key:
                raise ValueError('Azure Storage account name and key are required')
            account_url = f"https://{account_name}.blob.core.windows.net"
            blob_service_client = BlobServiceClient(account_url=account_url, credential=account_key)
        
        # Get blob client
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=unique_filename)
        
        # Determine content type
        content_type = file.content_type or 'application/octet-stream'
        if ext.lower() in ['.jpg', '.jpeg']:
            content_type = 'image/jpeg'
        elif ext.lower() == '.png':
            content_type = 'image/png'
        elif ext.lower() == '.gif':
            content_type = 'image/gif'
        elif ext.lower() == '.pdf':
            content_type = 'application/pdf'
        
        # Upload file
        file.seek(0)  # Reset file pointer
        blob_client.upload_blob(
            file,
            overwrite=True,
            content_settings=ContentSettings(content_type=content_type)
        )
        
        # Generate SAS token for secure access (valid for 1 year)
        # This allows access even when public access is disabled
        if account_name and account_key:
            sas_token = generate_account_sas(
                account_name=account_name,
                account_key=account_key,
                resource_types=ResourceTypes(object=True),
                permission=AccountSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(days=365)  # 1 year expiration
            )
            blob_url = f"{blob_client.url}?{sas_token}"
        else:
            # Fallback to regular URL (will work if public access is enabled)
            blob_url = blob_client.url
        
        return blob_url
        
    except ImportError:
        print("azure-storage-blob not installed. Using local file upload instead.")
        return None
    except AzureError as e:
        print(f"Error uploading to Azure Blob Storage: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error uploading to Azure Blob Storage: {str(e)}")
        return None


def upload_file(file, folder='general'):
    """
    Upload file and return path/URL
    Uses Azure Blob Storage if configured, otherwise uses local storage
    
    Args:
        file: FileStorage object from request
        folder: Subfolder name (e.g., 'events', 'partners', 'logos')
        
    Returns:
        str: URL or relative path to uploaded file or None if failed
    """
    if not file or file.filename == '':
        return None
    
    if not allowed_file(file.filename):
        raise ValueError('File type not allowed')
    
    # Check if Azure Blob Storage is enabled
    use_azure = current_app.config.get('AZURE_STORAGE_USE_BLOB', False)
    
    # Debug logging
    if current_app.config.get('DEBUG', False):
        print(f"[DEBUG] AZURE_STORAGE_USE_BLOB: {use_azure}")
        print(f"[DEBUG] AZURE_STORAGE_ACCOUNT_NAME: {current_app.config.get('AZURE_STORAGE_ACCOUNT_NAME')}")
    
    if use_azure:
        # Try Azure Blob Storage first
        blob_url = upload_to_azure_blob(file, folder)
        if blob_url:
            print(f"[DEBUG] File uploaded to Azure Blob Storage: {blob_url}")
            return blob_url
        # Fallback to local if Azure fails
        print("⚠️ Azure Blob Storage upload failed, falling back to local storage")
    
    # Local file upload (fallback or default)
    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
    
    # Create upload directory - ensure it's in parent directory (outside niko-free-new)
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    
    # If relative path, resolve to absolute path in parent directory
    if not os.path.isabs(upload_folder):
        # Get the app root (niko-free-new directory)
        app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        # Go up one level to parent directory
        parent_dir = os.path.dirname(app_root)
        upload_folder = os.path.join(parent_dir, upload_folder)
    
    target_folder = os.path.join(upload_folder, folder)
    os.makedirs(target_folder, exist_ok=True)
    
    # Save file
    filepath = os.path.join(target_folder, unique_filename)
    file.save(filepath)
    
    # Return relative path
    return f"/uploads/{folder}/{unique_filename}"


def delete_file(filepath):
    """Delete file from filesystem or Azure Blob Storage"""
    try:
        # Check if it's an Azure Blob URL
        if filepath and ('blob.core.windows.net' in filepath or filepath.startswith('https://')):
            # Delete from Azure Blob Storage
            return delete_from_azure_blob(filepath)
        
        # Local file deletion
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
            return True
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
    return False


def delete_from_azure_blob(blob_url):
    """
    Delete file from Azure Blob Storage
    
    Args:
        blob_url: Full URL of the blob to delete
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        from azure.storage.blob import BlobServiceClient
        from azure.core.exceptions import AzureError
        
        # Parse blob URL to get container and blob name
        # Format: https://{account}.blob.core.windows.net/{container}/{blob_path}
        if 'blob.core.windows.net' not in blob_url:
            return False
        
        # Get Azure Storage configuration
        connection_string = current_app.config.get('AZURE_STORAGE_CONNECTION_STRING')
        account_name = current_app.config.get('AZURE_STORAGE_ACCOUNT_NAME')
        account_key = current_app.config.get('AZURE_STORAGE_ACCOUNT_KEY')
        container_name = current_app.config.get('AZURE_STORAGE_CONTAINER', 'uploads')
        
        if not connection_string and not (account_name and account_key):
            return False
        
        # Initialize Blob Service Client
        if connection_string:
            blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        else:
            account_url = f"https://{account_name}.blob.core.windows.net"
            blob_service_client = BlobServiceClient(account_url=account_url, credential=account_key)
        
        # Extract blob name from URL (remove SAS token if present)
        # Format: https://{account}.blob.core.windows.net/{container}/{blob_path}?{sas_token}
        try:
            # Remove SAS token if present
            blob_url_clean = blob_url.split('?')[0]
            
            # Parse URL to extract blob name
            url_parts = blob_url_clean.split(f'/{container_name}/')
            if len(url_parts) > 1:
                blob_name = url_parts[1]
            else:
                # Fallback: try to extract from full URL
                parts = blob_url_clean.split('blob.core.windows.net/')
                if len(parts) > 1:
                    blob_name = parts[1].split('/', 1)[1] if '/' in parts[1] else parts[1]
                else:
                    return False
        except Exception:
            return False
        
        # Get blob client and delete
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        blob_client.delete_blob()
        
        return True
        
    except ImportError:
        print("azure-storage-blob not installed. Cannot delete from Azure Blob Storage.")
        return False
    except AzureError as e:
        print(f"Error deleting from Azure Blob Storage: {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error deleting from Azure Blob Storage: {str(e)}")
        return False


# For AWS S3 upload (optional)
def upload_to_s3(file, folder='general'):
    """
    Upload file to AWS S3
    
    Args:
        file: FileStorage object
        folder: S3 folder/prefix
        
    Returns:
        str: S3 URL or None if failed
    """
    try:
        import boto3
        from botocore.exceptions import ClientError
        
        if not file or file.filename == '':
            return None
        
        if not allowed_file(file.filename):
            raise ValueError('File type not allowed')
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{folder}/{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
            region_name=current_app.config.get('AWS_REGION')
        )
        
        # Upload file
        bucket_name = current_app.config.get('AWS_S3_BUCKET')
        s3_client.upload_fileobj(
            file,
            bucket_name,
            unique_filename,
            ExtraArgs={'ACL': 'public-read', 'ContentType': file.content_type}
        )
        
        # Return S3 URL
        return f"https://{bucket_name}.s3.amazonaws.com/{unique_filename}"
        
    except ClientError as e:
        print(f"Error uploading to S3: {str(e)}")
        return None
    except ImportError:
        print("boto3 not installed. Using local file upload instead.")
        return upload_file(file, folder)

