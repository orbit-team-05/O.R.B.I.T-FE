import { httpClient } from "../../../../services/httpClient.js";
import { compressImage } from "../../../../utils/imageCompressor.js";

export async function uploadInventoryEvidence(file) {
    if (!file) return null;

    // Nén ảnh trước khi đưa vào FormData để đảm bảo upload siêu tốc qua Vercel proxy
    const processedFile = await compressImage(file, 1280, 0.75);

    const formData = new FormData();
    formData.append("file", processedFile, processedFile.name || "evidence.jpg");

    const response = await httpClient.post("/inventory/evidence", formData, {
        timeout: 90000,
    });

    return response.data?.data;
}
