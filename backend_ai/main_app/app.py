from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import io
import os
import requests
import numpy as np

from person_detector import detect_and_crop

app = Flask(__name__)
UPLOAD_FOLDER = "static"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MODEL_ENDPOINTS = {
    "acne": "http://localhost:8001/predict",
    "wrinkle": "http://localhost:8002/predict",
    "darkspot": "http://localhost:8003/predict",
}

@app.route("/analyze", methods=["POST"])
def analyze():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400

    try:
        image = Image.open(file.stream).convert("RGB")
    except Exception:
        return jsonify({"success": False, "error": "Invalid image"}), 400

    msg, cropped_np = detect_and_crop(image)
    if cropped_np is None:
        return jsonify({"success": False, "error": msg}), 400

    # Convert cropped numpy array (RGB) to bytes JPEG
    cropped_pil = Image.fromarray(cropped_np)
    img_bytes_io = io.BytesIO()
    cropped_pil.save(img_bytes_io, format="JPEG")
    img_bytes = img_bytes_io.getvalue()

    def call_model(endpoint, out_filename):
        files = {'file': ('image.jpg', img_bytes, 'image/jpeg')}
        resp = requests.post(endpoint, files=files)
        if resp.status_code != 200:
            raise Exception(f"Model {endpoint} error: {resp.text}")
        out_path = os.path.join(UPLOAD_FOLDER, out_filename)
        with open(out_path, 'wb') as f:
            f.write(resp.content)
        return out_filename

    try:
        acne_file = call_model(MODEL_ENDPOINTS["acne"], "acne_result.jpg")
        wrinkle_file = call_model(MODEL_ENDPOINTS["wrinkle"], "wrinkle_result.jpg")
        darkspot_file = call_model(MODEL_ENDPOINTS["darkspot"], "darkspot_result.jpg")
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": msg,
        "acne_image_url": f"/static/{acne_file}",
        "wrinkle_image_url": f"/static/{wrinkle_file}",
        "darkspot_image_url": f"/static/{darkspot_file}",
    })

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
