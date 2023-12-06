# src/data/cosmosdb.py
from azure.cosmos import CosmosClient
from flask import Flask, jsonify
from azure.cosmos.exceptions import CosmosResourceNotFoundError
from azure.cosmos import exceptions

from datetime import datetime
import uuid

def initialize_cosmos_db(app: Flask):
    # Initialize Cosmos DB client based on app.config
    app.cosmos_client = CosmosClient(
        app.config["COSMOSDB_URI"],
        app.config["COSMOSDB_KEY"]
    )
    app.cosmos_db = app.cosmos_client.get_database_client(app.config["COSMOSDB_DBNAME"])

def get_users(app: Flask):
    with app.app_context():
        container = app.cosmos_db.get_container_client("UsersContainer")
        query = "SELECT * FROM UsersContainer"
        items = list(container.query_items(query, enable_cross_partition_query=True))

        users = []
        for item in items:
            users.append(item)

        return users

def get_user_by_id(app: Flask, user_id):
    with app.app_context():
        container = app.cosmos_db.get_container_client("UsersContainer")
        try:
            # Update the query to retrieve all user details based on user_id
            query = f"SELECT * FROM UsersContainer u WHERE u.id = '{user_id}'"
            items = list(container.query_items(query, enable_cross_partition_query=True))

            if items:
                return items[0]  # Assuming there's only one user with the given user_id
            else:
                return None
        except CosmosResourceNotFoundError:
            return None

def create_user(container, user_data):  
    # Generate a unique identifier (UUID) for the user
    user_id = str(uuid.uuid4())

    # Add the generated user_id to the user_data
    user_data["id"] = user_id

    # Add CreatedAt with the current timestamp
    user_data["CreatedAt"] = datetime.utcnow().isoformat()

    try:
        response = container.create_item(body=user_data)
        return response
    except exceptions.CosmosHttpResponseError as e:
        print(f"Error creating user: {e}")
        return None

def update_user(app: Flask, user_id, updated_data):
    with app.app_context():
        container = app.cosmos_db.get_container_client("UsersContainer")
        current_user = get_user_by_id(app, user_id)

        if current_user:
            # Create a new dictionary with the updated values
            updated_user = {**current_user, **updated_data}
            
            # Remove system properties before upserting the item
            updated_user.pop("_attachments", None)
            updated_user.pop("_etag", None)
            updated_user.pop("_rid", None)
            updated_user.pop("_self", None)
            updated_user.pop("_ts", None)

            response = container.upsert_item(body=updated_user)
            return response
        else:
            return None

def delete_user(app: Flask, user_id):
    with app.app_context():
        container = app.cosmos_db.get_container_client("UsersContainer")
        
        # Print all user IDs in the collection for debugging
        all_user_ids = [item['id'] for item in container.read_all_items()]
        print(f"All user IDs in the collection: {all_user_ids}")

        print(f"Attempting to delete user with ID: {user_id}")
        try:
            container.delete_item(item=user_id, partition_key=user_id)  # Use 'id' as the partition key
            print(f"Deletion successful for user with ID: {user_id}")
            return jsonify({"message": "User deleted successfully"})
        except CosmosResourceNotFoundError:
            print(f"User not found with ID: {user_id}")
            return jsonify({"error": "User not found"}), 404
        except Exception as e:
            print(f"Failed to delete user with ID: {user_id}. Error: {str(e)}")
            return jsonify({"error": "Failed to delete user"}), 500