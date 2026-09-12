import { httpClient } from "../../../../services/httpClient.js";

export async function getOwnerInventorySummary(farmId, warehouse = "MATERIAL") {
    const response = await httpClient.get(`/farms/${farmId}/inventory/summary`, {
        params: { warehouse },
    });
    return response.data.data;
}
