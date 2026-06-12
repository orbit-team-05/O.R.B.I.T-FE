import { httpClient } from "../../../../services/httpClient.js";

function getOwnerIotScanEndpoint(farmId) {
    return `/farms/${farmId}/iot-scans`;
}

export async function getOwnerIotScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getOwnerIotScanEndpoint(farmId), {
        params: { page, size },
    });

    return response.data.data;
}

export async function getOwnerIotScanDetail(farmId, transactionId) {
    const response = await httpClient.get(
        `${getOwnerIotScanEndpoint(farmId)}/${transactionId}`,
    );

    return response.data.data;
}