#!/usr/bin/env python3
"""
Simple script to update database records - run this while Flask server is running
or use the same DATABASE_URL environment variable
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Print instructions
print("=" * 60)
print("Azure Database Migration")
print("=" * 60)
print()
print("This script will update your database records to use Azure URLs.")
print("Make sure your Flask server is running and can access the database.")
print()
print("Option 1: Run this as a Flask CLI command")
print("  flask shell")
print("  >>> exec(open('update_db_azure_urls.py').read())")
print()
print("Option 2: Use the API endpoint (recommended)")
print("  The migration endpoint will be available at:")
print("  POST /api/admin/migrate-to-azure")
print()
print("Option 3: Run the migration script directly")
print("  python migrate_db_to_azure.py")
print()
print("For now, let's check what files need to be migrated...")
print()

# Check local files
uploads_path = os.path.join(os.path.dirname(__file__), '..', 'uploads')
if os.path.exists(uploads_path):
    print(f"📁 Found uploads folder: {uploads_path}")
    for root, dirs, files in os.walk(uploads_path):
        for file in files:
            if not file.startswith('.'):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, uploads_path)
                print(f"   - {rel_path}")
else:
    print(f"⚠️  Uploads folder not found at: {uploads_path}")

print()
print("To complete the migration, you need to:")
print("1. Ensure all local files are uploaded to Azure (use migrate_to_azure.py)")
print("2. Update database records with Azure URLs")
print()
print("The easiest way is to use the Flask app's database connection.")
print("Contact me to create an admin API endpoint for this migration.")

