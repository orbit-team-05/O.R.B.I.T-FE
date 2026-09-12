import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

export async function getStaffTransactionHistory({ status = "", page = 0, size = 10, sort = "createdAt,desc" } = {}) {
    const response = await httpClient.get("/staff/transactions", {
        params: { status: status || undefined, page, size, sort },
    });
    return normalizePageResponse(response?.data?.data ?? response?.data, size);
}
