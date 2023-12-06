# src/routes/job_application_routes.py
from flask import jsonify, Blueprint, request, current_app
from src.models.job_application import db, JobApplication
import logging


job_applications_bp = Blueprint('job_applications', __name__)

@job_applications_bp.route('/jobapplications', methods=['GET'])
def get_job_applications():
    with current_app.app_context():
        job_id = request.args.get('JobID')

        if job_id:
            job_applications = JobApplication.query.filter_by(JobID=job_id).all()
        else:
            job_applications = JobApplication.query.all()

        result = []
        for job_application in job_applications:
            result.append({
                'JobApplicationID': job_application.JobApplicationID,
                'JobID': job_application.JobID,
                'CosmosDBUserID': job_application.CosmosDBUserID,
                'CreatedAt': job_application.CreatedAt,
            })
        return jsonify(result)

@job_applications_bp.route('/jobapplications', methods=['POST'])
def create_job_application():
    data = request.get_json()

    existing_application = JobApplication.query.filter_by(
        JobID=data['JobID'],
        CosmosDBUserID=data['CosmosDBUserID']
    ).first()

    if existing_application:
        return jsonify({'message': 'Job application already exists for this user and job'}), 400
    
    with current_app.app_context():
        new_job_application = JobApplication(
            JobID=data['JobID'],
            CosmosDBUserID=data['CosmosDBUserID']
        )

        db.session.add(new_job_application)
        db.session.commit()

        return jsonify({'message': 'Job application created successfully'}), 201


@job_applications_bp.route('/jobapplications/<int:job_application_id>', methods=['PUT'])
def update_job_application(job_application_id):
    data = request.get_json()
    with current_app.app_context():
        job_application = JobApplication.query.get(job_application_id)
        if not job_application:
            return jsonify({'message': 'Job application not found'}), 404

        job_application.JobID = data.get('JobID', job_application.JobID)
        job_application.CosmosDBUserID = data.get('CosmosDBUserID', job_application.CosmosDBUserID)

        db.session.commit()
        return jsonify({'message': 'Job application updated successfully'})

@job_applications_bp.route('/jobapplications/<int:job_application_id>', methods=['DELETE'])
def delete_job_application(job_application_id):
    with current_app.app_context():
        job_application = JobApplication.query.get(job_application_id)
        if not job_application:
            return jsonify({'message': 'Job application not found'}), 404

        db.session.delete(job_application)
        db.session.commit()
        return jsonify({'message': 'Job application deleted successfully'})

