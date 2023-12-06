# src/api/auth.py
from flask import Blueprint, jsonify, request, current_app
import jwt
from datetime import datetime, timedelta
from flask_cors import CORS  # Import the CORS module


# auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Enable CORS for the /api/users route
CORS(bp, resources={r"/api/auth/*": {"origins": "*"}})

@bp.route("/login", methods=["POST"])
def login():
    try:
        login_data = request.get_json()
        username = login_data.get("username")
        password = login_data.get("password")

        # Fetch user data from the Cosmos DB based on the username
        user = get_user_by_username(username)

        if user and user.get("password") == password:
            # Generate JWT token with user details
            token = generate_jwt_token(user)
            return jsonify({"token": token})

        return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Failed to process login request: {str(e)}"}), 500

def get_user_by_username(username):
    with current_app.app_context():
        container = current_app.cosmos_db.get_container_client("UsersContainer")
        query = f"SELECT * FROM UsersContainer u WHERE u.username = @username"
        options = {
            "enable_cross_partition_query": True,
        }
        items = list(container.query_items(query, parameters=[{"name": "@username", "value": username}], enable_cross_partition_query=True))
        return items[0] if items else None

def generate_jwt_token(user_data):
    # Set the expiration time for the token (e.g., 1 hour)
    expiration_time = datetime.utcnow() + timedelta(hours=1)
    
    # Include additional user details in the payload
    payload = {
        "email": user_data["email"],
        "filelocation": user_data["filelocation"],
        "filename": user_data["filename"],
        "filepath": user_data["filepath"],
        "id": user_data["id"],
        "password": user_data["password"],
        "username": user_data["username"],
    }

    # Create the JWT token
    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )
    print(token)
    return token
