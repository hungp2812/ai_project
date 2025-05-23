from flask import Blueprint, request, jsonify, session
from flask_socketio import SocketIO, emit, disconnect
from bson import ObjectId
# from modules.controllers.StreamManager import StreamManager

import asyncio
import aiohttp

MODEL_URLS = [
    "http://localhost:8001/predict", # acne
    "http://localhost:8002/predict", # wrinkle
    "http://localhost:8003/predict", # darkspot
]

SUCCESS_THRESHOLD = 3

active_sessions = {}


socketio = SocketIO(cors_allowed_origins="*")

async def fetch_model_prediction(session, url, image_data):
    try:
        async with session.post(url, json={"image": image_data}) as response:
            if response.status == 200:
                return await response.json()
            else:
                return None
    except Exception as e:
        print(f"Error fetching model prediction: {e}")
        return None

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

def register_socket_events(socketio_instance):
    global socketio
    socketio = socketio_instance

    @socketio.on("connect")
    def on_connect():
        sid = request.sid
        print(f"[Socket] Client connected: {sid}")
        active_sessions[sid] = {
            "active": False,  # 👈 mặc định chưa cho xử lý
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
