import { httpClient } from "../../../../services/httpClient";

const MARKET_SOURCE_ENDPOINT = "/admin/market-sources";

export async function getMarketSources(page = 0, size = 10) {
    const response = await httpClient.get(MARKET_SOURCE_ENDPOINT, {
        params: { page, size },
    });

    return response.data.data;
}

export async function createMarketSource(payload) {
    const response = await httpClient.post(MARKET_SOURCE_ENDPOINT, payload);

    return response.data.data;
}

export async function updateMarketSource(sourceId, payload) {
    const response = await httpClient.put(
        `${MARKET_SOURCE_ENDPOINT}/${sourceId}`,
        payload,
    );

    return response.data.data;
}

export async function updateMarketSourceStatus(sourceId, isActive) {
    const response = await httpClient.patch(
        `${MARKET_SOURCE_ENDPOINT}/${sourceId}/status`,
        null,
        {
            params: { isActive },
        },
    );

    return response.data.data;
}