from flask import Flask, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask_cors import CORS
import datetime
import jwt
import os
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
CLIENT_ID = '420681993853-tg4m31m6ahi0g8fjffl3hs7gbcclps3c.apps.googleusercontent.com'
JWT_SECRET = 'your_strong_secret_key_here'  # Change this to a real secret key

# Mock database
users_db = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = data
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({
        "service": "TripGlide Auth",
        "status": "active",
        "endpoints": {
            "google_auth": "/api/auth/google (POST)",
            "protected": "/api/protected (GET)"
        },
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    token = request.json.get('token')
    if not token:
        return jsonify({"error": "Missing token"}), 400

    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(),
            CLIENT_ID
        )
        
        # Check if user exists or create new
        user_id = idinfo['sub']
        if user_id not in users_db:
            users_db[user_id] = {
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'picture': idinfo.get('picture', ''),
                'created_at': datetime.datetime.utcnow().isoformat()
            }

        # Create JWT token
        token_data = {
            "user_id": user_id,
            "email": idinfo['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }
        auth_token = jwt.encode(token_data, JWT_SECRET, algorithm='HS256')

        return jsonify({
            "success": True,
            "token": auth_token,
            "user": {
                "id": user_id,
                "email": idinfo['email'],
                "name": idinfo.get('name', ''),
                "picture": idinfo.get('picture', '')
            }
        })
        
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": "Invalid token",
            "message": str(e)
        }), 401

@app.route('/api/protected')
@token_required
def protected(current_user):
    return jsonify({
        "message": "Protected route accessed",
        "user": current_user
    })

if __name__ == '__main__':
    app.run(port=3000, debug=True)