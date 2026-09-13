import { httpClient } from "../../../../services/httpClient";

function unwrapPage(response) {
    const payload = response?.data?.data ?? response?.data ?? {};
    if (Array.isArray(payload)) return payload;
    return payload.content || [];
}

function unwrapData(response) {
    return response?.data?.data ?? response?.data ?? null;
}

export async function getStaffFarmData(farmId) {
    const [productsResponse, seasonsResponse, devicesResponse, materialStocksResponse, productStocksResponse, materialSummaryResponse, productSummaryResponse] = await Promise.all([
        httpClient.get(`/farms/${farmId}/products`, {
            params: { page: 0, size: 50, status: "ACTIVE" },
        }),
        httpClient.get("/seasons/cards", {
            params: { page: 0, size: 50 },
        }),
        httpClient.get(`/farms/${farmId}/iot-devices`, {
            params: { page: 0, size: 50 },
        }),
        httpClient.get(`/farms/${farmId}/inventory/stocks`, {
            params: { page: 0, size: 50, warehouse: "MATERIAL", sort: "updated,desc" },
        }),
        httpClient.get(`/farms/${farmId}/inventory/stocks`, {
            params: { page: 0, size: 50, warehouse: "PRODUCT", sort: "updated,desc" },
        }),
        httpClient.get(`/farms/${farmId}/inventory/summary`, {
            params: { warehouse: "MATERIAL" },
        }),
        httpClient.get(`/farms/${farmId}/inventory/summary`, {
            params: { warehouse: "PRODUCT" },
        }),
    ]);

    return {
        products: unwrapPage(productsResponse),
        seasons: unwrapPage(seasonsResponse).filter((item) => ["PLANNING", "ACTIVE", "HARVESTING"].includes(item.status)),
        devices: unwrapPage(devicesResponse).filter((item) => item.status === "ACTIVE"),
        materialStocks: unwrapPage(materialStocksResponse),
        productStocks: unwrapPage(productStocksResponse),
        materialSummary: unwrapData(materialSummaryResponse),
        productSummary: unwrapData(productSummaryResponse),
    };
}
