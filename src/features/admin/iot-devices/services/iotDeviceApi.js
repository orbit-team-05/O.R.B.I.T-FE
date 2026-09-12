import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

const IOT_DEVICE_ENDPOINT = "/admin/iot-devices";

export async function getIotDevices(page = 0, size = 10, sort = "createdAt,desc") {
    const response = await httpClient.get(IOT_DEVICE_ENDPOINT, {
        params: { page, size, sort },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getUncreatedIotDevices(page = 0, size = 10, sort = "createdAt,desc") {
    const response = await httpClient.get(`${IOT_DEVICE_ENDPOINT}/uncreated`, {
        params: { page, size, sort },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getUnassignedIotDevices(page = 0, size = 10, sort = "createdAt,desc") {
    const response = await httpClient.get(`${IOT_DEVICE_ENDPOINT}/unassigned`, {
        params: { page, size, sort },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getIotDeviceSummary() {
    const response = await httpClient.get(`${IOT_DEVICE_ENDPOINT}/summary`);
    return response.data.data;
}

export async function getIotDeviceDetail(deviceId) {
    const response = await httpClient.get(`${IOT_DEVICE_ENDPOINT}/${deviceId}`);
    return response.data.data;
}

export async function createIotDeviceFromMac(macRecordId, payload) {
    const response = await httpClient.post(
        `${IOT_DEVICE_ENDPOINT}/uncreated/${macRecordId}/create`,
        payload,
    );

    return response.data.data;
}

export async function uploadIotDeviceImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.post(`${IOT_DEVICE_ENDPOINT}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data;
}

export async function updateIotDeviceStatus(deviceId, status) {
    const response = await httpClient.patch(
        `${IOT_DEVICE_ENDPOINT}/${deviceId}/status`,
        null,
        { params: { status } },
    );

    return response.data.data;
}
