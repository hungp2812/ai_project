from flask import Flask, jsonify
from modules.controllers.UserManager import UserManager
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/user/profile")
def profile():
    user_manager = UserManager(user_id=1)  # giả lập user ID = 1
    profile = user_manager.get_profile()
    if profile:
        return jsonify(profile)
    return jsonify({"error": "User not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
