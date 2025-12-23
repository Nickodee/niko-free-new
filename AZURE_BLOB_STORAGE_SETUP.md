# Azure Blob Storage Setup Guide

This guide will help you set up Azure Blob Storage for file uploads in the NikoFree application.

## Prerequisites

- Azure account with an active subscription
- Azure CLI installed (optional, for command-line setup)
- Access to Azure Portal

## Step 1: Create Azure Storage Account

### Option A: Using Azure Portal

1. Log in to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Storage account" and select it
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource group**: Create new or select existing
   - **Storage account name**: e.g., `nikofreestorage` (must be globally unique)
   - **Region**: Choose closest to your app (e.g., `canadacentral`)
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally Redundant Storage) for cost savings, or GRS for higher availability
6. Click "Review + create", then "Create"

### Option B: Using Azure CLI

```bash
az storage account create \
  --name nikofreestorage \
  --resource-group your-resource-group \
  --location canadacentral \
  --sku Standard_LRS
```

## Step 2: Create Container

### Option A: Using Azure Portal

1. Navigate to your storage account
2. Click "Containers" in the left menu
3. Click "+ Container"
4. Enter:
   - **Name**: `uploads`
   - **Public access level**: Select "Blob (anonymous read access for blobs only)"
5. Click "Create"

### Option B: Using Azure CLI

```bash
az storage container create \
  --name uploads \
  --account-name nikofreestorage \
  --public-access blob
```

## Step 3: Get Connection String or Access Keys

### Option A: Connection String (Recommended)

1. In Azure Portal, go to your storage account
2. Click "Access keys" in the left menu
3. Click "Show" next to "Connection string" under "key1"
4. Copy the connection string

### Option B: Account Name and Key

1. In Azure Portal, go to your storage account
2. Click "Access keys" in the left menu
3. Copy:
   - **Storage account name**: e.g., `nikofreestorage`
   - **key1** value (click "Show" to reveal)

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env` file or Azure App Service configuration:

### Using Connection String (Recommended)

```env
AZURE_STORAGE_USE_BLOB=True
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=nikofreestorage;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net    
AZURE_STORAGE_CONTAINER=uploads
```

### Using Account Name and Key

```env
AZURE_STORAGE_USE_BLOB=True
AZURE_STORAGE_ACCOUNT_NAME=nikofreestorage
AZURE_STORAGE_ACCOUNT_KEY=YOUR_ACCOUNT_KEY
AZURE_STORAGE_CONTAINER=uploads
```

## Step 5: Update Azure App Service Configuration

If deploying to Azure App Service:

1. Go to Azure Portal → Your App Service
2. Click "Configuration" in the left menu
3. Click "Application settings"
4. Add each environment variable as a new application setting
5. Click "Save"

## Step 6: Test the Integration

1. Restart your Flask application
2. Upload a file through your application
3. Check that the file URL returned is an Azure Blob Storage URL (format: `https://{account}.blob.core.windows.net/{container}/{blob_path}`)
4. Verify the file is accessible via the URL

## How It Works

- When `AZURE_STORAGE_USE_BLOB=True`, the application will automatically use Azure Blob Storage for all file uploads
- Files are uploaded to the specified container with the folder structure preserved
- The function returns the full Azure Blob Storage URL instead of a local path
- If Azure upload fails, it automatically falls back to local storage
- File deletion also works with Azure Blob Storage URLs

## Troubleshooting

### Files not uploading to Azure

1. **Check environment variables**: Ensure `AZURE_STORAGE_USE_BLOB=True` is set
2. **Verify credentials**: Check that connection string or account name/key are correct
3. **Check container exists**: Ensure the container name matches `AZURE_STORAGE_CONTAINER`
4. **Check permissions**: Ensure the storage account allows public blob access if needed
5. **Check logs**: Look for error messages in application logs

### Files uploading but not accessible

1. **Check container access level**: Should be "Blob" for public read access
2. **Verify URL format**: URLs should be in format `https://{account}.blob.core.windows.net/{container}/{blob_path}`
3. **Check CORS settings**: If accessing from a web app, configure CORS in Azure Storage account

### Fallback to local storage

If Azure upload fails, the system automatically falls back to local storage. Check:
- Azure credentials are correct
- Network connectivity to Azure
- Storage account is active and not disabled

## Cost Considerations

- **Storage**: Pay for what you use (typically $0.0184 per GB/month for LRS)
- **Transactions**: Pay per operation (read/write/delete)
- **Data transfer**: Outbound data transfer may incur costs
- **Recommendation**: Use LRS for development, GRS for production

## Security Best Practices

1. **Use connection strings in environment variables**, never commit to git
2. **Rotate access keys** regularly
3. **Use Azure Key Vault** for production deployments
4. **Set up CORS** properly if accessing from web applications
5. **Use private containers** for sensitive files and generate SAS tokens for access

## Migration from Local Storage

If you have existing files in local storage:

1. Upload existing files to Azure Blob Storage using Azure Storage Explorer or CLI
2. Update database records to use Azure Blob URLs instead of local paths
3. Test thoroughly before removing local files

## Support

For issues or questions:
- Check Azure Storage documentation: https://docs.microsoft.com/azure/storage/
- Review application logs for detailed error messages
- Verify Azure Storage account status in Azure Portal

