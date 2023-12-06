from azure.cosmos import CosmosClient, exceptions
from flask import Flask, jsonify
from azure.cosmos.exceptions import CosmosResourceNotFoundError
import uuid

def initialize_cosmos_db_resume(app: Flask):
    # Initialize Cosmos DB client based on app.config
    app.cosmos_client_resume = CosmosClient(
        app.config["COSMOSDB_URI"],
        app.config["COSMOSDB_KEY"]
    )
    app.cosmos_db_resume = app.cosmos_client_resume.get_database_client(app.config["COSMOSDB_DBNAME"])

def get_resumes(app: Flask, user_id=None):
    with app.app_context():
        container = app.cosmos_db_resume.get_container_client("ResumesContainer")
        query = "SELECT * FROM ResumesContainer r"

        if user_id:
            query += f" WHERE CONTAINS(r.UserID, '{user_id}')"

        items = list(container.query_items(query, enable_cross_partition_query=True))

        resumes = []
        for item in items:
            resumes.append(item)

        return resumes



def get_resume_by_id(app: Flask, user_id, resume_id):
    with app.app_context():
        container = app.cosmos_db_resume.get_container_client("ResumesContainer")
        try:
            response = container.read_item(item=resume_id, partition_key=user_id)
            return response
        except CosmosResourceNotFoundError:
            return None

def create_resume(container, user_id, resume_data):  
    # Generate a unique identifier (UUID) for the resume
    resume_id = str(uuid.uuid4())

    # Add the generated resume_id and user_id to the resume_data
    resume_data["id"] = resume_id
    resume_data["UserID"] = user_id

    try:
        response = container.create_item(body=resume_data)
        return response
    except exceptions.CosmosHttpResponseError as e:
        print(f"Error creating resume: {e}")
        return None

def update_resume(app: Flask, user_id, updated_data):
    with app.app_context():
        container = app.cosmos_db_resume.get_container_client("ResumesContainer")
        
        # Query the container to get the resume associated with the user ID
        query = f"SELECT * FROM ResumesContainer r WHERE CONTAINS(r.UserID, '{user_id}')"
        items = list(container.query_items(query, enable_cross_partition_query=True))

        if items:
            # Assuming there's only one resume per user, take the first one
            current_resume = items[0]

            # Create a new dictionary with the updated values
            updated_resume = {**current_resume, **updated_data}
            
            # Remove system properties before upserting the item
            updated_resume.pop("_attachments", None)
            updated_resume.pop("_etag", None)
            updated_resume.pop("_rid", None)
            updated_resume.pop("_self", None)
            updated_resume.pop("_ts", None)

            response = container.upsert_item(body=updated_resume)
            return response
        else:
            return None



def delete_resumes_by_user_id(app: Flask, user_id):
    with app.app_context():
        container = app.cosmos_db_resume.get_container_client("ResumesContainer")
        
        # Print all resume IDs in the collection for debugging
        all_resume_ids = [item['id'] for item in container.read_all_items()]
        print(f"All resume IDs in the collection: {all_resume_ids}")

        print(f"Attempting to delete all resumes for user ID: {user_id}")
        try:
            # Query the container to get all resumes associated with the user ID
            query = f"SELECT * FROM ResumesContainer r WHERE r.UserID = '{user_id}'"
            items = list(container.query_items(query, enable_cross_partition_query=True))

            for item in items:
                resume_id = item.get("id")
                container.delete_item(item=resume_id, partition_key=user_id)
                print(f"Deletion successful for resume with ID: {resume_id} for user ID: {user_id}")

            return jsonify({"message": f"All resumes for user ID {user_id} deleted successfully"})
        except CosmosResourceNotFoundError:
            print(f"No resumes found for user ID: {user_id}")
            return jsonify({"error": f"No resumes found for user ID: {user_id}"}), 404
        except Exception as e:
            print(f"Failed to delete resumes for user ID: {user_id}. Error: {str(e)}")
            return jsonify({"error": f"Failed to delete resumes for user ID: {user_id}"}), 500
