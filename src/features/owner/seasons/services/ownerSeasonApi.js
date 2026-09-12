import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

export async function getSeasonDashboard() {
    const response = await httpClient.get("/seasons/dashboard");
    return response.data.data;
}

export async function getSeasonCards(page = 0, size = 10) {
    const response = await httpClient.get("/seasons/cards", {
        params: { page, size },
    });
    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function createSeason(payload) {
    const response = await httpClient.post("/seasons", payload);
    return response.data.data;
}

export async function uploadSeasonImage(id, file) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await httpClient.post(`/seasons/${id}/image`, formData);
    return response.data.data;
}

export async function getSeasonDetail(id) {
    const response = await httpClient.get(`/seasons/${id}`);
    return response.data.data;
}

export async function updateSeason(id, payload) {
    const response = await httpClient.patch(`/seasons/${id}`, payload);
    return response.data.data;
}

export async function updateSeasonStatus(id, payload) {
    const response = await httpClient.patch(`/seasons/${id}/status`, payload);
    return response.data.data;
}

export async function cancelSeason(id) {
    const response = await httpClient.patch(`/seasons/${id}/cancel`);
    return response.data.data;
}

export async function getSeasonMaterialUsages(id, page = 0, size = 10) {
    const response = await httpClient.get(`/seasons/${id}/material-usages`, {
        params: { page, size },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getSeasonHarvests(id, page = 0, size = 10) {
    const response = await httpClient.get(`/seasons/${id}/harvests`, {
        params: { page, size },
    });

    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function getSeasonHarvestHistories(id, page = 0, size = 10) {
    const response = await httpClient.get(`/seasons/${id}/harvests`, {
        params: { page, size },
    });
    return normalizePageResponse(response.data?.data ?? response.data, size);
}

// Other Costs
export async function getSeasonOtherCosts(id, page = 0, size = 10) {
    const response = await httpClient.get(`/seasons/${id}/other-costs`, {
        params: { page, size },
    });
    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function createSeasonOtherCost(id, payload) {
    const response = await httpClient.post(`/seasons/${id}/other-costs`, payload);
    return response.data.data;
}

export async function updateSeasonOtherCost(id, costId, payload) {
    const response = await httpClient.put(`/seasons/${id}/other-costs/${costId}`, payload);
    return response.data.data;
}

export async function deleteSeasonOtherCost(id, costId) {
    const response = await httpClient.delete(`/seasons/${id}/other-costs/${costId}`);
    return response.data;
}

export async function uploadSeasonOtherCostReceipt(id, costId, file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.put(`/seasons/${id}/other-costs/${costId}/receipt`, formData);
    return response.data.data;
}
