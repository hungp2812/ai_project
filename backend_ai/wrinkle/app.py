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
    # Normalize pixel values to [0,1]
    image_resized = image_resized.astype(np.float32) / 255.0
    image_resized = cv2.cvtColor(image_resized, cv2.COLOR_RGB2BGR)

    # Add batch dimension
    input_tensor = np.expand_dims(image_resized, axis=0)

    # ONNX Runtime inference expects input name and a dict
    input_name = ort_session.get_inputs()[0].name
    outputs = ort_session.run(None, {input_name: input_tensor})

    # outputs là list, lấy đầu ra đầu tiên
    predicted_mask = outputs[0][0, ..., 0]

    # Ngưỡng mask
    predicted_mask = (predicted_mask > 0.1).astype(np.uint8)

    # Resize mask về kích thước ảnh gốc
    predicted_mask_resized = cv2.resize(predicted_mask, (original_size[1], original_size[0]), interpolation=cv2.INTER_NEAREST)

    # Tạo ảnh overlay
    overlay = image.copy()
    red = np.array([255, 0, 0], dtype=np.uint8)
    mask_indices = predicted_mask_resized == 1
    overlay[mask_indices] = (0.6 * overlay[mask_indices] + 0.4 * red).astype(np.uint8)

    # Chuyển sang Image để trả về
    result_image = Image.fromarray(overlay)
    img_bytes = io.BytesIO()
    result_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002)
