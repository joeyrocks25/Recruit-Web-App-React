import logging
from flask import Blueprint, jsonify, request, current_app
from src.data.cosmosdb_jobs import (
    get_job_listings,
    create_job_listing,
    update_job_listing,
    delete_job_listing_by_id,
)
from flask_cors import CORS

# Create a Blueprint for the job listings
bp = Blueprint("job_listings", __name__, url_prefix="/api/job-listings")

# Enable CORS for the /api/users route
# CORS(bp, resources={r"/api/job-listings/*": {"origins": "*"}})

# Route to handle job listings
@bp.route("/", methods=["GET", "POST", "DELETE"])
def handle_job_listings():
    
    user_id = request.args.get("user_id")  
    
    if request.method == "GET":
        job_listings = get_job_listings(current_app, user_id=user_id)
        return jsonify(job_listings)
    elif request.method == "POST":
        new_job_listing_data = request.get_json()
        container = current_app.cosmos_db_job_listings.get_container_client("JobListingsContainer")
        response = create_job_listing(container, user_id, new_job_listing_data)
        if response:
            return jsonify({"message": "Job listing created successfully"})
        else:
            return jsonify({"error": "Failed to create job listing"}), 500
    elif request.method == "DELETE":
        job_listing_id = request.args.get("job_listing_id")
        if job_listing_id:
            response = delete_job_listing_by_id(current_app, user_id, job_listing_id)
            if response:
                return response
            else:
                return jsonify({"error": "Failed to delete job listing"}), 500 
        else:
            response = delete_job_listings_by_user_id(current_app, user_id)
            if response:
                return jsonify({"message": f"All job listings for user ID {user_id} deleted successfully"})
            else:
                return jsonify({"error": f"Failed to delete job listings for user ID {user_id}"}), 500


# Route to handle DELETE requests with user_id and job_listing_id
@bp.route("/<user_id>/<job_listing_id>", methods=["DELETE"])
def handle_delete_job_listing(user_id, job_listing_id):
    response = delete_job_listing_by_id(current_app, user_id, job_listing_id)
    if response:
        return response
    else:
        return jsonify({"error": "Failed to delete job listing"}), 500

# New route to handle PUT requests for updating job listings
@bp.route("/<user_id>/<job_listing_id>", methods=["PUT"])
def handle_update_job_listing(user_id, job_listing_id):
    updated_data = request.get_json()
    response = update_job_listing(current_app, user_id, updated_data)
    if response:
        return jsonify({"message": "Job listing updated successfully"})
    else:
        return jsonify({"error": "Failed to update job listing"}), 500
