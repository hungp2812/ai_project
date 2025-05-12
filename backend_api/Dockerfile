FROM python:3.11-slim
# Set environment variables

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ENV PYTHONPATH=/app

EXPOSE 5000

CMD ["sh", "-c", "python init_admin.py && python app.py"]