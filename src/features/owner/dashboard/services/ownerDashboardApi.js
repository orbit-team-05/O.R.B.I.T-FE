import { httpClient } from "../../../../services/httpClient";

function normalizePageResponse(pageData) {
    const content = Array.isArray(pageData?.content) ? pageData.content : [];
    const number = Number(
        pageData?.number ?? pageData?.page ?? pageData?.pageable?.pageNumber ?? 0,
    );
    const size = Number(
        pageData?.size ?? pageData?.pageSize ?? pageData?.pageable?.pageSize ?? content.length,
    );
    const totalElements = Number(pageData?.totalElements ?? content.length);
    const totalPages = Number(
        pageData?.totalPages ??
            (size > 0 ? Math.ceil(totalElements / size) : content.length ? 1 : 0),
    );

    return {
        ...pageData,
        content,
        number,
        page: number,
        size,
        totalElements,
        totalPages,
        first: pageData?.first ?? number <= 0,
        last: pageData?.last ?? number >= Math.max(totalPages - 1, 0),
        empty: pageData?.empty ?? content.length === 0,
    };
}

export async function getOwnerDashboardSummary(farmId) {
    const response = await httpClient.get(`/dashboard/${farmId}/summary`);

    return response.data ?? null;
}

export async function getOwnerDashboardStockAlerts(
    farmId,
    page = 0,
    size = 5,
) {
    const response = await httpClient.get(`/dashboard/${farmId}/stock-alerts`, {
        params: { page, size },
    });

    return normalizePageResponse(response.data);
}

export async function getOwnerDashboardRecentScans(
    farmId,
    page = 0,
    size = 5,
) {
    const response = await httpClient.get(
        `/dashboard/${farmId}/recent-iot-scans`,
        {
            params: { page, size },
        },
    );

    return normalizePageResponse(response.data);
}
