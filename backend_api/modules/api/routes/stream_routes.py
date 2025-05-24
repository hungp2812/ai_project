import asyncio
import base64
from flask import Blueprint, request
from flask_socketio import SocketIO, emit, disconnect
import aiohttp

MODEL_URLS = {
    "acne": "http://acne_service:8001/predict",
    "wrinkle": "http://wrinkle_service:8002/predict",
    "darkspot": "http://darkspot_service:8003/predict"
}

SUCCESS_THRESHOLD = 3
active_sessions = {}

stream_bp = Blueprint("stream", __name__)
# socketio = SocketIO(cors_allowed_origins="*")

# Hàm gửi ảnh đến model và nhận về ảnh đã xử lý (binary -> base64)
async def fetch_model_prediction(session, url, image_b64):
    try:
        header, b64data = image_b64.split(",") if "," in image_b64 else ("", image_b64)
        image_bytes = base64.b64decode(b64data)

        data = aiohttp.FormData()
        data.add_field("file", image_bytes, filename="image.jpg", content_type="image/jpeg")

        async with session.post(url, data=data) as response:
            if response.status == 200:
                processed_bytes = await response.read()
                processed_b64 = base64.b64encode(processed_bytes).decode("utf-8")

                # Lấy metadata từ header
                box_count = int(response.headers.get("X-Box-Count", "0"))
                has_wrinkle = response.headers.get("X-Has-Wrinkle", "false").lower() == "true"

                return {
                    "success": True,
                    "image": f"data:image/jpeg;base64,{processed_b64}",
                    "box_count": box_count,
                    "has_wrinkle": has_wrinkle
                }
            else:
                return {"success": False, "error": f"Status {response.status}"}
    except Exception as e:
        print(f"Error fetching model prediction: {e}")
        return {"success": False, "error": str(e)}

# Xử lý ảnh và gửi prediction về frontend
async def process_image(sid: str, image_b64: str):
    session_data = active_sessions.get(sid)
    if not session_data:
        return

    async with aiohttp.ClientSession() as http_session:
        tasks = {
            model: fetch_model_prediction(http_session, url, image_b64)
            for model, url in MODEL_URLS.items()
        }
        responses = await asyncio.gather(*tasks.values())

        for model, response in zip(tasks.keys(), responses):
            if response and response.get("success"):
                # Chỉ emit nếu có bất thường
                box_count = response.get("box_count", 0)
                has_wrinkle = response.get("has_wrinkle", False)

                if box_count > 0 or has_wrinkle:
                    session_data["counters"][model] += 1
                    session_data["results"][model].append(response)

                    emit("prediction", {"model": model, "result": response}, to=sid)

                    if session_data["counters"][model] >= SUCCESS_THRESHOLD:
                        emit("done", {
                            "model": model,
                            "results": session_data["results"][model]
                        }, to=sid)
                        disconnect(sid)
                        return


# Đăng ký sự kiện socket
def register_socket_events(socketio_instance):
    global socketio
    socketio = socketio_instance

    @socketio.on("connect")
    def on_connect():
        sid = request.sid
        print(f"[Socket] Client connected: {sid}")
        active_sessions[sid] = {
            "active": False,
            "counters": {"acne": 0, "wrinkle": 0, "darkspot": 0},
            "results": {"acne": [], "wrinkle": [], "darkspot": []}
        }

    @socketio.on("start_scan")
    def on_start_scan():
        sid = request.sid
        if sid in active_sessions:
            active_sessions[sid]["active"] = True
            emit("scan_started", {"message": "Ready to receive images."})
        else:
            emit("error", {"message": "Session not found."})

    @socketio.on("image")
    def on_image(data):
        sid = request.sid
        session_data = active_sessions.get(sid)
        if not session_data:
            emit("error", {"message": "No session data."})
            return

        if not session_data["active"]:
            emit("error", {"message": "Scan not started yet."})
            return

        image_b64 = data.get("image")
        if not image_b64:
            emit("error", {"message": "Image data missing."})
            return

        asyncio.run(process_image(sid, image_b64))

    @socketio.on("disconnect")
    def on_disconnect():
        sid = request.sid
        print(f"[Socket] Client disconnected: {sid}")
        if sid in active_sessions:
            del active_sessions[sid]
