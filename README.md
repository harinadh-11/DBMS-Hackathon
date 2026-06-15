# 🎓 Academic Course Planning System (ACP)

A full-stack microservices project for academic course management, built for hackathon.

---

## 🏗️ Architecture

```
React SPA (Port 3000)
       │
       ▼
FastAPI API Gateway (Port 8000)
       │
   ┌───┴────────────────┐
   ▼                    ▼
Spring Boot          Node.js
(Port 8080)         (Port 3001)
   │                    │
   ▼                    ▼
PostgreSQL           MongoDB
(Users, Courses,   (Announcements,
 Enrollments)      Notifications,
                   Activity Logs)
```

---

## 📋 Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React.js (SPA), Axios             |
| API Gateway  | FastAPI (Python)                  |
| Backend 1    | Spring Boot 3.2 (Java 17)         |
| Backend 2    | Node.js + Express                 |
| DB 1         | PostgreSQL (via pgAdmin)          |
| DB 2         | MongoDB (Atlas or Local)          |
| Auth         | JWT (Spring Security + RBAC)      |
| Docs         | Swagger/OpenAPI                   |

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- Python 3.11+
- PostgreSQL (pgAdmin)
- MongoDB (Atlas or Local)
- Spring Tools 4 (Eclipse-based IDE)
- VS Code

---

### Step 1: PostgreSQL Database

1. Open **pgAdmin**
2. Create a database: `academic_planner`
3. Open Query Tool → paste and run `database/postgresql/schema.sql`
4. This creates all tables + seed data (users, courses, departments, enrollments)

**Default users created:**
| Username  | Password    | Role    |
|-----------|-------------|---------|
| admin     | (bcrypt)    | ADMIN   |
| dr.sharma | (bcrypt)    | FACULTY |
| student1  | (bcrypt)    | STUDENT |

> ⚠️ The seed data uses a placeholder bcrypt hash. You need to register users via the API to get working accounts. Run the API first, then POST to `/api/auth/register`.

---

### Step 2: Spring Boot Backend

1. Open **Spring Tools 4**
2. Import project: `File → Import → Existing Maven Projects → spring-backend/`
3. Open `src/main/resources/application.properties`
4. Update these if needed:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/academic_planner
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   jwt.secret=AcademicCoursePlannerSecretKey2024SuperSecureAndLongEnoughForHS256
   ```
5. Right-click project → **Run As → Spring Boot App**
6. Wait for: `Started AcademicCoursePlannerApplication`
7. Test: http://localhost:8080/swagger-ui.html

---

### Step 3: Node.js Backend

1. Open VS Code → Open Folder → `node-backend/`
2. Open terminal:
   ```powershell
   npm install
   ```
3. Create `.env` file (already created, just update MONGO_URI):
   ```env
   PORT=3001
   MONGO_URI=mongodb+srv://Manoj:Manoj%40720@cluster0.xyei1rg.mongodb.net/acp_node?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=AcademicCoursePlannerSecretKey2024SuperSecureAndLongEnoughForHS256
   NODE_ENV=development
   ```
4. Start the server:
   ```powershell
   npm start
   ```
5. Seed MongoDB data:
   ```powershell
   node seed.js
   ```
6. Test: http://localhost:3001/health

---

### Step 4: FastAPI API Gateway

1. Open VS Code → Open Folder → `api-gateway/`
2. Open terminal:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Start the gateway:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
4. Test: http://localhost:8000/docs

---

### Step 5: React Frontend

1. Open VS Code → Open Folder → `frontend/`
2. Open terminal:
   ```powershell
   npm install
   npm start
   ```
3. Open: http://localhost:3000

---

## 🔑 First-Time Login

Since seed data passwords are placeholders, register new users via API:

**Using Swagger UI at http://localhost:8000/docs:**

```json
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@acp.edu",
  "password": "Admin@123",
  "fullName": "System Admin",
  "role": "ADMIN"
}
```

Register one each for ADMIN, FACULTY, STUDENT.

---

## 📡 API Endpoints Summary

All requests go through the **FastAPI Gateway at port 8000**.

### Auth
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| POST   | /api/auth/login       | Login → JWT      |
| POST   | /api/auth/register    | Register user    |

### Courses
| Method | Endpoint                      | Role         |
|--------|-------------------------------|--------------|
| GET    | /api/courses                  | All          |
| GET    | /api/courses/{id}             | All          |
| GET    | /api/courses/search?keyword=  | All          |
| POST   | /api/courses/create           | Admin/Faculty|
| PUT    | /api/courses/update/{id}      | Admin/Faculty|
| DELETE | /api/courses/delete/{id}      | Admin        |

### Enrollments
| Method | Endpoint                        | Role    |
|--------|---------------------------------|---------|
| POST   | /api/enrollments/enroll         | Student |
| PUT    | /api/enrollments/drop           | Student |
| GET    | /api/enrollments/student/{id}   | All     |
| GET    | /api/enrollments/course/{id}    | Admin/Faculty |
| PUT    | /api/enrollments/{id}/grade     | Admin/Faculty |

### Announcements (Node.js)
| Method | Endpoint                  | Role         |
|--------|---------------------------|--------------|
| GET    | /api/announcements        | All          |
| POST   | /api/announcements        | Admin/Faculty|
| PUT    | /api/announcements/{id}   | Admin/Faculty|
| DELETE | /api/announcements/{id}   | Admin/Faculty|

---

## 🗂️ Project Structure

```
academic-course-planner/
├── database/
│   └── postgresql/schema.sql         ← Run this in pgAdmin first
├── spring-backend/                   ← Spring Boot (port 8080)
│   ├── pom.xml
│   └── src/main/java/com/acp/
│       ├── controller/               ← REST endpoints
│       ├── service/                  ← Business logic
│       ├── repository/               ← JPA repositories
│       ├── entity/                   ← JPA entities
│       ├── dto/                      ← Request/Response DTOs
│       ├── security/                 ← JWT filter + util
│       └── config/                   ← Security + OpenAPI config
├── api-gateway/                      ← FastAPI gateway (port 8000)
│   ├── main.py
│   └── requirements.txt
├── node-backend/                     ← Node.js (port 3001)
│   ├── src/
│   │   ├── index.js
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── seed.js                       ← MongoDB seed data
└── frontend/                         ← React SPA (port 3000)
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/AuthContext.js
        ├── services/api.js
        ├── components/Navbar.js
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── CoursesPage.js
            ├── CourseDetailPage.js
            ├── MyCoursesPage.js
            ├── AnnouncementsPage.js
            └── AdminPage.js
```

---

## 👥 Team Roles (Suggested Split)

| Member   | Responsibility                                    |
|----------|---------------------------------------------------|
| Member 1 | Spring Boot (Auth, Courses, Enrollments) + PostgreSQL |
| Member 2 | FastAPI Gateway + Node.js + MongoDB               |
| Member 3 | React Frontend + UI/UX + System Integration       |

---

## ✅ Rubric Coverage

### Review 1
- ✅ Frontend UI Design (React SPA)
- ✅ API Gateway (FastAPI proxy)
- ✅ Spring Boot Security (JWT + RBAC)
- ✅ Spring Boot CRUD (Courses, Enrollments, Departments)
- ✅ PostgreSQL Design (5 tables, indexes, constraints)
- ✅ System Integration (React → Gateway → Spring → PostgreSQL)
- ✅ Git (.gitignore + structured repo)

### Review 2
- ✅ Frontend UI (Responsive, role-based views)
- ✅ API Gateway (Token forwarding, error handling, logging)
- ✅ Spring Boot JWT + RBAC + CRUD
- ✅ Node.js CRUD (Announcements, Notifications, Activity)
- ✅ PostgreSQL + MongoDB dual databases
- ✅ Full stack integration
- ✅ Git collaboration ready

---

## 🔧 Troubleshooting

**Port 8080 already in use:**
```cmd
netstat -ano | findstr :8080
taskkill /PID <number> /F
```

**MongoDB connection error:**
- Check MONGO_URI in `node-backend/.env`
- Encode special chars: `@` → `%40`

**403 on Spring Boot:**
- Public GET routes are configured in `SecurityConfig.java`
- Protected routes need `Authorization: Bearer <token>` header

**CORS errors in browser:**
- FastAPI has CORS enabled for all origins
- Spring Boot CORS is configured in `SecurityConfig.java`
