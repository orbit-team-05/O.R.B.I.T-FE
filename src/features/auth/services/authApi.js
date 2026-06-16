import { httpClient } from "../../../services/httpClient";

/**
 * Gọi API đăng nhập.
 *
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<{ token, tokenType, userId, email, fullName, roles, farmId }>}
 */
export async function loginApi({ identifier, password }) {
    const response = await httpClient.post("/auth/login", { identifier, password });

    return response.data.data;
}
