from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from modules.utils.db_connector import dbConnector
import os

def create_admin_user():
    
    db = dbConnector()
    if db is None:
        print("❌ Database connection failed.")
        return
    
    users = db.get_table("users")

    if users.find_one({"username": "admin"}):
        print("✅ Admin user already exists.")
        return

    admin_user = {
        "username": "admin",
        "password": generate_password_hash("admin123"),  # 👈 bạn có thể đổi password này
        "email": "admin@example.com",
        "role": "admin",  # 👈 bạn có thể đổi role này
        # "UserRole": "admin"
    }

    users.insert_one(admin_user)
    print("✅ Admin user created: username=admin, password=admin123")

if __name__ == "__main__":
    create_admin_user()
