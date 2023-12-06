# src/api/auth.py
from flask import Blueprint, jsonify, request, current_app
import jwt
from datetime import datetime, timedelta
from flask_cors import CORS

# Create a Blueprint named "auth" with the URL prefix "/api/auth"
bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Enable CORS for the "auth" Blueprint with a wildcard for origins
# CORS(bp, resources={r"/api/auth/*": {"origins": "*"}})

# User login endpoint
# Retrieves login data from the request, validates credentials, and returns a JWT token for authentication.
@bp.route("/login", methods=["POST"])
def login():
    try:
        login_data = request.get_json()
        username = login_data.get("username")
        password = login_data.get("password")

        user = get_user_by_username(username)

        if user and user.get("password") == password:
            token = generate_jwt_token(user)
            return jsonify({"token": token})

        return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Failed to process login request: {str(e)}"}), 500


# Function to get user information by username from Cosmos DB
def get_user_by_username(username):
    with current_app.app_context():
        container = current_app.cosmos_db.get_container_client("UsersContainer")
        query = f"SELECT * FROM UsersContainer u WHERE u.username = @username"
        options = {
            "enable_cross_partition_query": True,
        }
        items = list(container.query_items(query, parameters=[{"name": "@username", "value": username}], enable_cross_partition_query=True))
        return items[0] if items else None


# Function to generate a JWT token for user authentication
def generate_jwt_token(user_data):

    expiration_time = datetime.utcnow() + timedelta(hours=1)
    
    payload = {
        "email": user_data["email"],
        "filelocation": user_data["filelocation"],
        "filename": user_data["filename"],
        "filepath": user_data["filepath"],
        "id": user_data["id"],
        "password": user_data["password"],
        "username": user_data["username"],
    }
    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )
    return token

