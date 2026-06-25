import { httpClient } from "../../../services/httpClient";

/**
 * Gọi API đăng nhập.
 *
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<{ token, refreshToken, tokenType, userId, email, fullName, roles, farmId }>}
 */
export async function loginApi({ identifier, password }) {
    const response = await httpClient.post("/auth/login", { identifier, password });

    return response.data.data;
}

/**
 * Gọi API làm mới access token bằng refresh token.
 * Sử dụng axios instance riêng (không qua interceptor) để tránh vòng lặp vô hạn.
 *
 * @param {string} refreshToken
 * @returns {Promise<{ token, refreshToken, tokenType }>}
 */
export async function refreshTokenApi(refreshToken) {
    const response = await httpClient.post(
        "/auth/refresh",
        { refreshToken },
        { _skipAuthRefresh: true },
    );

    return response.data.data;
}
