from pymongo import MongoClient

import os

class dbConnector:
    # Singleton instance of the class
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(dbConnector, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
        return cls._instance
    
    def __init__(self):
        if self.client is None:
            self.connect()
    
    def connect(self):
        if self.client is None:
            try:
                # MongoDB connection string
                mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
                self.client = MongoClient(mongo_uri)
                self.db = self.client["ai_project"]
                print("Connected to MongoDB")
            except Exception as e:
                print(f"Error connecting to MongoDB: {e}")
                return None
        return self.client

    def get_table(self, table_name: str):
        if self.db is None:
            print("Database not connected.")
            return None
        return self.db["users"]
    