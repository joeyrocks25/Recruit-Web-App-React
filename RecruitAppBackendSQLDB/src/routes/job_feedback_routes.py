from flask import jsonify, Blueprint, request, current_app
from src.models.job_feedback import db, JobFeedback
import logging

job_feedback_bp = Blueprint('job_feedback', __name__)

@job_feedback_bp.route('/jobfeedback', methods=['GET'])
def get_job_feedback():
    with current_app.app_context():
        job_id = request.args.get('JobID')
        
        if job_id:
            job_feedback = JobFeedback.query.filter_by(JobID=job_id).all()
        else:
            job_feedback = JobFeedback.query.all()

        result = []
        for feedback in job_feedback:
            result.append({
                'ID': feedback.ID,
                'JobID': feedback.JobID,
                'CosmosDBUserID': feedback.CosmosDBUserID,
                'IsLiked': feedback.IsLiked,
                'CreatedAt': feedback.CreatedAt,
            })
        return jsonify(result)


@job_feedback_bp.route('/jobfeedback', methods=['POST'])
def create_job_feedback():
    data = request.get_json()

    with current_app.app_context():
        new_job_feedback = JobFeedback(
            JobID=data['JobID'],
            CosmosDBUserID=data['CosmosDBUserID'],
            IsLiked=data['IsLiked']
        )
        
        db.session.add(new_job_feedback)
        db.session.commit()
        return jsonify({'message': 'Job feedback created successfully'}), 201

@job_feedback_bp.route('/jobfeedback/<int:job_feedback_id>', methods=['PUT'])
def update_job_feedback(job_feedback_id):
    data = request.get_json()
    with current_app.app_context():
        feedback = JobFeedback.query.get(job_feedback_id)
        if not feedback:
            return jsonify({'message': 'Job feedback not found'}), 404

        feedback.JobID = data.get('JobID', feedback.JobID)
        feedback.CosmosDBUserID = data.get('CosmosDBUserID', feedback.CosmosDBUserID)
        feedback.IsLiked = data.get('IsLiked', feedback.IsLiked)

        db.session.commit()
        return jsonify({'message': 'Job feedback updated successfully'})

@job_feedback_bp.route('/jobfeedback/<int:job_feedback_id>', methods=['DELETE'])
def delete_job_feedback(job_feedback_id):
    with current_app.app_context():
        feedback = JobFeedback.query.get(job_feedback_id)
        if not feedback:
            return jsonify({'message': 'Job feedback not found'}), 404

        db.session.delete(feedback)
        db.session.commit()
        return jsonify({'message': 'Job feedback deleted successfully'})
