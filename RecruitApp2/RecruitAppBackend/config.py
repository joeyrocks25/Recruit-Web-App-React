class Config:
  # Cosmos DB configuration
  COSMOSDB_URI = "https://recruitment-app-cosmos-account-1.documents.azure.com:443/"
  COSMOSDB_KEY = "ukOSNAM3JCUgyeal810uknkB69H6Ow58Wxqp16ZoOumVgKfU5khsU6YnA59bfuPCuiPRyQrYRXwGACDbcu1ZpQ=="
  COSMOSDB_DBNAME = "RecruitmentAppDB"
  
  # Flask configuration
  DEBUG = True  # Set to False in production
  SECRET_KEY = "test123"  # Replace with a secure random key
