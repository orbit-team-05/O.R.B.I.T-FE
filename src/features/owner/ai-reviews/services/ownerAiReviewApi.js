import { httpClient } from "../../../../services/httpClient";

function getOwnerAiReviewEndpoint(farmId) {
    return `/farms/${farmId}/ai-reviews`;
}

export async function getOwnerAiReviews(farmId, page = 0, size = 10) {
    const response = await httpClient.get(getOwnerAiReviewEndpoint(farmId), {
        params: { page, size },
    });

    return response.data.data;
}

export async function reviewOwnerAiTransaction(farmId, transactionId, productId) {
    const response = await httpClient.patch(
        `${getOwnerAiReviewEndpoint(farmId)}/${transactionId}/review`,
        { productId },
    );

    return response.data.data;
}

export async function getOwnerReviewProducts(farmId, page = 0, size = 100) {
    const response = await httpClient.get(`/farms/${farmId}/products`, {
        params: { page, size },
    });

    return response.data.data;
}