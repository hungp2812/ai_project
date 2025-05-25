from flask import Blueprint, request, jsonify, session
from bson import ObjectId

from modules.controllers.UserManager import UserManager

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile", methods=["GET"])
def get_profile():
    """
    Get the profile of the logged-in user.
    """
    user_manager = UserManager(user_id=session.get("user_id"))

    profile = user_manager.get_user_info()
    if not profile:
        return jsonify({"error": "User not found"}), 404

    return jsonify(profile), 200


@user_bp.route("/verify_password", methods=["POST"])
def verify_password():
    """
    Verify the password of the logged-in user.
    """
    user_manager = UserManager(user_id=session.get("user_id"))

    data = request.get_json()
    if not data or "password" not in data:
        return jsonify({"error": "Missing password"}), 400

    is_valid = user_manager.verify_password(data["password"])
    if not is_valid:
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({"message": "Password verified successfully"}), 200  

@user_bp.route("/update_profile", methods=["PUT"])
def update_profile():
    """
    Update the profile of the logged-in user.
    """
    user_manager = UserManager(user_id=session.get("user_id"))

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    updated_user = user_manager.update_user_info(data)
    if not updated_user:
        return jsonify({"error": "Failed to update profile"}), 500

    return jsonify(updated_user), 200

@user_bp.routes("/show_logs", methods=["GET"])
def show_logs():
    """
    Show the logs of the logged-in user.
    """
    user_manager = UserManager(user_id=session.get("user_id"))

    logs = user_manager.get_user_logs()
    if not logs:
        return jsonify({"error": "No logs found"}), 404

    return jsonify(logs), 200