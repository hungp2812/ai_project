from flask import Flask
from flask_cors import CORS
from modules.api.routes.admin_routes import admin_bp
from modules.api.routes.user_routes import user_bp
from modules.api.routes.auth_routes import auth_bp
from modules.api.routes.stream_routes import register_socket_events, stream_bp
from modules.api.routes.analyze_routes import analyze_bp

from flask_socketio import SocketIO
import os

app = Flask(__name__)

app.secret_key = os.environ.get("SECRET_KEY", "admin_s3cret_key")
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")


# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(stream_bp)
app.register_blueprint(analyze_bp)

register_socket_events(socketio)

@app.route("/")
def index():
    return {"message": "API is running"}

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
    # app.run(host="0.0.0.0", port=5000, debug=True)