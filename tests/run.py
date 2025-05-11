# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import joblib

from backend_api.modules.controllers.User import User, UserRole
from backend_api.modules.controllers.UserManager import UserManager
from backend_api.modules.controllers.AdminManager import AdminManager

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)

admin = User(
    user_id="12345",
    username="admin",
    password="password",
    email="hollwo.pelw05@gmail.com",
    role=UserRole.ADMIN
)

user1 = User(
    user_id="67890",
    username="user1",
    password="password",
    email="sususge@gmail.com",
    role=UserRole.USER
)

user2 = User(
    user_id="67891",
    username="user2",
    password="password",
    email="vamongus@gmail.com",
    role=UserRole.USER
)

admin_manager = AdminManager(admin)

admin_manager.add_user(user1)
admin_manager.add_user(user2)
admin_manager.update_user_role(user1.user_id, UserRole.ADMIN)
admin_manager.remove_user(user2.user_id)
admin_manager.update_user_info(username="new_admin", password="new_password", email="hehehe@gmail.com")
admin_manager.face_recognition()
admin_manager.get_user_info()