from User import User, UserRole
from UserManager import UserManager

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
        self.db.get_table("users").insert_one(data)
        return "User added successfully."

    def remove_user(self, user_id: str):
        """
        Removes a user from the system by their user ID.
        """
        # Logic to remove a user (e.g., delete from database)
        self.db.get_table("users").delete_one({"user_id": user_id})
        return "User removed successfully."

    def update_user_role(self, user_id: str, new_role: UserRole):
        """
        Updates the role of an existing user.
        """
        # Logic to update user role (e.g., update in database)
        self.db.get_table("users").update_one(
            {"user_id": user_id},
            {"$set": {"role": new_role.value}}
        )
        return "User role updated successfully."