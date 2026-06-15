"""
Academic Course Planning System - FastAPI API Gateway
Routes all requests to appropriate microservices
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import logging
import time
from typing import Optional

# --- App Setup ---
app = FastAPI(
    title="ACP API Gateway",
    description="Academic Course Planning System - Centralized API Gateway",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api-gateway")

# --- Service URLs ---
SPRING_BACKEND  = "http://localhost:8080"
NODE_BACKEND    = "http://localhost:3001"

# ============================================================
# MIDDLEWARE: Request Logging & Timing
# ============================================================
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    logger.info(f"[IN]  {request.method} {request.url.path}")

    try:
        response = await call_next(request)
        elapsed = round((time.time() - start) * 1000, 2)
        logger.info(f"[OUT] {request.method} {request.url.path} → {response.status_code} ({elapsed}ms)")
        return response
    except Exception as e:
        logger.error(f"[ERR] {request.method} {request.url.path} → {str(e)}")
        return JSONResponse(status_code=502, content={"detail": "Gateway error", "error": str(e)})


# ============================================================
# HEALTH CHECK
# ============================================================
@app.get("/health", tags=["Gateway"])
async def health():
    return {
        "status": "OK",
        "gateway": "ACP API Gateway v1.0",
        "services": {
            "spring_backend": SPRING_BACKEND,
            "node_backend": NODE_BACKEND
        }
    }


@app.get("/", tags=["Gateway"])
async def root():
    return {"message": "Academic Course Planning System - API Gateway", "docs": "/docs"}


# ============================================================
# TOKEN EXTRACTION HELPER
# ============================================================
def extract_auth_header(request: Request) -> dict:
    """Forward Authorization header to downstream services."""
    headers = {}
    auth = request.headers.get("Authorization")
    if auth:
        headers["Authorization"] = auth
    headers["Content-Type"] = "application/json"
    return headers


# ============================================================
# PROXY HELPER: Spring Boot
# ============================================================
async def proxy_spring(request: Request, path: str, method: str = None):
    method = method or request.method
    url = f"{SPRING_BACKEND}{path}"
    headers = extract_auth_header(request)

    try:
        body = await request.body()
        query_params = dict(request.query_params)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                content=body,
                params=query_params
            )

        try:
            return JSONResponse(content=response.json(), status_code=response.status_code)
        except Exception:
            return JSONResponse(content={"detail": response.text}, status_code=response.status_code)

    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Spring backend unavailable")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


# ============================================================
# PROXY HELPER: Node.js
# ============================================================
async def proxy_node(request: Request, path: str, method: str = None):
    method = method or request.method
    url = f"{NODE_BACKEND}{path}"
    headers = extract_auth_header(request)

    try:
        body = await request.body()
        query_params = dict(request.query_params)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                content=body,
                params=query_params
            )

        try:
            return JSONResponse(content=response.json(), status_code=response.status_code)
        except Exception:
            return JSONResponse(content={"detail": response.text}, status_code=response.status_code)

    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Node backend unavailable")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Node backend timed out")


# ============================================================
# SPRING BACKEND ROUTES (Auth, Courses, Enrollments)
# ============================================================

# --- Auth Routes ---
@app.post("/api/auth/login", tags=["Auth → Spring"])
async def login(request: Request):
    return await proxy_spring(request, "/api/auth/login")

@app.post("/api/auth/register", tags=["Auth → Spring"])
async def register(request: Request):
    return await proxy_spring(request, "/api/auth/register")

# --- Course Routes ---
@app.get("/api/courses", tags=["Courses → Spring"])
async def get_courses(request: Request):
    return await proxy_spring(request, "/api/courses")

@app.get("/api/courses/search", tags=["Courses → Spring"])
async def search_courses(request: Request):
    return await proxy_spring(request, "/api/courses/search")

@app.get("/api/courses/{course_id}", tags=["Courses → Spring"])
async def get_course(course_id: int, request: Request):
    return await proxy_spring(request, f"/api/courses/{course_id}")

@app.post("/api/courses/create", tags=["Courses → Spring"])
async def create_course(request: Request):
    return await proxy_spring(request, "/api/courses/create")

@app.put("/api/courses/update/{course_id}", tags=["Courses → Spring"])
async def update_course(course_id: int, request: Request):
    return await proxy_spring(request, f"/api/courses/update/{course_id}")

@app.delete("/api/courses/delete/{course_id}", tags=["Courses → Spring"])
async def delete_course(course_id: int, request: Request):
    return await proxy_spring(request, f"/api/courses/delete/{course_id}")

@app.get("/api/courses/department/{dept_id}", tags=["Courses → Spring"])
async def courses_by_dept(dept_id: int, request: Request):
    return await proxy_spring(request, f"/api/courses/department/{dept_id}")

@app.get("/api/courses/faculty/{faculty_id}", tags=["Courses → Spring"])
async def courses_by_faculty(faculty_id: int, request: Request):
    return await proxy_spring(request, f"/api/courses/faculty/{faculty_id}")

# --- Enrollment Routes ---
@app.post("/api/enrollments/enroll", tags=["Enrollments → Spring"])
async def enroll(request: Request):
    return await proxy_spring(request, "/api/enrollments/enroll")

@app.put("/api/enrollments/drop", tags=["Enrollments → Spring"])
async def drop_course(request: Request):
    return await proxy_spring(request, "/api/enrollments/drop")

@app.get("/api/enrollments/student/{student_id}", tags=["Enrollments → Spring"])
async def student_enrollments(student_id: int, request: Request):
    return await proxy_spring(request, f"/api/enrollments/student/{student_id}")

@app.get("/api/enrollments/course/{course_id}", tags=["Enrollments → Spring"])
async def course_enrollments(course_id: int, request: Request):
    return await proxy_spring(request, f"/api/enrollments/course/{course_id}")

@app.put("/api/enrollments/{enrollment_id}/grade", tags=["Enrollments → Spring"])
async def update_grade(enrollment_id: int, request: Request):
    return await proxy_spring(request, f"/api/enrollments/{enrollment_id}/grade")


# ============================================================
# NODE.JS BACKEND ROUTES (Announcements, Notifications, Activity)
# ============================================================

# --- Announcements ---
@app.get("/api/announcements", tags=["Announcements → Node"])
async def get_announcements(request: Request):
    return await proxy_node(request, "/api/announcements")

@app.post("/api/announcements", tags=["Announcements → Node"])
async def create_announcement(request: Request):
    return await proxy_node(request, "/api/announcements")

@app.put("/api/announcements/{ann_id}", tags=["Announcements → Node"])
async def update_announcement(ann_id: str, request: Request):
    return await proxy_node(request, f"/api/announcements/{ann_id}")

@app.delete("/api/announcements/{ann_id}", tags=["Announcements → Node"])
async def delete_announcement(ann_id: str, request: Request):
    return await proxy_node(request, f"/api/announcements/{ann_id}")

# --- Notifications ---
@app.get("/api/notifications/{user_id}", tags=["Notifications → Node"])
async def get_notifications(user_id: str, request: Request):
    return await proxy_node(request, f"/api/notifications/{user_id}")

@app.put("/api/notifications/{notif_id}/read", tags=["Notifications → Node"])
async def mark_read(notif_id: str, request: Request):
    return await proxy_node(request, f"/api/notifications/{notif_id}/read")

# --- Activity Logs ---
@app.get("/api/activity", tags=["Activity → Node"])
async def get_activity(request: Request):
    return await proxy_node(request, "/api/activity")

# ============================================================
# GLOBAL ERROR HANDLER
# ============================================================
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "detail": exc.detail, "path": str(request.url.path)}
    )
# --- Materials (Node.js) ---
@app.get("/api/materials", tags=["Materials → Node"])
async def get_materials(request: Request):
    return await proxy_node(request, "/api/materials")

@app.post("/api/materials", tags=["Materials → Node"])
async def create_material(request: Request):
    return await proxy_node(request, "/api/materials")

@app.delete("/api/materials/{mat_id}", tags=["Materials → Node"])
async def delete_material(mat_id: str, request: Request):
    return await proxy_node(request, f"/api/materials/{mat_id}")

# --- Smart Search (Node.js Vector Search) ---
@app.get("/api/materials/search", tags=["Smart Search → Node"])
async def smart_search(request: Request):
    return await proxy_node(request, "/api/materials/search")

# --- Reports (Spring Boot) ---
@app.get("/api/reports/admin", tags=["Reports → Spring"])
async def admin_reports(request: Request):
    return await proxy_spring(request, "/api/reports/admin")

@app.get("/api/reports/faculty/{faculty_id}", tags=["Reports → Spring"])
async def faculty_reports(faculty_id: int, request: Request):
    return await proxy_spring(request, f"/api/reports/faculty/{faculty_id}")

@app.get("/api/reports/student/{student_id}", tags=["Reports → Spring"])
async def student_reports(student_id: int, request: Request):
    return await proxy_spring(request, f"/api/reports/student/{student_id}")

# --- Departments (Spring Boot) ---
@app.get("/api/departments", tags=["Departments → Spring"])
async def get_departments(request: Request):
    return await proxy_spring(request, "/api/departments")

@app.post("/api/departments", tags=["Departments → Spring"])
async def create_department(request: Request):
    return await proxy_spring(request, "/api/departments")

# --- Users (Spring Boot) ---
@app.get("/api/users", tags=["Users → Spring"])
async def get_users(request: Request):
    return await proxy_spring(request, "/api/users")

@app.put("/api/users/{user_id}", tags=["Users → Spring"])
async def update_user(user_id: int, request: Request):
    return await proxy_spring(request, f"/api/users/{user_id}")

@app.delete("/api/users/{user_id}", tags=["Users → Spring"])
async def delete_user(user_id: int, request: Request):
    return await proxy_spring(request, f"/api/users/{user_id}")