# TELDS Deployment Guide

## 1. Prerequisites
- **Docker & Docker Compose** (for containerized deployment), OR
- **Python 3.11+** & **Node.js 18+** (for manual local execution).
- (Optional for standalone preview: modern web browser to open `telds_dashboard.html`).

---

## 2. Docker Compose Deployment (Recommended)

To run the complete full-stack system (PostgreSQL + FastAPI + React Vite) with a single command:

```bash
docker-compose up --build
```

### Services Started:
- **Frontend**: `http://localhost:5173`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

## 3. Manual Local Development

### Backend Setup:
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Note: If PostgreSQL is not configured, the backend automatically uses SQLite (`telds.db`) for immediate out-of-the-box local testing.*

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Standalone Instant Browser Mode
For zero-dependency demonstration without installing Node or Python:
Double-click `telds_dashboard.html` in the root folder or open it in Google Chrome / Microsoft Edge.
