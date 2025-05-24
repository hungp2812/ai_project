from flask import Flask, request, send_file, jsonify
import numpy as np
import onnxruntime as ort
import cv2
import io
from PIL import Image

app = Flask(__name__)

TARGET_SIZE = (256, 256)

ort_session = ort.InferenceSession("wrinkle_detection_model.onnx")

@app.route('/predict', methods=['POST'])
def predict_wrinkles():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    image = Image.open(file.stream).convert("RGB")
    image = np.array(image)

    original_size = image.shape[:2]  # (height, width)

    # Resize to target size
    image_resized = cv2.resize(image, TARGET_SIZE)
    image_resized = image_resized.astype(np.float32) / 255.0
    image_resized = cv2.cvtColor(image_resized, cv2.COLOR_RGB2BGR)

    input_tensor = np.expand_dims(image_resized, axis=0)
    input_name = ort_session.get_inputs()[0].name
    outputs = ort_session.run(None, {input_name: input_tensor})

    predicted_mask = outputs[0][0, ..., 0]
    predicted_mask = (predicted_mask > 0.1).astype(np.uint8)
    predicted_mask_resized = cv2.resize(predicted_mask, (original_size[1], original_size[0]), interpolation=cv2.INTER_NEAREST)

    # Kiểm tra có nếp nhăn hay không
    has_wrinkle = np.any(predicted_mask_resized == 1)

    # Tạo overlay
    overlay = image.copy()
    red = np.array([255, 0, 0], dtype=np.uint8)
    mask_indices = predicted_mask_resized == 1
    overlay[mask_indices] = (0.6 * overlay[mask_indices] + 0.4 * red).astype(np.uint8)

    result_image = Image.fromarray(overlay)
    img_bytes = io.BytesIO()
    result_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    # Trả về ảnh + header 'X-Has-Wrinkle'
    response = send_file(img_bytes, mimetype='image/jpeg')
    response.headers["X-Has-Wrinkle"] = "true" if has_wrinkle else "false"
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002)
