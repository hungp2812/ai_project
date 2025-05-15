from flask import Blueprint, request, jsonify, session
from modules.api.services.auth_service import authenticate_user, login_user, logout_user, register_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        user_id = register_user(
            data["username"], data["password"], data["email"]
        )
        return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data or not "role" in data:
        return jsonify({"error": "Missing credentials"}), 400

    user = authenticate_user(data["email"], data["password"], data["role"])
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "Logged in successfully"}), 200

@auth_bp.route("/logout", methods=["GET"])
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200