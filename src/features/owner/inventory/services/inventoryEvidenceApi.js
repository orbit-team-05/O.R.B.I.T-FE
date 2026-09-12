import { httpClient } from "../../../../services/httpClient.js";

export async function uploadInventoryEvidence(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.post("/inventory/evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data;
}
