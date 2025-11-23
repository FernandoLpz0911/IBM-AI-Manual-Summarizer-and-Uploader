FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (needed for some AI/Database libraries)
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- CRITICAL FIX: Install the production server ---
RUN pip install gunicorn 

COPY . .

# --- CRITICAL FIX: Run with Gunicorn, not manage.py ---
# Replace 'backend' below with the name of the folder inside your backend 
# that contains 'wsgi.py' (e.g., usually 'backend' or your project name)
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]