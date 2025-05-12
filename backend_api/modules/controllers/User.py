from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class User:
    def __init__(self, user_id: str, username: str, password: Optional[str], email: str, role: UserRole, latest_face_recognition: Optional[str] = None):
        """Initialize a User object with user ID, username, password, email, and role."""
        self.user_id = user_id
        self.username = username
        self.password = None
        self.email = email
        self.role = role
        self.latest_face_recognition = None  # Placeholder for face recognition data

    def __repr__(self):
        return f"User(user_id={self.user_id}, username={self.username}, email={self.email})"
    