import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

export async function getStaffTransactionHistory({ status = "", page = 0, size = 10 } = {}) {
    const response = await httpClient.get("/staff/transactions", {
        params: { status: status || undefined, page, size },
    });
    return normalizePageResponse(response?.data?.data ?? response?.data, size);
}
