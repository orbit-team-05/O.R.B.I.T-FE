import { httpClient } from "../../../../services/httpClient";

function getOwnerIotDeviceEndpoint(farmId) {
    return `/farms/${farmId}/iot-devices`;
}

export async function getOwnerIotDevices(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getOwnerIotDeviceEndpoint(farmId), {
        params: { page, size },
    });

    return response.data.data;
}

export async function getOwnerIotDeviceDetail(farmId, deviceId) {
    const response = await httpClient.get(
        `${getOwnerIotDeviceEndpoint(farmId)}/${deviceId}`,
    );

    return response.data.data;
}

export async function activateOwnerIotDevice(farmId, payload) {
    const response = await httpClient.post(
        `${getOwnerIotDeviceEndpoint(farmId)}/activate`,
        payload,
    );

    return response.data.data;
}