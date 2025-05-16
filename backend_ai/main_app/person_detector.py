import cv2
from ultralytics import YOLO
import numpy as np

# Load YOLOv8 model
model = YOLO("yolov8n.pt") 

def detect_and_crop(image):
    # Chuyển ảnh PIL sang OpenCV
    image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Dự đoán
    results = model(image_cv)[0]
    boxes = [box for box in results.boxes if int(box.cls[0]) == 0]  # class 0 = person

    count = len(boxes)
    if count != 1:
        return f"Phát hiện {count} người. Cần đúng 1 người.", None

    # Crop người
    x1, y1, x2, y2 = map(int, boxes[0].xyxy[0])
    cropped = image_cv[y1:y2, x1:x2]
    cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)

    return f"Phát hiện chính xác 1 người.", cropped_rgb


