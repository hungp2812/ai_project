from flask import Flask, request, send_file, make_response
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

    input_numpy = preprocess(img)
    inputs = {onnx_session.get_inputs()[0].name: input_numpy}

    boxes, labels, scores = onnx_session.run(None, inputs)

    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    count = 0

    for box, score in zip(boxes[0], scores[0]):
        if score > 0.5:
            count += 1
            x1, y1, x2, y2 = map(int, box)
            draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
            draw.text((x1, y1), f"{score:.2f}", fill="red", font=font)

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    response = make_response(send_file(img_bytes, mimetype='image/jpeg'))
    response.headers['X-Num-Boxes'] = str(count) 

    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003)
