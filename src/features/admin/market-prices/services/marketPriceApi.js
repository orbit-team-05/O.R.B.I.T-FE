import { httpClient } from "../../../../services/httpClient";

const MARKET_PRICE_ENDPOINT = "/admin/market-prices";

export async function getAdminMarketPrices({
                                               page = 0,
                                               size = 10,
                                               sourceId,
                                               speciesId,
                                               location,
                                           }) {
    const response = await httpClient.get(MARKET_PRICE_ENDPOINT, {
        params: {
            page,
            size,
            sourceId: sourceId || undefined,
            speciesId: speciesId || undefined,
            location: location || undefined,
        },
    });

    return response.data.data;
}

export async function getAdminMarketPriceSummary() {
    const response = await httpClient.get(`${MARKET_PRICE_ENDPOINT}/summary`);

    return response.data.data;
}

export async function getMarketPriceSourceOptions() {
    const response = await httpClient.get("/admin/market-sources", {
        params: { page: 0, size: 100 },
    });

    return response.data.data.content ?? [];
}

export async function getMarketPriceSpeciesOptions() {
    const response = await httpClient.get("/admin/species", {
        params: { page: 0, size: 100 },
    });

    return response.data.data.content ?? [];
}