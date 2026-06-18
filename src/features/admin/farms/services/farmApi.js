import { httpClient } from "../../../../services/httpClient";

const FARM_ENDPOINT = "/admin/farms";

export async function getFarms(page = 0, size = 10) {
    const response = await httpClient.get(FARM_ENDPOINT, {
        params: { page, size },
    });

    return response.data.data;
}

export async function getFarmSummary() {
    const response = await httpClient.get(`${FARM_ENDPOINT}/summary`);

    return response.data.data;
}

export async function getFarmById(farmId) {
    const response = await httpClient.get(`${FARM_ENDPOINT}/${farmId}`);

    return response.data.data;
}

export async function createFarm(payload) {
    const response = await httpClient.post(FARM_ENDPOINT, payload);

    return response.data.data;
}

export async function updateFarm(farmId, payload) {
    const response = await httpClient.put(
        `${FARM_ENDPOINT}/${farmId}`,
        payload,
    );

    return response.data.data;
}

export async function deleteFarm(farmId) {
    const response = await httpClient.delete(`${FARM_ENDPOINT}/${farmId}`);

    return response.data;
}
