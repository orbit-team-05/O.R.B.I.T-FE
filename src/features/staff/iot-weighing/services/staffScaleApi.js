import { httpClient } from "../../../../services/httpClient";

function endpoint(farmId) {
    return `/farms/${farmId}/iot-devices`;
}

export async function getStaffScaleDevices(farmId) {
    const response = await httpClient.get(endpoint(farmId), {
        params: { page: 0, size: 50 },
    });
    const payload = response?.data?.data ?? response?.data ?? {};
    return Array.isArray(payload) ? payload : payload.content || [];
}

export async function getStaffLatestWeight(farmId, deviceId) {
    const response = await httpClient.get(`${endpoint(farmId)}/${deviceId}/latest-weight`);
    return response?.data?.data ?? response?.data ?? null;
}
