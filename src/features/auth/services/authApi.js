import { httpClient } from "../../../services/httpClient";

/**
 * Gọi API đăng nhập.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token, tokenType, userId, email, fullName, roles, farmId }>}
 */
export async function loginApi({ email, password }) {
    const response = await httpClient.post("/auth/login", { email, password });

    return response.data.data;
}
