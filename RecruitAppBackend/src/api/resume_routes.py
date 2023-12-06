# Import the required modules
import logging
from flask import Blueprint, jsonify, request, current_app
from src.data.cosmosdb_resume import get_resumes, create_resume, update_resume, delete_resumes_by_user_id

# Create a Blueprint for the resumes
bp = Blueprint("resume", __name__, url_prefix="/api/resumes")

# Route to handle resumes
@bp.route("/", methods=["GET", "POST", "DELETE"])
def handle_resumes():
    if request.method == "GET":
        user_id = request.args.get("user_id")
        resumes = get_resumes(current_app, user_id=user_id)
        return jsonify(resumes)
    elif request.method == "POST":
        new_resume_data = request.get_json()
        container = current_app.cosmos_db.get_container_client("ResumesContainer")
        response = create_resume(container, new_resume_data["UserID"], new_resume_data)
        
        if response:
            return jsonify({"message": "Resume created successfully"})
        else:
            return jsonify({"error": "Failed to create resume"}), 500
    elif request.method == "DELETE":
        user_id = request.args.get("user_id")
        response = delete_resumes_by_user_id(current_app, user_id)
        if response:
            return jsonify({"message": f"All resumes for user ID {user_id} deleted successfully"})
        else:
            return jsonify({"error": f"Failed to delete resumes for user ID {user_id}"}), 500

# Route to handle updating a resume
@bp.route("/<user_id>", methods=["PUT"])
def handle_update_resume(user_id):
    updated_data = request.get_json()
    response = update_resume(current_app, user_id, updated_data)
    
    if response:
        return jsonify({"message": "Resume updated successfully"})
    else:
        return jsonify({"error": "Failed to update resume"}), 500
