# Azure Blob Storage Server Debugging Guide

## Issue: Images Still Being Saved as Local Paths Instead of Azure URLs

If you're seeing local paths like `/uploads/events/filename.jpg` instead of Azure URLs like `https://nikofreestorage.blob.core.windows.net/uploads/events/filename.jpg?[SAS_TOKEN]`, follow these steps:

## 1. Check Environment Variables on Server

Make sure these environment variables are set in your Azure App Service (or wherever your server is running):

```bash
AZURE_STORAGE_USE_BLOB=True
AZURE_STORAGE_ACCOUNT_NAME=nikofreestorage
AZURE_STORAGE_ACCOUNT_KEY=your_account_key_here
AZURE_STORAGE_CONTAINER=uploads
# OR use connection string instead:
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=nikofreestorage;AccountKey=...;EndpointSuffix=core.windows.net
```

### How to Set in Azure App Service:
1. Go to Azure Portal → Your App Service
2. Settings → Configuration → Application settings
3. Add/Edit the environment variables above
4. **Save** and **Restart** the app service

## 2. Verify the Code Changes

The following files have been updated:

### `app/routes/partners.py` - `create_event()` function
- ✅ Now handles FormData (not just JSON)
- ✅ Uploads `poster_image` file if present
- ✅ Uses `upload_file()` which checks Azure config

### `app/utils/file_upload.py` - `upload_file()` function
- ✅ Checks `AZURE_STORAGE_USE_BLOB` config
- ✅ Attempts Azure upload first
- ✅ Falls back to local storage if Azure fails
- ✅ Added detailed logging for debugging

## 3. Check Server Logs

After creating an event, check your server logs for these messages:

### Success (Azure Upload):
```
[FILE UPLOAD] AZURE_STORAGE_USE_BLOB: True
[FILE UPLOAD] AZURE_STORAGE_ACCOUNT_NAME: nikofreestorage
[FILE UPLOAD] Attempting Azure Blob Storage upload...
[FILE UPLOAD] ✅ Successfully uploaded to Azure Blob Storage: https://...
[EVENT CREATE] Poster uploaded: https://...
```

### Failure (Falling back to local):
```
[FILE UPLOAD] AZURE_STORAGE_USE_BLOB: False
[FILE UPLOAD] Azure Blob Storage is disabled, using local storage
```
OR
```
[FILE UPLOAD] AZURE_STORAGE_USE_BLOB: True
[FILE UPLOAD] Attempting Azure Blob Storage upload...
❌ [AZURE UPLOAD] Error: ...
⚠️ [FILE UPLOAD] Azure Blob Storage upload failed, falling back to local storage
```

## 4. Common Issues and Solutions

### Issue 1: `AZURE_STORAGE_USE_BLOB` is False
**Solution**: Set `AZURE_STORAGE_USE_BLOB=True` in environment variables and restart the server.

### Issue 2: Missing Azure Credentials
**Solution**: Ensure either:
- `AZURE_STORAGE_CONNECTION_STRING` is set, OR
- Both `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY` are set

### Issue 3: Azure SDK Not Installed
**Solution**: Install the package:
```bash
pip install azure-storage-blob==12.27.1
```

### Issue 4: Server Not Restarted After Config Change
**Solution**: **Always restart the Azure App Service** after changing environment variables.

### Issue 5: Container Doesn't Exist
**Solution**: Ensure the container `uploads` exists in your Azure Storage Account.

## 5. Test Upload

After fixing the configuration:

1. Create a new event with an image
2. Check the server logs for upload messages
3. Check the event response - `poster_image` should be an Azure URL
4. Verify the image is accessible at the Azure URL

## 6. Verify Azure Storage Account

1. Go to Azure Portal → Storage Account → `nikofreestorage`
2. Go to Containers → `uploads`
3. Check if new files are being uploaded there
4. Verify the files have proper permissions (SAS tokens)

## 7. Migration of Existing Files

If you have existing events with local paths, use the migration endpoint:

```bash
POST /api/admin/migrate-to-azure
```

This will:
- Find all events/partners/users with local image paths
- Upload them to Azure Blob Storage
- Update the database with Azure URLs

## Summary

The main issue is usually:
1. **Environment variables not set** on the server
2. **Server not restarted** after setting environment variables
3. **Azure credentials incorrect** or missing

Check the server logs first - they will tell you exactly what's happening!


