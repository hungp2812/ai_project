FROM python:3.10-slim

WORKDIR /app


COPY requirements.txt .

# RUN pip install --no-cache-dir --timeout=100 gdown
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --timeout=100 -r requirements.txt

COPY . .

# RUN link=$(head -n 1 model.txt) \
#     && filename=$(sed -n 2p model.txt) \
#     && echo "Downloading $filename from $link" \
#     && gdown --fuzzy "$link" -O "$filename"

EXPOSE 8003

CMD ["python", "app.py"]
