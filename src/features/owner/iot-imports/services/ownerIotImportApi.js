import { httpClient } from "../../../../services/httpClient";

function getEndpoint(farmId) {
    return `/farms/${farmId}/iot-imports`;
}

export async function getPendingImportScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(`${getEndpoint(farmId)}/pending`, {
        params: { page, size },
    });

    return response.data.data;
}

export async function confirmImportScan(
    farmId,
    transactionId,
    totalImportCost,
    packageCount = 1,
) {
    const response = await httpClient.patch(
        `${getEndpoint(farmId)}/${transactionId}/confirm`,
        {
            totalImportCost: Number(totalImportCost),
            packageCount: Number(packageCount || 1),
        },
    );

    return response.data.data;
}