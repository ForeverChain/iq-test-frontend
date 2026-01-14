import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (email, password) => api.post("/auth/login", { email, password });

export const register = (username, email, password) => api.post("/auth/register", { username, email, password });

export const getMe = () => api.get("/auth/me");

// Test
export const getQuestions = () => api.get("/test/questions");

export const submitTest = (answers) => api.post("/test/submit", { answers });

export const getTestHistory = () => api.get("/test/history");

export const getTestResult = (id) => api.get(`/test/result/${id}`);

// Transactions
export const getBalance = () => api.get("/transactions/balance");

export const createTransfer = (receiverId, amount) => api.post("/transactions/transfer", { receiverId, amount });

export const getTransactionHistory = () => api.get("/transactions/history");

export const searchUsers = (q) => api.get(`/transactions/users/search?q=${q}`);

// Admin
export const getAllUsers = () => api.get("/admin/users");

export const getUserDetails = (id) => api.get(`/admin/users/${id}`);

export const updateUserBalance = (id, amount) => api.patch(`/admin/users/${id}/balance`, { amount });

export const getAdminStats = () => api.get("/admin/stats");

export const getAllTransactions = () => api.get("/transactions/admin/all");

export const updateTransactionStatus = (id, status) => api.patch(`/transactions/admin/${id}/status`, { status });

// Admin - questions/tests
export const getAdminQuestions = (testId) => api.get(`/admin/questions${testId ? `?testId=${testId}` : ""}`);
export const createQuestion = (payload) => api.post("/admin/questions", payload);
export const deleteQuestion = (id) => api.delete(`/admin/questions/${id}`);
export const updateQuestion = (id, payload) => api.patch(`/admin/questions/${id}`, payload);
export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getAllTests = () => api.get("/admin/tests");
export const createTest = (payload) => api.post("/admin/tests", payload);
export const updateTest = (id, payload) => api.patch(`/admin/tests/${id}`, payload);
export const deleteTest = (id) => api.delete(`/admin/tests/${id}`);

export default api;
