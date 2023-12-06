from flask import Flask
from flask_cors import CORS

from src.models import db

from src.routes.job_application_routes import job_applications_bp
from src.routes.job_listings_routes import job_listings_bp
from src.routes.job_feedback_routes import job_feedback_bp

app = Flask(__name__)
app.config.from_pyfile('config.py')

# Initialize SQLAlchemy with the Flask app
db.init_app(app)
CORS(app)

# Register blueprints
app.register_blueprint(job_applications_bp)
app.register_blueprint(job_listings_bp)
app.register_blueprint(job_feedback_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
