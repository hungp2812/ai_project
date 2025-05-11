from flask import Flask
from flask_cors import CORS
from backend_api.modules.api.routes.admin_routes import admin_bp
from backend_api.modules.api.routes.user_routes import user_bp
# from backend_api.modules.utils.db_connector import dbConnector

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(user_bp, url_prefix="/user")

@app.route("/")
def index():
    return {"message": "API is running"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)