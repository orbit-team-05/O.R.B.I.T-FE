import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

export async function getOwnerDashboardSummary(farmId, filters = {}) {
    const response = await httpClient.get(`/dashboard/${farmId}/summary`, {
        params: filters,
    });

    return response.data ?? null;
}

export async function getOwnerDashboardStockAlerts(
    farmId,
    page = 0,
    size = 5,
    sort = "createdAt,desc",
) {
    const response = await httpClient.get(`/dashboard/${farmId}/stock-alerts`, {
        params: { page, size, sort },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getOwnerDashboardRecentScans(
    farmId,
    page = 0,
    size = 5,
    sort = "createdAt,desc",
) {
    const response = await httpClient.get(
        `/dashboard/${farmId}/recent-transactions`,
        {
            params: { page, size, sort },
        },
    );

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getOwnerDashboardRecentTransactions(farmId, page = 0, size = 6) {
    return getOwnerDashboardRecentScans(farmId, page, size);
}

export async function getOwnerFarmTransactionReport(farmId, filters) {
    const response = await httpClient.get(`/owner/reports/${farmId}/transactions`, {
        params: { sort: "createdAt,desc", ...filters },
    });
    return response.data.data;
}

export async function exportOwnerFarmTransactionReport(farmId, filters) {
    const response = await httpClient.get(`/owner/reports/${farmId}/transactions/export`, {
        params: { sort: "createdAt,desc", ...filters },
        responseType: "blob",
        headers: { Accept: "application/pdf" },
    });
    return response.data;
}
