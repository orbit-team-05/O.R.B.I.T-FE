import { httpClient } from "../../../../services/httpClient.js";

function getOwnerIotScanEndpoint(farmId) {
    return `/farms/${farmId}/iot-scans`;
}

function normalizeIotScan(item) {
    return {
        ...item,

        // Giữ tên field cũ để table/detail không vỡ
        aiPredictedName: item.aiPredictedName || item.productName,
        aiConfidence: item.aiConfidence ?? (item.productId ? 1 : 0),

        needKeypadInput: item.needKeypadInput ?? !item.productId,

        nextAction:
            item.nextAction ??
            (item.productId ? "DONE" : "ENTER_KEYPAD_CODE"),

        hasAudio: item.hasAudio ?? Boolean(item.audioUrl),
    };
}

function normalizePage(pageData) {
    return {
        ...pageData,
        content: (pageData?.content ?? []).map(normalizeIotScan),
    };
}

export async function getOwnerIotScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getOwnerIotScanEndpoint(farmId), {
        params: { page, size },
    });

    return normalizePage(response.data.data);
}

export async function getOwnerIotScanDetail(farmId, transactionId) {
    const response = await httpClient.get(
        `${getOwnerIotScanEndpoint(farmId)}/${transactionId}`,
    );

    return normalizeIotScan(response.data.data);
}