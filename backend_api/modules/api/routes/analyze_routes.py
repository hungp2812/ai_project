from flask import Blueprint, request, jsonify
import aiohttp
import asyncio
import base64

analyze_bp = Blueprint("analyze", __name__)

MODEL_ENDPOINTS = {
    "acne": "http://acne:8001/predict",
    "wrinkle": "http://wrinkle:8002/predict",
    "darkspot": "http://darkspot:8003/predict"
}

async def post_image(session, url, image_bytes):
    data = aiohttp.FormData()
    data.add_field("file", image_bytes, filename="image.jpg", content_type="image/jpeg")
    try:
        async with session.post(url, data=data) as response:
            content = await response.read()
            headers = dict(response.headers)
            return content, headers, response.status
    except Exception as e:
        return str(e), {}, 500

@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    if "file" in request.files:
        image_file = request.files["file"]
        image_bytes = image_file.read()

    elif request.is_json:
        data = request.get_json()
        image_b64 = data.get("image")
        if not image_b64:
            return jsonify({"error": "No image provided"}), 400
        try:
            image_bytes = base64.b64decode(image_b64.split(",")[-1])
        except Exception:
            return jsonify({"error": "Invalid base64 image"}), 400
    else:
        return jsonify({"error": "Unsupported request type"}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    results = loop.run_until_complete(run_model_requests(image_bytes))
    return jsonify(results)

async def run_model_requests(image_bytes):
    async with aiohttp.ClientSession() as session:
        tasks = {
            name: post_image(session, url, image_bytes)
            for name, url in MODEL_ENDPOINTS.items()
        }
        responses = await asyncio.gather(*tasks.values())

    result_dict = {}
    for (model_name, (content, headers, status)) in zip(MODEL_ENDPOINTS.keys(), responses):
        if status == 200:
            img_b64 = base64.b64encode(content).decode("utf-8")
            meta = {}

            if model_name in ["acne", "darkspot"]:
                count = headers.get("X-Box-Count")
                if count is not None:
                    meta["box_count"] = int(count)
            elif model_name == "wrinkle":
                has_wrinkle = headers.get("X-Has-Wrinkle")
                if has_wrinkle is not None:
                    meta["has_wrinkle"] = has_wrinkle.lower() == "true"

            result_dict[model_name] = {
                "success": True,
                "image": img_b64,
                "meta": meta
            }
        else:
            result_dict[model_name] = {
                "success": False,
                "error": str(content)
            }
    return result_dict
