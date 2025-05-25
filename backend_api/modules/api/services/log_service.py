from modules.utils.db_connector import dbConnector
from flask import session

import datetime

def save_log(model, image, box_count, has_wrinkle):
    """
    Save a log entry to the database.
    
    Args:
        log_data (dict): The log data to be saved.
        
    Returns:
        str: The ID of the inserted log entry.
    """
    db = dbConnector()
    log_collection = db.get_table("log_history")

    if model not in ["acne", "darkspot", "wrinkle"]:
        message = f"Invalid model: {model}"
        raise ValueError(message)
    
    if not isinstance(image, str) or not image.startswith("data:image/"):
        message = "Image must be a base64 encoded string starting with 'data:image/'"
        raise ValueError(message)
    
    if not isinstance(box_count, int) or box_count < 0:
        message = "Box count must be a non-negative integer"
        raise ValueError(message)
    
    if model == "wrinkle" and not isinstance(has_wrinkle, bool):
        message = "Has wrinkle must be a boolean value for the wrinkle model"
        raise ValueError(message)
    
    if not isinstance(user_id, str):
        message = "User ID must be a string"
        raise ValueError(message)
    
    message = ""

    if model == "acne":
        message = f"Đã phát hiện {box_count} vùng nghi ngờ là mụn." if box_count > 0 else "Không phát hiện mụn."
    elif model == "darkspot":
        message = f"Đã phát hiện {box_count} vết thâm trên da." if box_count > 0 else "Không phát hiện vết thâm."
    elif model == "wrinkle":
        message = "Phát hiện dấu hiệu của nếp nhăn." if has_wrinkle else "Không phát hiện nếp nhăn."
    else:
        message = "Không có mô hình phù hợp."
    print(f"[Log] {message}")

    user_id = session.get("user_id", "unknown_user")

    log_data = {
        "user_id": user_id,
        "message": message,
        "created_at": datetime.datetime.now(),
        "model": model,
        "image": image,
        "box_count": box_count,
        "has_wrinkle": has_wrinkle
    }
    
    result = log_collection.insert_one(log_data)
    return str(result.inserted_id)