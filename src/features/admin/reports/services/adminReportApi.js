import { httpClient } from "../../../../services/httpClient";

const REPORT_ENDPOINT = "/admin/reports";

function toParams(filters = {}) {
    return {
        from: filters.from,
        to: filters.to,
        farmId: filters.farmId || undefined,
        requestedAction: filters.requestedAction || undefined,
        approvalStatus: filters.approvalStatus || undefined,
        deviceId: filters.deviceId || undefined,
        keyword: filters.keyword?.trim() || undefined,
        page: filters.page ?? 0,
        size: filters.size ?? 50,
        sort: filters.sort ?? "createdAt,desc",
    };
}

export async function getAdminTransactionReport(filters) {
    const response = await httpClient.get(`${REPORT_ENDPOINT}/transactions`, {
        params: toParams(filters),
    });
    return response.data.data;
}

export async function exportAdminTransactionReport(filters) {
    return httpClient.get(`${REPORT_ENDPOINT}/transactions/export`, {
        params: toParams(filters),
        responseType: "blob",
        headers: { Accept: "application/pdf" },
    });
}

export async function getAdminSystemReport() {
    const response = await httpClient.get(`${REPORT_ENDPOINT}/system-summary`);
    return response.data.data;
}

export async function exportAdminSystemReport() {
    return httpClient.get(`${REPORT_ENDPOINT}/system-summary/export`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
    });
}

export async function getReportFarms() {
    const response = await httpClient.get("/admin/farms/options", {
        params: { limit: 100 },
    });
    return response.data.data;
}
