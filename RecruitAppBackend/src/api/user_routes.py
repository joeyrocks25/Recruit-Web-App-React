from flask_cors import CORS 
from flask import Blueprint, jsonify, request, current_app
from src.data.cosmosdb import get_users, get_user_by_id, create_user, update_user, delete_user

# Create a Blueprint for user routes with the URL prefix "/api/users"
bp = Blueprint("user", __name__, url_prefix="/api/users")

# Enable CORS for the /api/users route
# CORS(bp, resources={r"/api/users/*": {"origins": "*"}})

# Route to handle GET and POST requests for users
@bp.route("/", methods=["GET", "POST"])
def handle_users():
    if request.method == "GET":
        try:
            users = get_users(current_app)
            return jsonify(users)
        except Exception as e:
            return jsonify({"error": f"Failed to retrieve users: {str(e)}"}), 500
    elif request.method == "POST":
        try:
            new_user_data = request.get_json()
            container = current_app.cosmos_db.get_container_client("UsersContainer")
            response = create_user(container, new_user_data)

            if response:
                return jsonify({"message": "User created successfully"})
            else:
                return jsonify({"error": "Failed to create user"}), 500
        except Exception as e:
            return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

# Route to handle GET, PUT, and DELETE requests for a specific user by user ID
@bp.route("/<user_id>", methods=["GET", "PUT", "DELETE"])
def handle_user(user_id):
    if request.method == "GET":
        user = get_user_by_id(current_app, user_id)
        if user:
            return jsonify(user)
        else:
            return jsonify({"error": "User not found"}), 404
    elif request.method == "PUT":
        updated_data = request.get_json()
        response = update_user(current_app, user_id, updated_data)
        if response:
            return jsonify({"message": "User updated successfully"})
        else:
            return jsonify({"error": "Failed to update user"}), 500
    elif request.method == "DELETE":
        response = delete_user(current_app, user_id)
        if response:
            return jsonify({"message": "User deleted successfully"})
        else:
            return jsonify({"error": "Failed to delete user"}), 500
