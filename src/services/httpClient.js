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

        return Promise.reject(error);
    },
);