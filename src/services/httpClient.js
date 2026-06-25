import axios from "axios";

const STORAGE_TOKEN_KEY = "orbit_access_token";
const STORAGE_REFRESH_TOKEN_KEY = "orbit_refresh_token";
const STORAGE_USER_KEY = "orbit_user";

export const httpClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// ── Request interceptor: tự động gắn Bearer token ──
httpClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_TOKEN_KEY);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ── Refresh token queue ──
// Đảm bảo chỉ có 1 request refresh tại một thời điểm.
// Các request 401 khác sẽ chờ kết quả refresh rồi retry.
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
}

/**
 * Buộc đăng xuất: xoá localStorage và redirect về login.
 */
function forceLogout(reason = "session_expired") {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    window.location.href = `/login?reason=${reason}`;
}

// ── Response interceptor: auto-refresh khi 401 ──
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Xử lý 401 Unauthorized
        if (error?.response?.status === 401) {
            const serverMsg = error.response.data?.message;

            // Nếu bị khoá hoặc concurrent login → đá ra luôn, không thử refresh
            if (serverMsg === "USER_LOCKED") {
                forceLogout("user_locked");
                return Promise.reject(error);
            }
            if (serverMsg === "CONCURRENT_LOGIN") {
                forceLogout("concurrent_login");
                return Promise.reject(error);
            }

            // Nếu request này đã được đánh dấu skip refresh (ví dụ chính là request /auth/refresh)
            // hoặc đã retry rồi → đá ra login
            if (originalRequest._skipAuthRefresh || originalRequest._retry) {
                forceLogout("session_expired");
                return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY);

            // Không có refresh token → đá ra login
            if (!refreshToken) {
                forceLogout("session_expired");
                return Promise.reject(error);
            }

            // Nếu đang refresh → đưa request vào queue chờ
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    originalRequest._retry = true;
                    return httpClient(originalRequest);
                });
            }

            // Bắt đầu refresh
            isRefreshing = true;
            originalRequest._retry = true;

            try {
                const response = await httpClient.post(
                    "/auth/refresh",
                    { refreshToken },
                    { _skipAuthRefresh: true },
                );

                const data = response.data.data;
                const newAccessToken = data.token;
                const newRefreshToken = data.refreshToken;

                // Lưu token mới
                localStorage.setItem(STORAGE_TOKEN_KEY, newAccessToken);
                localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, newRefreshToken);

                // Xử lý queue chờ
                processQueue(null, newAccessToken);

                // Retry request gốc với token mới
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return httpClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                forceLogout("session_expired");
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // ── Map lỗi hệ thống thành thông báo thân thiện ──
        if (error) {
            if (!error.response) {
                error.message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
            } else {
                const status = error.response.status;
                if (status >= 500) {
                    const friendlyMessage = "Hệ thống đang gặp sự cố, vui lòng thử lại sau.";
                    if (!error.response.data || typeof error.response.data !== "object") {
                        error.response.data = {};
                    }
                    error.response.data.message = friendlyMessage;
                    error.message = friendlyMessage;
                } else if (status === 404) {
                    const friendlyMessage = "Không tìm thấy dữ liệu yêu cầu hoặc đường dẫn không hợp lệ.";
                    if (!error.response.data || typeof error.response.data !== "object") {
                        error.response.data = {};
                    }
                    error.response.data.message = friendlyMessage;
                    error.message = friendlyMessage;
                } else {
                    const msg = error.response.data?.message;
                    if (!msg || typeof msg !== "string") {
                        const friendlyMessage = "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại.";
                        if (!error.response.data || typeof error.response.data !== "object") {
                            error.response.data = {};
                        }
                        error.response.data.message = friendlyMessage;
                        error.message = friendlyMessage;
                    }
                }
            }
        }

        return Promise.reject(error);
    },
);