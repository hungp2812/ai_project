FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# RUN pip install --no-cache-dir --timeout=100 gdown
RUN pip install --no-cache-dir --timeout=100 -r requirements.txt

COPY . .

# RUN link=$(head -n 1 model.txt) \
#     && filename=$(sed -n 2p model.txt) \
#     && echo "Downloading $filename from $link" \
#     && gdown --fuzzy "$link" -O "$filename"

EXPOSE 8001

CMD ["python", "app.py"]
