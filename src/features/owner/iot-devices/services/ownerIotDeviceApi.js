import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

function getOwnerIotDeviceEndpoint(farmId) {
    return `/farms/${farmId}/iot-devices`;
}

export async function getOwnerIotDevices(farmId, page = 0, size = 10, sort = "createdAt,desc") {
    const response = await httpClient.get(getOwnerIotDeviceEndpoint(farmId), {
        params: { page, size, sort },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getOwnerIotDeviceDetail(farmId, deviceId) {
    const response = await httpClient.get(
        `${getOwnerIotDeviceEndpoint(farmId)}/${deviceId}`,
    );

    return response.data.data;
}

export async function getOwnerLatestScaleWeight(farmId, deviceId) {
    const response = await httpClient.get(
        `${getOwnerIotDeviceEndpoint(farmId)}/${deviceId}/latest-weight`,
    );

    return response.data.data;
}

export async function getOwnerScaleDeviceAuditLogs(farmId, deviceId, page = 0, size = 10, sort = "createdAt,desc") {
    const response = await httpClient.get(
        `${getOwnerIotDeviceEndpoint(farmId)}/${deviceId}/audit-logs`,
        { params: { page, size, sort } },
    );
    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function updateOwnerScaleDeviceProfile(farmId, deviceId, payload) {
    const response = await httpClient.patch(
        `${getOwnerIotDeviceEndpoint(farmId)}/${deviceId}/profile`,
        payload,
    );
    return response.data.data;
}

export async function uploadOwnerScaleDeviceImage(farmId, deviceId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post(
        `${getOwnerIotDeviceEndpoint(farmId)}/${deviceId}/image`,
        formData,
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
