import axios from 'axios';

// All requests go through the API Gateway
const API_BASE = 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ─── Auth ─────────────────────────────────────────────────
export const authAPI = {
    login:    (data) => api.post('/api/auth/login', data),
    register: (data) => api.post('/api/auth/register', data),
};

// ─── Courses ──────────────────────────────────────────────
export const courseAPI = {
    getAll:       ()         => api.get('/api/courses'),
    getById:      (id)       => api.get(`/api/courses/${id}`),
    search:       (keyword)  => api.get(`/api/courses/search?keyword=${keyword}`),
    create:       (data)     => api.post('/api/courses/create', data),
    update:       (id, data) => api.put(`/api/courses/update/${id}`, data),
    delete:       (id)       => api.delete(`/api/courses/delete/${id}`),
    byDepartment: (id)       => api.get(`/api/courses/department/${id}`),
    byFaculty:    (id)       => api.get(`/api/courses/faculty/${id}`),
};

// ─── Enrollments ──────────────────────────────────────────
export const enrollmentAPI = {
    enroll:      (studentId, courseId)   => api.post('/api/enrollments/enroll', { studentId, courseId }),
    drop:        (studentId, courseId)   => api.put('/api/enrollments/drop', { studentId, courseId }),
    byStudent:   (id)                    => api.get(`/api/enrollments/student/${id}`),
    byCourse:    (id)                    => api.get(`/api/enrollments/course/${id}`),
    updateGrade: (enrollmentId, grade)   => api.put(`/api/enrollments/${enrollmentId}/grade`, { grade }),
};

// ─── Announcements ────────────────────────────────────────
export const announcementAPI = {
    getAll:  (params)   => api.get('/api/announcements', { params }),
    create:  (data)     => api.post('/api/announcements', data),
    update:  (id, data) => api.put(`/api/announcements/${id}`, data),
    delete:  (id)       => api.delete(`/api/announcements/${id}`),
};

// ─── Notifications ────────────────────────────────────────
export const notificationAPI = {
    getForUser: (userId) => api.get(`/api/notifications/${userId}`),
    markRead:   (id)     => api.put(`/api/notifications/${id}/read`),
};

// ─── Departments ──────────────────────────────────────────
export const departmentAPI = {
    getAll:  ()        => api.get('/api/departments'),
    create:  (data)    => api.post('/api/departments', data),
    delete:  (id)      => api.delete(`/api/departments/${id}`),
};

// ─── Materials ────────────────────────────────────────────
export const materialAPI = {
    getAll:  (params)  => api.get('/api/materials', { params }),
    create:  (data)    => api.post('/api/materials', data),
    delete:  (id)      => api.delete(`/api/materials/${id}`),
    search:  (query)   => api.get(`/api/materials/search?q=${query}`),
};

// ─── Reports ──────────────────────────────────────────────
export const reportAPI = {
    admin:   ()    => api.get('/api/reports/admin'),
    faculty: (id)  => api.get(`/api/reports/faculty/${id}`),
    student: (id)  => api.get(`/api/reports/student/${id}`),
};

export default api;