from User import User, UserRole
from modules.utils.db_connector import dbConnector
# from werkzeug.security import generate_password_hash
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

        self.db.get_table("users").update_one(
            {"_id": ObjectId(self.user.user_id)},
            {"$set": data}
        )

        return "User information updated successfully."
        
    def face_recognition(self):
        # Placeholder for face recognition logic
        # This would typically involve loading the image and running a face recognition algorithm
        
        camera_feed = self.__get_camera_feed()

        if (camera_feed is None):
            return "Failed to access camera feed."
        
        image = self.__get_image()

        if (image is None):
            return "Failed to retrieve image."
        
        face_recognition_result = "Face recognized successfully"  # Placeholder for actual 

        if (face_recognition_result is None):
            return "Face recognition failed."
        
        self.user.latest_face_recognition = face_recognition_result
        # Here you would typically save the face recognition result to a database or perform further actions

        return face_recognition_result
    
    def __get_camera_feed(self):
        # Placeholder for camera feed logic
        # This would typically involve accessing a camera stream and returning the feed
        return "Camera feed accessed successfully"
    
    def __get_image(self):
        # Placeholder for image retrieval logic
        # This would typically involve accessing an image file and returning it
        return "Image retrieved successfully"
        
    def __repr__(self):
        return f"UserManager(user={self.user})"