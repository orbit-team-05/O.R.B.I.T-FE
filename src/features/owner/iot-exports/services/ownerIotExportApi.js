import { httpClient } from "../../../../services/httpClient";

function getEndpoint(farmId) {
    return `/farms/${farmId}/iot-exports`;
}

export async function getPendingExportScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(`${getEndpoint(farmId)}/pending`, {
        params: { page, size },
    });

    return response.data.data;
}

export async function getExportScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getEndpoint(farmId), {
        params: { page, size },
    });

    return response.data.data;
}

export async function getExportScanDetail(farmId, transactionId) {
    const response = await httpClient.get(
        `${getEndpoint(farmId)}/${transactionId}`,
    );

    return response.data.data;
}

export async function confirmExportScan(farmId, transactionId) {
    const response = await httpClient.patch(
        `${getEndpoint(farmId)}/${transactionId}/confirm`,
    );

    return response.data.data;
}