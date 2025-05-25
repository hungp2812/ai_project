from User import User, UserRole
from modules.utils.db_connector import dbConnector
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
# from cv2 import VideoCapture, imshow

class UserManager:
    """
    UserManager is a class that manages user-related operations, including user information retrieval and updates.
    It also includes methods for face recognition and camera feed access.
    """
    def __init__(self, user_id: str):
        self.db = dbConnector()
        self.user = self.db.get_table("users").find_one({"_id": ObjectId(user_id)})
        if not self.user:
            raise ValueError("User not found.")
        
        # print(f"UserManager initialized for user: {self.user['username']}")
        # print("data: ", self.user)
        self.user = User(
            user_id=str(self.user["_id"]),
            username=self.user["username"],
            password=self.user["password"],
            email=self.user["email"],
            role=UserRole(self.user["role"]),
            latest_face_recognition=self.user.get("latest_face_recognition", None)
        )

    def get_user_info(self):
        return {
            "user_id": self.user.user_id,
            "username": self.user.username,
            "password": self.user.password,
            "email": self.user.email,
            "role": self.user.role.value,
            "latest_face_recognition": self.user.latest_face_recognition,
        }

    def update_user_info(self, data: dict):
        if data is None:
            raise ValueError("No data provided for update.")
        
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        if username:
            self.user.username = username
        if password:
            self.user.password = password
        if email:
            self.user.email = email
        # logic to update user info in the database can be added here

        # Update the user information in the database
        if "password" in data:
            data["password"] = generate_password_hash(data["password"])

        self.db.get_table("users").update_one(
            {"_id": ObjectId(self.user.user_id)},
            {"$set": data}
        )

        return "User information updated successfully."

    def verify_password(self, password: str):
        if password is None:
            raise ValueError("No password provided for verification.")
        
        # logic to verify the password can be added here
        if check_password_hash(self.user.password, password):
            return True
        else:
            return False
    
    def get_user_logs(self):
        """
        Retrieves the logs for the user.
        """
        log_collection = self.db.get_table("log_history")
        logs = log_collection.find({"user_id": self.user.user_id})
        return [log for log in logs]

    def __repr__(self):
        return f"UserManager(user={self.user})"