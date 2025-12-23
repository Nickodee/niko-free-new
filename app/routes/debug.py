"""
Debug routes for checking Azure Blob Storage configuration
"""
from flask import Blueprint, jsonify, current_app

bp = Blueprint('debug', __name__)

@bp.route('/debug/azure-config', methods=['GET'])
def check_azure_config():
    """Check Azure Blob Storage configuration"""
    config = {
        'AZURE_STORAGE_USE_BLOB': current_app.config.get('AZURE_STORAGE_USE_BLOB', False),
        'AZURE_STORAGE_CONTAINER': current_app.config.get('AZURE_STORAGE_CONTAINER', 'uploads'),
        'AZURE_STORAGE_ACCOUNT_NAME': current_app.config.get('AZURE_STORAGE_ACCOUNT_NAME'),
        'AZURE_STORAGE_ACCOUNT_KEY_SET': bool(current_app.config.get('AZURE_STORAGE_ACCOUNT_KEY')),
        'AZURE_STORAGE_CONNECTION_STRING_SET': bool(current_app.config.get('AZURE_STORAGE_CONNECTION_STRING')),
    }
    return jsonify(config), 200

