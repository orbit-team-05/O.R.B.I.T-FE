import axios from "axios";

const STORAGE_USER_KEY = "orbit_user";

let accessToken = null;

export function setAccessToken(token) {
    accessToken = token || null;
}

export function getAccessToken() {
    return accessToken;
}

export function clearAccessToken() {
    accessToken = null;
}

export const httpClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
    withCredentials: true,
});

httpClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Let the browser generate the multipart boundary for file uploads.
        // The client has a JSON default header, which must not be sent with FormData.
        if (typeof FormData !== "undefined" && config.data instanceof FormData) {
            config.headers = config.headers || {};
            delete config.headers["Content-Type"];
            delete config.headers["content-type"];
        }

        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
}

function forceLogout(reason = "session_expired") {
    clearAccessToken();
    localStorage.removeItem(STORAGE_USER_KEY);
    window.location.href = `/login?reason=${reason}`;
}

async function refreshAccessToken() {
    const response = await httpClient.post(
        "/auth/refresh",
        {},
        { _skipAuthRefresh: true },
    );
    const newToken = response.data.data.token;
    setAccessToken(newToken);
    return newToken;
}

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};

        if (error?.response?.status === 401) {
            const serverMsg = error.response.data?.message;
            const isAuthEndpoint = originalRequest.url?.includes("/auth/login")
                || originalRequest.url?.includes("/auth/refresh");

            if (isAuthEndpoint) {
                return Promise.reject(error);
            }

            if (["USER_LOCKED", "USER_DISABLED"].includes(serverMsg)) {
                forceLogout("user_locked");
                return Promise.reject(error);
            }

            if (["AUTH_SESSION_REVOKED", "AUTH_SESSION_EXPIRED", "AUTH_REFRESH_REUSED"]
                .includes(serverMsg)) {
                forceLogout("session_expired");
                return Promise.reject(error);
            }

            if (originalRequest._skipAuthRefresh || originalRequest._retry) {
                forceLogout("session_expired");
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    originalRequest._retry = true;
                    return httpClient(originalRequest);
                });
            }

            isRefreshing = true;
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return httpClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                forceLogout("session_expired");
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (!error.response) {
            error.message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
        } else if (error.response.status >= 500) {
            error.message = "Hệ thống đang gặp sự cố, vui lòng thử lại sau.";
        } else if (error.response.status === 404) {
            error.message = "Không tìm thấy dữ liệu yêu cầu hoặc đường dẫn không hợp lệ.";
        }

        return Promise.reject(error);
    },
);
