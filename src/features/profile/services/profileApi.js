import { httpClient } from "../../../services/httpClient";

export async function getProfile() {
    const response = await httpClient.get("/users/me");
    return response.data.data;
}

export async function updateProfile(payload) {
    const response = await httpClient.put("/users/me", payload);
    return response.data.data;
}

export async function changePassword(payload) {
    const response = await httpClient.put("/users/change-password", payload);
    return response.data;
}

export async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post("/users/me/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data.data; // ApiResponse wrapper
}
