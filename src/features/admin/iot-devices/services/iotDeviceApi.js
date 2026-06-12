import { httpClient } from "../../../../services/httpClient";

const IOT_DEVICE_ENDPOINT = "/admin/iot-devices";

export async function getIotDevices(page = 0, size = 10) {
    const response = await httpClient.get(IOT_DEVICE_ENDPOINT, {
        params: { page, size },
    });

    return response.data.data;
}

export async function getUnassignedIotDevices(page = 0, size = 5) {
    const response = await httpClient.get(`${IOT_DEVICE_ENDPOINT}/unassigned`, {
        params: { page, size },
    });

    return response.data.data;
}

export async function getIotDeviceSummary() {
    const response = await httpClient.get(`${IOT_DEVICE_ENDPOINT}/summary`);

    return response.data.data;
}

export async function createIotDevice(payload) {
    const response = await httpClient.post(IOT_DEVICE_ENDPOINT, payload);

    return response.data.data;
}

export async function updateIotDeviceStatus(deviceId, status) {
    const response = await httpClient.patch(
        `${IOT_DEVICE_ENDPOINT}/${deviceId}/status`,
        null,
        {
            params: { status },
        },
    );

    return response.data.data;
}

export async function replaceIotDeviceComponent(deviceId, payload) {
    const response = await httpClient.patch(
        `${IOT_DEVICE_ENDPOINT}/${deviceId}/replace-component`,
        payload,
    );

    return response.data.data;
}