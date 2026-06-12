import { httpClient } from "../../../../services/httpClient";

function getOwnerProductEndpoint(farmId) {
    return `/farms/${farmId}/products`;
}

export async function getOwnerProducts(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getOwnerProductEndpoint(farmId), {
        params: { page, size },
    });

    return response.data.data;
}

export async function createOwnerProduct(farmId, payload) {
    const response = await httpClient.post(
        getOwnerProductEndpoint(farmId),
        payload,
    );

    return response.data.data;
}