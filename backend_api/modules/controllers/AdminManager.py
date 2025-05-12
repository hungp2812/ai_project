from User import User, UserRole
from UserManager import UserManager
from werkzeug.security import generate_password_hash
from bson import ObjectId

class AdminManager(UserManager):
    """
    AdminManager is a subclass of UserManager that provides additional functionality for managing users.
    It includes methods for adding, removing, and updating user roles, as well as managing user permissions.
    """

    def __init__(self, user_id: str):
        super().__init__(user_id)
        if self.user.role != UserRole.ADMIN:
            raise ValueError("Only admins can use AdminManager.")

    def add_user(self, data: dict):
        """
        Adds a new user to the system.
        """
        # Logic to add a new user (e.g., insert into database)
        if "password" not in data or "username" not in data or "email" not in data:
            raise ValueError("Missing required fields: username, email, or password")
    
        data["password"] = generate_password_hash(data["password"])
        data["role"] = data.get("role", UserRole.USER.value)
        inserted = self.db.get_table("users").insert_one(data)
        return {"message": "User added successfully", "user_id": str(inserted.inserted_id)}

    def remove_user(self, user_id: str):
        """
        Removes a user from the system by their ObjectId.
        """
        if not ObjectId.is_valid(user_id):
            raise ValueError("Invalid user ID format")

        result = self.db.get_table("users").delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            return {"error": "User not found or already deleted"}
        return {"message": "User removed successfully"}

    def update_user_role(self, user_id: str, new_role: UserRole):
        """
        Updates the role of an existing user.
        """
        if not ObjectId.is_valid(user_id):
            raise ValueError("Invalid user ID format")

        result = self.db.get_table("users").update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": new_role.value}}
        )
        
        if result.matched_count == 0:
            return {"error": "User not found"}
        return {"message": "User role updated successfully"}