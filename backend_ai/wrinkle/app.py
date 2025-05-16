from flask import Flask, request, send_file, jsonify
import numpy as np
import tensorflow as tf
import cv2
import io
from PIL import Image

# Tùy chỉnh các hàm loss/metric 
def dice_coef(y_true, y_pred, smooth=1e-6):
    y_true_f = tf.reshape(y_true, [-1])
    y_pred_f = tf.reshape(y_pred, [-1])
    intersection = tf.reduce_sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth)

def dice_loss(y_true, y_pred):
    return 1 - dice_coef(y_true, y_pred)

def combined_bce_dice_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    return bce + dice_loss(y_true, y_pred)

# Load model
model = tf.keras.models.load_model(
    'wrinkle_model.keras',
    custom_objects={
        'combined_bce_dice_loss': combined_bce_dice_loss,
        'dice_loss': dice_loss,
        'dice_coef': dice_coef
    }
)

TARGET_SIZE = (256, 256)

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict_wrinkles():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    image = Image.open(file.stream).convert("RGB")
    image = np.array(image)

    original_size = image.shape[:2]

    # Resize and normalize
    image_resized = cv2.resize(image, TARGET_SIZE)
    image_resized = image_resized.astype(np.float32) / 255.0
    image_resized = cv2.cvtColor(image_resized, cv2.COLOR_RGB2BGR)

    # Add batch dimension
    image_batch = np.expand_dims(image_resized, axis=0)

    # Predict mask
    predicted_mask = model.predict(image_batch)[0, ..., 0]
    predicted_mask = (predicted_mask > 0.1).astype(np.uint8)

    # Resize mask back
    predicted_mask_resized = cv2.resize(predicted_mask, (original_size[1], original_size[0]), interpolation=cv2.INTER_NEAREST)

    # Overlay on original image
    overlay = image.copy()
    red = np.array([255, 0, 0], dtype=np.uint8)
    mask_indices = predicted_mask_resized == 1
    overlay[mask_indices] = (0.6 * overlay[mask_indices] + 0.4 * red).astype(np.uint8)

    # Convert back to image for response
    result_image = Image.fromarray(overlay)
    img_bytes = io.BytesIO()
    result_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002)
