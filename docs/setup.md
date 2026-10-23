# ORYVEX — Local Setup & Installation Guide

This document provides exact, step-by-step instructions for running ORYVEX locally on Windows / macOS / Linux.

---

## 1. Prerequisites
- **Python**: 3.10+ (Verified on Python 3.10.11)
- **Node.js**: v18+ (Verified on Node.js v24.16.0 / npm 11.13.0)
- **PostgreSQL**: PostgreSQL 14+ (Verified on PostgreSQL 18.4)
- **Groq API Key**: Obtain a key at [console.groq.com](https://console.groq.com/)

---

## 2. PostgreSQL Setup
ORYVEX connects to PostgreSQL to persist investigation records, evidence items, 5 Whys steps, root causes, and CAPAs.

### Start Local PostgreSQL
If using the dedicated local instance configured for port 5434:
```powershell
postgres -D "c:\Users\Vishal S Naik\pg_oryvex_data" -p 5434
```
Ensure the database `oryvex_db` exists:
```powershell
createdb -h 127.0.0.1 -p 5434 -U postgres oryvex_db
```

---

## 3. Backend Setup

### Navigate to backend directory
```powershell
cd c:\Users\Vishal S Naik\MyProjects\ORYVEX\backend
```

### Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Ensure the following variables are configured in `backend/.env`:
```ini
PROJECT_NAME="ORYVEX - AI-Powered Root Cause Intelligence System"
VERSION="1.0.0"
API_V1_STR="/api/v1"

DATABASE_URL=postgresql://postgres@localhost:5434/oryvex_db

GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_TIMEOUT=60
GROQ_MAX_RETRIES=3

CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
MAX_UPLOAD_MB=10
```

### Install Backend Dependencies
```powershell
pip install -r requirements.txt
```

### Run Automated Tests
```powershell
python -m pytest backend/tests -v
```

### Start Backend Server
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive Swagger API docs will be accessible at:
- `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

---

## 4. Frontend Setup

### Navigate to frontend directory
```powershell
cd c:\Users\Vishal S Naik\MyProjects\ORYVEX\frontend
```

### Install Node Dependencies
```powershell
npm install
```

### Start Frontend Development Server
```powershell
npm run dev
```
Open your browser at:
- **`http://localhost:5173`**
