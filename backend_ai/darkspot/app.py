from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
import io
import numpy as np
import onnxruntime as ort
import torchvision.transforms as T

app = Flask(__name__)

onnx_session = ort.InferenceSession("dark_spot_detection_model.onnx")

# Transform (PIL Image → Tensor → numpy)
transform = T.Compose([
    T.ToTensor(),
])

def preprocess(img):
    # Chuyển ảnh PIL sang tensor 3xHxW, rồi sang numpy float32
    img_tensor = transform(img)
    return img_tensor.numpy()

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    img = Image.open(file.stream).convert("RGB")
    
    # Preprocess
    input_numpy = preprocess(img)
    
    # ort expects input name and numpy array
    inputs = {onnx_session.get_inputs()[0].name: input_numpy}
    
    # Inference
    boxes, labels, scores = onnx_session.run(None, inputs)
    
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    
    # boxes, scores: numpy arrays; 
    for box, score in zip(boxes, scores):
        if score > 0.5:
            x1, y1, x2, y2 = box
            draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
            draw.text((x1, y1), f"{score:.2f}", fill="red", font=font)

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003)
