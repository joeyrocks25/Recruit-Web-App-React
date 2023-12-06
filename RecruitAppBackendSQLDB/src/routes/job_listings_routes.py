# src/routes/job_listings_routes.py
from flask import jsonify, Blueprint, request, current_app
from src.models.job_listings import db, JobListings
import logging

job_listings_bp = Blueprint('job_listings', __name__)

@job_listings_bp.route('/joblistings', methods=['GET'])
def get_job_listings():
    with current_app.app_context():
        cosmos_db_user_id = request.args.get('CosmosDBUserID')

        if cosmos_db_user_id:
            job_listings = JobListings.query.filter_by(CosmosDBUserID=cosmos_db_user_id).all()
        else:
            job_listings = JobListings.query.all()

        result = []
        for job_listing in job_listings:
            result.append({
                'ID': job_listing.ID,
                'CosmosDBUserID': job_listing.CosmosDBUserID,
                'Title': job_listing.Title,
                'Company': job_listing.Company,
                'Description': job_listing.Description,
                'LikesCount': job_listing.LikesCount,
                'DislikesCount': job_listing.DislikesCount,
                'CreatedAt': job_listing.CreatedAt,
            })
        return jsonify(result)

@job_listings_bp.route('/joblistings', methods=['POST'])
def create_job_listing():
    data = request.get_json()

    with current_app.app_context():
        new_job_listing = JobListings(
            CosmosDBUserID=data['CosmosDBUserID'],
            Title=data['Title'],
            Company=data['Company'],
            Description=data['Description'],
            LikesCount=data.get('LikesCount', 0),
            DislikesCount=data.get('DislikesCount', 0),
        )
        
        db.session.add(new_job_listing)
        db.session.commit()
        return jsonify({'message': 'Job listing created successfully'}), 201

@job_listings_bp.route('/joblistings/<int:job_listing_id>', methods=['PUT'])
def update_job_listing(job_listing_id):
    data = request.get_json()
    with current_app.app_context():
        job_listing = JobListings.query.get(job_listing_id)
        if not job_listing:
            return jsonify({'message': 'Job listing not found'}), 404

        job_listing.CosmosDBUserID = data.get('CosmosDBUserID', job_listing.CosmosDBUserID)
        job_listing.Title = data.get('Title', job_listing.Title)
        job_listing.Company = data.get('Company', job_listing.Company)
        job_listing.Description = data.get('Description', job_listing.Description)
        job_listing.LikesCount = data.get('LikesCount', job_listing.LikesCount)
        job_listing.DislikesCount = data.get('DislikesCount', job_listing.DislikesCount)

        db.session.commit()
        return jsonify({'message': 'Job listing updated successfully'})

@job_listings_bp.route('/joblistings/<int:job_listing_id>', methods=['DELETE'])
def delete_job_listing(job_listing_id):
    with current_app.app_context():
        job_listing = JobListings.query.get(job_listing_id)
        if not job_listing:
            return jsonify({'message': 'Job listing not found'}), 404

        db.session.delete(job_listing)
        db.session.commit()
        return jsonify({'message': 'Job listing deleted successfully'})
