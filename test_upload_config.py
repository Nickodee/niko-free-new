#!/usr/bin/env python3
"""
Test if Azure is configured and being used for uploads
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Create a minimal Flask app context to test config
from flask import Flask
from config import config

app = Flask(__name__)
app.config.from_object(config['default'])

with app.app_context():
    print("=" * 60)
    print("Azure Blob Storage Configuration Check")
    print("=" * 60)
    print()
    
    use_blob = app.config.get('AZURE_STORAGE_USE_BLOB', False)
    account_name = app.config.get('AZURE_STORAGE_ACCOUNT_NAME')
    account_key = app.config.get('AZURE_STORAGE_ACCOUNT_KEY')
    container = app.config.get('AZURE_STORAGE_CONTAINER', 'uploads')
    
    print(f"AZURE_STORAGE_USE_BLOB: {use_blob}")
    print(f"AZURE_STORAGE_ACCOUNT_NAME: {account_name}")
    print(f"AZURE_STORAGE_ACCOUNT_KEY: {'SET' if account_key else 'NOT SET'}")
    print(f"AZURE_STORAGE_CONTAINER: {container}")
    print()
    
    if not use_blob:
        print("❌ Azure Blob Storage is DISABLED")
        print("   Files will be stored locally, not in Azure")
        print("   Set AZURE_STORAGE_USE_BLOB=True in your .env file")
    elif not account_name or not account_key:
        print("❌ Azure credentials are missing")
        print("   Files will fall back to local storage")
    else:
        print("✅ Azure Blob Storage is ENABLED and configured")
        print("   New uploads should go to Azure Blob Storage")
        print()
        print("⚠️  NOTE: Existing files in your database may still have local paths")
        print("   New uploads will use Azure URLs")

