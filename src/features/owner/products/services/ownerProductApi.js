import { httpClient } from "../../../../services/httpClient";
import { normalizePageResponse } from "../../../../utils/pagination";

function getOwnerProductEndpoint(farmId) {
    return `/farms/${farmId}/products`;
}

export async function getOwnerProducts(farmId, page = 0, size = 20, filters = {}) {
    const response = await httpClient.get(getOwnerProductEndpoint(farmId), {
        params: { page, size, ...filters },
    });
    return normalizePageResponse(response.data?.data ?? response.data, size);
}

export async function createOwnerProduct(farmId, payload) {
    const response = await httpClient.post(getOwnerProductEndpoint(farmId), payload);
    return response.data.data;
}

export async function uploadOwnerProductImage(farmId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post(
        `${getOwnerProductEndpoint(farmId)}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
}

export async function updateOwnerProduct(farmId, productId, payload) {
    const response = await httpClient.patch(
        `${getOwnerProductEndpoint(farmId)}/${productId}`,
        payload,
    );
    return response.data.data;
}

export async function updateOwnerProductStatus(farmId, productId, status) {
    const response = await httpClient.patch(
        `${getOwnerProductEndpoint(farmId)}/${productId}/status`,
        null,
        { params: { status } },
    );
    return response.data.data;
}

export async function uploadOwnerProductImageForProduct(farmId, productId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post(
        `${getOwnerProductEndpoint(farmId)}/${productId}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
}
