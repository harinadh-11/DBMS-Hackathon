-- ============================================================
-- Academic Course Planning System - PostgreSQL Schema
-- ============================================================

-- Drop existing tables (safe reset)
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS course_prerequisites CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,  -- ADMIN, FACULTY, STUDENT
    description TEXT
);

INSERT INTO roles (name, description) VALUES
    ('ADMIN',   'Full system access'),
    ('FACULTY', 'Can manage courses and view students'),
    ('STUDENT', 'Can enroll in courses and view schedule');

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(100) UNIQUE NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password     VARCHAR(255) NOT NULL,         -- BCrypt hashed
    full_name    VARCHAR(255) NOT NULL,
    role_id      INT NOT NULL REFERENCES roles(id),
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast login lookups
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role     ON users(role_id);

-- ============================================================
-- DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    code        VARCHAR(20)  UNIQUE NOT NULL,   -- e.g. CS, MATH
    head_id     INT REFERENCES users(id),       -- Faculty HOD
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);

-- ============================================================
-- COURSES TABLE
-- ============================================================
CREATE TABLE courses (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    code            VARCHAR(30)  UNIQUE NOT NULL,  -- e.g. CS101
    description     TEXT,
    credits         INT NOT NULL DEFAULT 3,
    max_students    INT NOT NULL DEFAULT 60,
    department_id   INT NOT NULL REFERENCES departments(id),
    faculty_id      INT REFERENCES users(id),       -- Assigned faculty
    semester        VARCHAR(20) NOT NULL,            -- Fall/Spring/Summer
    academic_year   VARCHAR(10) NOT NULL,            -- 2024-25
    schedule        VARCHAR(100),                    -- Mon/Wed 10:00-11:30
    room            VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'ACTIVE',    -- ACTIVE, CANCELLED, COMPLETED
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_code        ON courses(code);
CREATE INDEX idx_courses_department  ON courses(department_id);
CREATE INDEX idx_courses_faculty     ON courses(faculty_id);
CREATE INDEX idx_courses_semester    ON courses(semester, academic_year);

-- ============================================================
-- COURSE PREREQUISITES TABLE
-- ============================================================
CREATE TABLE course_prerequisites (
    course_id       INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, prerequisite_id)
);

-- ============================================================
-- ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE enrollments (
    id           SERIAL PRIMARY KEY,
    student_id   INT NOT NULL REFERENCES users(id),
    course_id    INT NOT NULL REFERENCES courses(id),
    status       VARCHAR(20) DEFAULT 'ENROLLED',    -- ENROLLED, DROPPED, COMPLETED
    grade        VARCHAR(5),                         -- A, B+, B, C+, etc.
    enrolled_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX idx_enrollments_status  ON enrollments(status);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: Admin@123)
INSERT INTO users (username, email, password, full_name, role_id) VALUES
('admin', 'admin@acp.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'System Administrator', 1);

-- Faculty users (password: Faculty@123)
INSERT INTO users (username, email, password, full_name, role_id) VALUES
('dr.sharma', 'sharma@acp.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'Dr. Rajesh Sharma', 2),
('dr.priya', 'priya@acp.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'Dr. Priya Nair', 2);

-- Student users (password: Student@123)
INSERT INTO users (username, email, password, full_name, role_id) VALUES
('student1', 's1@acp.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'Arjun Reddy', 3),
('student2', 's2@acp.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'Sneha Patel', 3);

-- Departments
INSERT INTO departments (name, code, head_id, description) VALUES
('Computer Science', 'CS', 2, 'CS & Engineering'),
('Mathematics',      'MATH', 3, 'Pure & Applied Mathematics');

-- Courses
INSERT INTO courses (title, code, description, credits, max_students, department_id, faculty_id, semester, academic_year, schedule, room) VALUES
('Data Structures & Algorithms', 'CS101', 'Core DSA course', 4, 60, 1, 2, 'Fall', '2024-25', 'Mon/Wed 09:00-10:30', 'LH-101'),
('Database Management Systems',  'CS201', 'DBMS fundamentals', 3, 50, 1, 2, 'Fall', '2024-25', 'Tue/Thu 11:00-12:30', 'LH-202'),
('Web Development',              'CS301', 'Full Stack Web Dev', 3, 40, 1, 3, 'Fall', '2024-25', 'Mon/Wed/Fri 14:00-15:00', 'LH-103'),
('Calculus I',                   'MATH101', 'Differential Calculus', 4, 80, 2, 3, 'Fall', '2024-25', 'Tue/Thu 09:00-10:30', 'LH-201'),
('Linear Algebra',               'MATH201', 'Matrices & Vectors', 3, 60, 2, 3, 'Fall', '2024-25', 'Mon/Wed 11:00-12:30', 'LH-301');

-- Prerequisites (CS201 requires CS101)
INSERT INTO course_prerequisites (course_id, prerequisite_id) VALUES (2, 1);

-- Sample enrollments
INSERT INTO enrollments (student_id, course_id, status) VALUES
(4, 1, 'ENROLLED'),
(4, 4, 'ENROLLED'),
(5, 1, 'ENROLLED'),
(5, 3, 'ENROLLED');
