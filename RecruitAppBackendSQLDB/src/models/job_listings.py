# src/models/job_listings.py
from src.models import db

class JobListings(db.Model):
    __tablename__ = 'JobListings'
    __table_args__ = {'schema': 'dbo'}

    ID = db.Column(db.Integer, primary_key=True, name='ID')
    CosmosDBUserID = db.Column(db.String(255), name='CosmosDBUserID')
    Title = db.Column(db.String(255), name='Title')
    Company = db.Column(db.String(255), name='Company')
    Description = db.Column(db.String(1000), name='Description')
    LikesCount = db.Column(db.Integer, name='LikesCount')
    DislikesCount = db.Column(db.Integer, name='DislikesCount')
    CreatedAt = db.Column(db.DateTime, name='CreatedAt')
