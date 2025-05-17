from flask import Blueprint, request, jsonify, session
from bson import ObjectId

# from modules.utils.decorators import admin_required
from modules.controllers.AdminManager import AdminManager

admin_bp = Blueprint("admin", __name__)
# admin_bp.before_request(admin_required)

# Middleware to check if the user is an admin

@admin_bp.before_request
def check_admin():
    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

@admin_bp.route("/users", methods=["GET"])
def get_users():
    """
    Get a list of all users in the system.
    """
    admin_manager = AdminManager(user_id=session.get("user_id"))

    users = admin_manager.get_all_users()
    if not users:
        return jsonify({"error": "No users found"}), 404

    return jsonify(users), 200

@admin_bp.route("/users/add", methods=["POST"])
def add_user():
    """
    Add a new user to the system.
    """
    admin_manager = AdminManager(user_id=session.get("user_id"))

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    new_user = admin_manager.add_user(data)
    if not new_user:
        return jsonify({"error": "Failed to add user"}), 500

    return jsonify(new_user), 201

@admin_bp.route("/users/remove/<user_id>", methods=["DELETE"])
def remove_user(user_id):
    """
    Remove a user from the system by their user ID.
    """
    admin_manager = AdminManager(user_id=session.get("user_id"))

    if not ObjectId.is_valid(user_id):
        return jsonify({"error": "Invalid user ID"}), 400

    result = admin_manager.remove_user(user_id)
    if not result:
        return jsonify({"error": "Failed to remove user"}), 500

    return jsonify({"message": "User removed successfully"}), 200


@admin_bp.route("/users/update_role/<user_id>", methods=["PUT"])
def update_user_role(user_id):
    """
    Update the role of an existing user.
    """
    admin_manager = AdminManager(user_id=session.get("user_id"))

    data = request.get_json()
    if not data or "new_role" not in data:
        return jsonify({"error": "No data provided"}), 400

    new_role = data["new_role"]
    if new_role not in ["admin", "user"]:
        return jsonify({"error": "Invalid role"}), 400

    result = admin_manager.update_user_role(user_id, new_role)
    if not result:
        return jsonify({"error": "Failed to update user role"}), 500

    return jsonify({"message": "User role updated successfully"}), 200