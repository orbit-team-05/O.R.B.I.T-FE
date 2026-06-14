import { httpClient } from "../../../../services/httpClient";

export async function getSeasonDashboard() {
    const response = await httpClient.get("/seasons/dashboard");
    return response.data.data;
}

export async function getSeasonCards(page = 0, size = 10) {
    const response = await httpClient.get("/seasons/cards", {
        params: { page, size },
    });
    return response.data.data;
}

export async function createSeason(payload) {
    const response = await httpClient.post("/seasons", payload);
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

export async function updateSeasonStatus(id, status) {
    const response = await httpClient.patch(`/seasons/${id}/status`, { status });
    return response.data.data;
}

export async function cancelSeason(id) {
    const response = await httpClient.patch(`/seasons/${id}/cancel`);
    return response.data.data;
}

export async function getActiveSpecies() {
    const response = await httpClient.get("/species");
    return response.data.data;
}
