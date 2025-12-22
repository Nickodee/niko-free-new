from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User
from app.models.partner import Partner, PartnerStaff


def user_required(fn):
    """Decorator to require user authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
            
        return fn(current_user=user, *args, **kwargs)
    
    return wrapper


def partner_required(fn):
    """Decorator to require partner or staff authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        
        # Check if it's a staff member (identity format: "staff_{id}")
        if isinstance(identity, str) and identity.startswith('staff_'):
            staff_id = int(identity.replace('staff_', ''))
            staff = PartnerStaff.query.get(staff_id)
            
            if not staff or not staff.is_active:
                return jsonify({'error': 'Staff account not found or inactive'}), 404
            
            if not staff.partner.is_active:
                return jsonify({'error': 'Partner account is suspended'}), 403
            
            if staff.partner.status != 'approved':
                return jsonify({'error': 'Partner account not approved yet'}), 403
            
            # Pass both staff and partner to the function
            return fn(current_partner=staff.partner, current_staff=staff, *args, **kwargs)
        else:
            # Regular partner login
            partner = Partner.query.get(identity)
            
            if not partner:
                return jsonify({'error': 'Partner not found'}), 404
            
            if not partner.is_active:
                return jsonify({'error': 'Account is suspended'}), 403
            
            if partner.status != 'approved':
                return jsonify({'error': 'Account not approved yet'}), 403
                
            return fn(current_partner=partner, current_staff=None, *args, **kwargs)
    
    return wrapper


def admin_required(fn):
    """Decorator to require admin authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Check if user is admin
        if not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
            
        return fn(current_admin=user, *args, **kwargs)
    
    return wrapper


def optional_user(fn):
    """Decorator for optional user authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            return fn(current_user=user, *args, **kwargs)
        except:
            return fn(current_user=None, *args, **kwargs)
    
    return wrapper

