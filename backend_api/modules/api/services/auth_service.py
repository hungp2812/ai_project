from werkzeug.security import check_password_hash
from flask import session
from modules.utils.db_connector import dbConnector

def authenticate_user(username: str, password: str):
    """
    Authenticate a user by checking their email and password against the database.
    Returns the user document if authentication is successful, otherwise returns None.
    """
    db = dbConnector()
    user = db.get_table("users").find_one({"username": username})
    if user and check_password_hash(user["password"], password):
        return user
    return None

def login_user(user):
    """
    Store user information in the session after successful authentication.
    """
    session["user_id"] = str(user["_id"])
    session["role"] = user.get("UserRole", "user")

def logout_user():
    """
    Clear the session to log out the user.
    """
    session.pop("user_id", None)
    session.pop("role", None)
