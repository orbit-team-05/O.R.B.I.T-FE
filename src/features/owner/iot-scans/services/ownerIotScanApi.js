import { httpClient } from "../../../../services/httpClient.js";

function getOwnerIotImportEndpoint(farmId) {
    return `/farms/${farmId}/iot-imports`;
}

function normalizeImportScan(item) {
    return {
        ...item,

        // Giữ tên field cũ để table/detail cũ không vỡ
        aiPredictedName: item.productName,
        aiConfidence: item.productId ? 1 : 0,

        needKeypadInput: item.needKeypadInput ?? !item.productId,
        nextAction:
            item.nextAction ??
            (item.productId ? "WAIT_OWNER_CONFIRM" : "ENTER_KEYPAD_CODE"),

        hasAudio: item.hasAudio ?? Boolean(item.audioUrl),
    };
}

function normalizePage(pageData) {
    return {
        ...pageData,
        content: (pageData?.content ?? []).map(normalizeImportScan),
    };
}

export async function getOwnerIotScans(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getOwnerIotImportEndpoint(farmId), {
        params: { page, size },
    });

    return normalizePage(response.data.data);
}

export async function getOwnerIotScanDetail(farmId, transactionId) {
    const response = await httpClient.get(
        `${getOwnerIotImportEndpoint(farmId)}/${transactionId}`,
    );

    return normalizeImportScan(response.data.data);
}