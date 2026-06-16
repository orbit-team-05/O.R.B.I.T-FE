import { httpClient } from "../../../../services/httpClient";

export async function getUsers(page = 0, size = 10) {
    const response = await httpClient.get("/admin/users", {
        params: { page, size },
    });
    return response.data.data;
}

export async function getUserDashboard() {
    const response = await httpClient.get("/admin/users/dashboard");
    return response.data.data;
}

export async function getRoles() {
    const response = await httpClient.get("/admin/roles");
    return response.data.data;
}

export async function getFarms() {
    const response = await httpClient.get("/admin/farms");
    return response.data.data;
}

export async function createUser(payload) {
    const response = await httpClient.post("/admin/users", payload);
    return response.data.data;
}

export async function updateUser(userId, payload) {
    const response = await httpClient.put(`/admin/users/${userId}`, payload);
    return response.data.data;
}

export async function updateUserStatus(userId, isActive) {
    const response = await httpClient.patch(`/admin/users/${userId}/status`, null, {
        params: { isActive },
    });
    return response.data.data;
}

export async function getUserDetail(userId) {
    const response = await httpClient.get(`/admin/users/${userId}`);
    return response.data.data;
}

