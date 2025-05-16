from flask import Flask, request, send_file, jsonify
import tensorflow as tf
import keras_cv
import numpy as np
import cv2
from PIL import Image
import io

app = Flask(__name__)

# Load model
model_path = 'acne_detection_model.keras'
model = tf.keras.models.load_model(model_path)

# Class mapping
class_mapping = {0: 'Acne'}

# Hàm xử lý ảnh đầu vào
def preprocess_image(image):
    image = np.array(image.convert("RGB"))
    resized_img = tf.image.resize(image, (640, 640))
    resized_img = tf.cast(resized_img, dtype=tf.float32)
    return resized_img

# Hàm dự đoán và vẽ bounding box
def predict_and_plot(image):
    preprocessed = preprocess_image(image)
    batch = tf.expand_dims(preprocessed, axis=0)

    y_pred = model.predict(batch, verbose=0)
    y_pred = keras_cv.bounding_box.to_dense(y_pred)

    pred_boxes = y_pred["boxes"][0]
    pred_classes = y_pred["classes"][0]

    img_np = np.array(image.convert("RGB"))

    for box, cls in zip(pred_boxes, pred_classes):
        x1, y1, x2, y2 = [int(v) for v in box]
        label = class_mapping.get(int(cls), "Unknown")

        # Vẽ bounding box và label
        cv2.rectangle(img_np, (x1, y1), (x2, y2), (0, 255, 255), 2)
        cv2.putText(img_np, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    result_image = Image.fromarray(img_np)
    return result_image

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    image = Image.open(file.stream)

    result = predict_and_plot(image)

    img_bytes = io.BytesIO()
    result.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001)
