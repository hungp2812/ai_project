from flask import Flask, request, send_file, jsonify
import onnxruntime
import numpy as np
import cv2
from PIL import Image
import io

app = Flask(__name__)

onnx_model_path = "acne_detection_model.onnx"
session = onnxruntime.InferenceSession(onnx_model_path, providers=['CPUExecutionProvider'])

# Class mapping (nếu chỉ 1 class: acne)
class_mapping = {0: "Acne"}

# Resize ảnh và chuẩn hóa cho YOLOv8
def preprocess_image(image: Image.Image):
    img = image.convert("RGB")
    img = np.array(img)

    h0, w0 = img.shape[:2]  # original height and width
    r = 640 / max(h0, w0)  # scale ratio
    new_w, new_h = int(w0 * r), int(h0 * r)

    # Resize ảnh theo tỉ lệ giữ aspect ratio
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    # Tạo ảnh nền đen 640x640 và đặt ảnh resized vào góc trên trái
    canvas = np.zeros((640, 640, 3), dtype=np.uint8)
    canvas[:new_h, :new_w, :] = resized

    # Chuyển BGR->RGB nếu cần, normalize 0..1, transpose (C,H,W)
    input_img = canvas.astype(np.float32) / 255.0
    input_img = np.transpose(input_img, (2, 0, 1))  # CHW
    input_img = np.expand_dims(input_img, axis=0)  # batch dim

    return input_img, r, 0, 0  # r là tỉ lệ resize, 0,0 vì ảnh đặt ở góc (left, top)

# Xử lý output model (transpose và lọc theo confidence)
def postprocess(outputs, r, left, top, conf_threshold=0.25):
    preds = outputs[0]  # shape (1, 5, 8400)
    preds = np.transpose(preds, (0, 2, 1))  # -> (1, 8400, 5)
    preds = preds[0]  # (8400, 5)

    confs = preds[:, 4]
    mask = confs > conf_threshold
    preds = preds[mask]

    boxes = preds[:, :4]
    scores = preds[:, 4]
    class_ids = np.zeros(len(scores), dtype=int)  # 1 class

    final_boxes = []
    for box in boxes:
        x_c, y_c, w, h = box
        x_c -= left
        y_c -= top
        x1 = (x_c - w / 2) / r
        y1 = (y_c - h / 2) / r
        x2 = (x_c + w / 2) / r
        y2 = (y_c + h / 2) / r
        final_boxes.append([int(x1), int(y1), int(x2), int(y2)])

    return final_boxes, scores, class_ids

def predict_and_plot(image: Image.Image):
    input_img, r, left, top = preprocess_image(image)
    ort_inputs = {session.get_inputs()[0].name: input_img}
    outputs = session.run(None, ort_inputs)

    boxes, scores, class_ids = postprocess(outputs, r, left, top)

    img_np = np.array(image.convert("RGB"))

    for box, score, cls_id in zip(boxes, scores, class_ids):
        x1, y1, x2, y2 = box
        label = f"{class_mapping.get(cls_id, 'Unknown')} {score:.2f}"

        cv2.rectangle(img_np, (x1, y1), (x2, y2), (0, 255, 255), 2)
        cv2.putText(img_np, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (0, 255, 255), 2)

    result_img = Image.fromarray(img_np)
    return result_img

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    image = Image.open(file.stream)

    result_image = predict_and_plot(image)

    img_bytes = io.BytesIO()
    result_image.save(img_bytes, format="JPEG")
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype="image/jpeg")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)
