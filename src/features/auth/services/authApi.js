import { httpClient } from "../../../services/httpClient";

const DEVICE_ID_KEY = "orbit_device_id";

function getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

/**
 * Gọi API đăng nhập.
 *
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<{ token, refreshToken, tokenType, userId, email, fullName, role, roles, farmId, sessionId }>}
 */
export async function loginApi({ identifier, password }) {
    const response = await httpClient.post("/auth/login", {
        identifier,
        password,
        clientType: "WEB",
        deviceId: getDeviceId(),
        deviceName: window.navigator.userAgent.slice(0, 150),
    });

    return response.data.data;
}

/**
 * Gọi API làm mới access token bằng refresh-token cookie của Web.
 *
 * @returns {Promise<{ token, refreshToken, tokenType, sessionId }>}
 */
export async function refreshTokenApi() {
    const response = await httpClient.post(
        "/auth/refresh",
        {},
        { _skipAuthRefresh: true, _silentAuthFailure: true },
    );

    return response.data.data;
}

export async function logoutApi() {
    return httpClient.post("/auth/logout");
}

export async function logoutAllApi() {
    return httpClient.post("/auth/logout-all");
}
