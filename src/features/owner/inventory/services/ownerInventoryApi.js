import { httpClient } from "../../../../services/httpClient.js";

export async function getOwnerInventoryStocks(farmId, page = 0, size = 10) {
    const response = await httpClient.get(
        `/farms/${farmId}/inventory/stocks`,
        {
            params: { page, size },
        },
    );

    return response.data.data;
}

export async function getOwnerInventoryStockDetail(farmId, stockId) {
    const response = await httpClient.get(
        `/farms/${farmId}/inventory/stocks/${stockId}`,
    );

    return response.data.data;
}