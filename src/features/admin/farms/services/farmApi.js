import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

const FARM_ENDPOINT = "/admin/farms";

export async function getFarms(page = 0, size = 10, filters = {}) {
    const response = await httpClient.get(FARM_ENDPOINT, {
        params: { page, size, ...filters },
    });
    return normalizePageResponse(response.data?.data ?? response.data, size);
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
    const response = await httpClient.patch(`${FARM_ENDPOINT}/${farmId}`, payload);
    return response.data.data;
}

export async function updateFarmStatus(farmId, active) {
    const response = await httpClient.patch(`${FARM_ENDPOINT}/${farmId}/status`, null, {
        params: { active },
    });
    return response.data.data;
}

export async function uploadFarmImage(farmId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post(`${FARM_ENDPOINT}/${farmId}/image`, formData);
    return response.data.data;
}

export async function getOwnersList() {
    const response = await httpClient.get("/admin/users/owners");
    return response.data.data;
}
