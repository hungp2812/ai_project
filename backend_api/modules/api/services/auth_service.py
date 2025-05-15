from werkzeug.security import check_password_hash, generate_password_hash
from flask import session
from modules.utils.db_connector import dbConnector

def authenticate_user(email: str, password: str, role: str):
    """
    Authenticate a user by checking their email and password against the database.
    Returns the user document if authentication is successful, otherwise returns None.
    """
    db = dbConnector()
    user = db.get_table("users").find_one({"email": email})
    
    if user and check_password_hash(user["password"], password):
        # if role == "admin" and user.get("role") != "admin":
        #     return None
        # return user
        if user.get("role") == role:
            return user
        else:
            return None
    return None

def login_user(user):
    """
    Store user information in the session after successful authentication.
    """
    session["user_id"] = str(user["_id"])
    session["role"] = user.get("role", "user")

def logout_user():
    """
    Clear the session to log out the user.
    """
    session.pop("user_id", None)
    session.pop("role", None)

def register_user(username: str, password: str, email: str):
    """
    Register a new user by inserting their information into the database.
    Returns the ID of the newly created user.
    """
    db = dbConnector()
    if db.get_table("users").find_one({"username": username}):
        raise ValueError("Username already exists")
    if db.get_table("users").find_one({"email": email}):
        raise ValueError("Email already exists")

    user_id = db.get_table("users").insert_one({
        "username": username,
        "password": generate_password_hash(password),
        "email": email
    }).inserted_id
    return user_id