import asyncio
import base64
from flask import Blueprint, request, jsonify
from flask_socketio import SocketIO, emit, disconnect
from modules.api.services.log_service import save_log
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

async def process_image(sid: str, image_b64: str):
    session_data = active_sessions.get(sid)
    if not session_data:
        return

    done_models = session_data.setdefault("done_models", set())  # Thêm done_models nếu chưa có

    # Chỉ gửi đến model chưa done
    pending_models = {
        model: url for model, url in MODEL_URLS.items()
        if model not in done_models
    }

    if not pending_models:
        return

    async with aiohttp.ClientSession() as http_session:
        tasks = {
            model: fetch_model_prediction(http_session, url, image_b64)
            for model, url in pending_models.items()
        }
        responses = await asyncio.gather(*tasks.values())

        for model, response in zip(tasks.keys(), responses):
            if model in done_models:
                continue  # Đề phòng trường hợp model vừa done trong quá trình await

            if response and response.get("success"):
                box_count = response.get("box_count", 0)
                has_wrinkle = response.get("has_wrinkle", False)

                if box_count > 0 or has_wrinkle:
                    session_data["counters"][model] += 1
                    session_data["results"][model].append(response)

                    emit("prediction", {
                        "model": model,
                        "image": response.get("image"),
                        "box_count": box_count,
                        "has_wrinkle": has_wrinkle,
                        "count": session_data["counters"][model]
                    }, to=sid)

                    if session_data["counters"][model] == SUCCESS_THRESHOLD:
                        emit("done", {
                            "model": model,
                            "results": session_data["results"][model]
                        }, to=sid)

                        save_log(
                            model=model,
                            image=response.get("image"),
                            box_count=box_count,
                            has_wrinkle=has_wrinkle
                        )
                        done_models.add(model)

        # Nếu tất cả model đều done thì disconnect
        if len(done_models) == len(MODEL_URLS):
            print(f"[Socket] All models done for session {sid}. Disconnecting.")
            disconnect(sid)

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
            "results": {"acne": [], "wrinkle": [], "darkspot": []},
            "done_models": set()  # Thêm vào session
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
