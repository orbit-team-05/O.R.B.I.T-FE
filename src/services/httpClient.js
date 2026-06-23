import axios from "axios";

const STORAGE_TOKEN_KEY = "orbit_access_token";
const STORAGE_USER_KEY = "orbit_user";

export const httpClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

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


httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            const token = localStorage.getItem(STORAGE_TOKEN_KEY);

            if (token) {
                localStorage.removeItem(STORAGE_TOKEN_KEY);
                localStorage.removeItem(STORAGE_USER_KEY);
                window.location.href = "/login";
            }
        }

        // Map core/system errors to user-friendly messages globally
        if (error) {
            if (!error.response) {
                // Connection or Network issues (server down, CORS blocks, etc.)
                error.message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
            } else {
                const status = error.response.status;
                if (status >= 500) {
                    // Gateway errors (502, 503, 504) or Internal Server Error (500)
                    const friendlyMessage = "Hệ thống đang gặp sự cố, vui lòng thử lại sau.";
                    if (!error.response.data || typeof error.response.data !== "object") {
                        error.response.data = {};
                    }
                    error.response.data.message = friendlyMessage;
                    error.message = friendlyMessage;
                } else if (status === 404) {
                    // Page / Resource Not Found
                    const friendlyMessage = "Không tìm thấy dữ liệu yêu cầu hoặc đường dẫn không hợp lệ.";
                    if (!error.response.data || typeof error.response.data !== "object") {
                        error.response.data = {};
                    }
                    error.response.data.message = friendlyMessage;
                    error.message = friendlyMessage;
                } else {
                    // Non-5xx/404 errors (like 400, 403 etc.)
                    // Check if error.response.data has a valid message string, otherwise provide generic
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