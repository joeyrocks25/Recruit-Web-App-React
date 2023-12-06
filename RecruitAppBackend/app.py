from flask import Flask
from src.api import user_routes, resume_routes, job_routes
from src.data import cosmosdb, cosmosdb_resume, cosmosdb_jobs
from src.api import auth
from flask_cors import CORS

app = Flask(__name__)

app.config.from_object("config.Config")

# Initialize Azure Cosmos DB
cosmosdb.initialize_cosmos_db(app)
cosmosdb_resume.initialize_cosmos_db_resume(app)
cosmosdb_jobs.initialize_cosmos_db_job_listings(app)
CORS(app)

# Register API routes
app.register_blueprint(auth.bp)
app.register_blueprint(user_routes.bp)
app.register_blueprint(resume_routes.bp)
app.register_blueprint(job_routes.bp)


if __name__ == "__main__":
    app.run(debug=True)
