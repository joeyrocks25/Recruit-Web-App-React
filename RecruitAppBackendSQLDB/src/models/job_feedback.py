# src/models/job_feedback.py
from src.models import db

class JobFeedback(db.Model):
    __tablename__ = 'JobFeedback'
    __table_args__ = {'schema': 'dbo'}

    ID = db.Column(db.Integer, primary_key=True, name='ID')
    JobID = db.Column(db.Integer, name='JobID')
    CosmosDBUserID = db.Column(db.String(255), name='CosmosDBUserID')
    IsLiked = db.Column(db.Boolean, name='IsLiked')
    CreatedAt = db.Column(db.DateTime, name='CreatedAt')
