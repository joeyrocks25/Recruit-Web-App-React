from azure.cosmos import CosmosClient, exceptions
from flask import Flask, jsonify
from azure.cosmos.exceptions import CosmosResourceNotFoundError
import uuid

def initialize_cosmos_db_job_listings(app: Flask):
    # Initialize Cosmos DB client based on app.config
    app.cosmos_client_job_listings = CosmosClient(
        app.config["COSMOSDB_URI"],
        app.config["COSMOSDB_KEY"]
    )
    app.cosmos_db_job_listings = app.cosmos_client_job_listings.get_database_client(app.config["COSMOSDB_DBNAME"])

def get_job_listings(app: Flask, user_id=None):
    with app.app_context():
        container = app.cosmos_db_job_listings.get_container_client("JobListingsContainer")
        query = "SELECT * FROM JobListingsContainer j"

        if user_id:
            query += f" WHERE CONTAINS(j.UserID, '{user_id}')"

        items = list(container.query_items(query, enable_cross_partition_query=True))

        job_listings = []
        for item in items:
            job_listings.append(item)

        return job_listings

def get_job_listing_by_id(app: Flask, user_id, job_listing_id):
    with app.app_context():
        container = app.cosmos_db_job_listings.get_container_client("JobListingsContainer")
        try:
            response = container.read_item(item=job_listing_id, partition_key=user_id)
            return response
        except CosmosResourceNotFoundError:
            return None

def create_job_listing(container, user_id, job_listing_data):
    # Generate a unique identifier (UUID) for the job listing
    job_listing_id = str(uuid.uuid4())

    # Add the generated job_listing_id and user_id to the job_listing_data
    job_listing_data["id"] = job_listing_id
    job_listing_data["UserID"] = user_id

    try:
        response = container.create_item(body=job_listing_data)
        return response
    except exceptions.CosmosHttpResponseError as e:
        print(f"Error creating job listing: {e}")
        return None

def update_job_listing(app: Flask, user_id, updated_data):
    with app.app_context():
        container = app.cosmos_db_job_listings.get_container_client("JobListingsContainer")
        
        # Query the container to get the job listing associated with the user ID
        query = f"SELECT * FROM JobListingsContainer j WHERE CONTAINS(j.UserID, '{user_id}')"
        items = list(container.query_items(query, enable_cross_partition_query=True))

        if items:
            # Assuming there's only one job listing per user, take the first one
            current_job_listing = items[0]

            # Create a new dictionary with the updated values
            updated_job_listing = {**current_job_listing, **updated_data}
            
            # Remove system properties before upserting the item
            updated_job_listing.pop("_attachments", None)
            updated_job_listing.pop("_etag", None)
            updated_job_listing.pop("_rid", None)
            updated_job_listing.pop("_self", None)
            updated_job_listing.pop("_ts", None)

            response = container.upsert_item(body=updated_job_listing)
            return response
        else:
            return None

def delete_job_listing_by_id(app: Flask, user_id, job_listing_id):
    with app.app_context():
        container = app.cosmos_db_job_listings.get_container_client("JobListingsContainer")

        try:
            # Delete the job listing by ID and partition key (UserID)
            container.delete_item(item=job_listing_id, partition_key=user_id)
            print(f"Deletion successful for job listing with ID: {job_listing_id} for user ID: {user_id}")

            return jsonify({"message": f"Job listing with ID {job_listing_id} deleted successfully"})
        except CosmosResourceNotFoundError:
            print(f"No job listing found with ID {job_listing_id} for user ID: {user_id}")
            return jsonify({"error": f"No job listing found with ID {job_listing_id} for user ID: {user_id}"}), 404
        except Exception as e:
            print(f"Failed to delete job listing with ID {job_listing_id} for user ID: {user_id}. Error: {str(e)}")
            return jsonify({"error": f"Failed to delete job listing with ID {job_listing_id} for user ID: {user_id}"}), 500

