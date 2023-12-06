from azure.cosmos import CosmosClient
import uuid

cosmos_uri = "https://recruitment-app-cosmos-account-1.documents.azure.com:443/"
cosmos_key = "ukOSNAM3JCUgyeal810uknkB69H6Ow58Wxqp16ZoOumVgKfU5khsU6YnA59bfuPCuiPRyQrYRXwGACDbcu1ZpQ=="
cosmos_db_name = "RecruitmentAppDB"
container_name = "UsersContainer"

# Initialize Cosmos DB client
cosmos_client = CosmosClient(cosmos_uri, cosmos_key)
cosmos_db = cosmos_client.get_database_client(cosmos_db_name)
container = cosmos_db.get_container_client(container_name)

# Define the document to insert
user_document = {
    'id': str(uuid.uuid4()),
    "username": "testuser",
    "password": "testpassword",
    "email": "testuser@example.com"
}

# Insert the document into the container
container.create_item(body=user_document)

print("User inserted successfully.")
