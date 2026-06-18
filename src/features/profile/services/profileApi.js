import { httpClient } from "../../../services/httpClient";

export async function getProfile() {
    const response = await httpClient.get("/users/profile");
    return response.data.data;
}

export async function updateProfile(payload) {
    const response = await httpClient.put("/users/profile", payload);
    return response.data.data;
}

export async function changePassword(payload) {
    const response = await httpClient.put("/users/change-password", payload);
    return response.data.data;
}
