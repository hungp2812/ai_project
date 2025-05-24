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
    img_tensor = transform(img)
    return img_tensor.numpy()

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    img = Image.open(file.stream).convert("RGB")
    
    # Preprocess
    input_numpy = preprocess(img)
    
    # onnx expects batch dimension (1, C, H, W)
    if input_numpy.ndim == 3:
        input_numpy = np.expand_dims(input_numpy, axis=0)
    
    # Inference
    inputs = {onnx_session.get_inputs()[0].name: input_numpy}
    boxes, labels, scores = onnx_session.run(None, inputs)
    
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    
    box_count = 0
    for box, score in zip(boxes, scores):
        if score > 0.5:
            box_count += 1
            x1, y1, x2, y2 = box
            draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
            draw.text((x1, y1), f"{score:.2f}", fill="red", font=font)

    # Encode image
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    # Trả về ảnh + số lượng box trong header
    response = send_file(img_bytes, mimetype='image/jpeg')
    response.headers["X-Box-Count"] = str(box_count)
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003)
