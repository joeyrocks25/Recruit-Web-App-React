# src/models/job_application.py
from src.models import db

class JobApplication(db.Model):
    __tablename__ = 'JobApplications'
    __table_args__ = {'schema': 'dbo'}

    JobApplicationID = db.Column(db.Integer, primary_key=True, name='JobApplicationID')
    JobID = db.Column(db.Integer, name='JobID')
    CosmosDBUserID = db.Column(db.String(255), name='CosmosDBUserID')
    CreatedAt = db.Column(db.DateTime, name='CreatedAt')
