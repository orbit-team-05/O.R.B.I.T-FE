import { httpClient } from "../../../../services/httpClient.js";
import { normalizePageResponse } from "../../../../utils/pagination";

export async function getOwnerInventoryStocks(farmId, category = "", page = 0, size = 10, warehouse = "MATERIAL", sort = "createdAt,desc") {
    const params = { page, size, warehouse, sort };
    if (category) {
        params.category = category;
    }
    const response = await httpClient.get(
        `/farms/${farmId}/inventory/stocks`,
        { params },
    );

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getOwnerInventoryStockDetail(farmId, stockId) {
    const response = await httpClient.get(
        `/farms/${farmId}/inventory/stocks/${stockId}`,
    );

    return response.data.data;
}
export async function getOwnerPendingTransactions(farmId, page = 0, size = 10, warehouse = "MATERIAL", sort = "createdAt,desc") {
    const response = await httpClient.get(
        `/farms/${farmId}/inventory/pending-transactions`,
        { params: { page, size, warehouse, sort } }
    );
    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function approveOwnerTransaction(farmId, transactionId, isApproved, updates = {}) {
    const response = await httpClient.post(
        `/farms/${farmId}/inventory/transactions/${transactionId}/approve`,
        { isApproved, ...updates }
    );
    return response.data;
}

export async function getOwnerTransactionDetail(farmId, transactionId) {
    const response = await httpClient.get(
        `/farms/${farmId}/inventory/transactions/${transactionId}`,
    );
    return response.data;
}
