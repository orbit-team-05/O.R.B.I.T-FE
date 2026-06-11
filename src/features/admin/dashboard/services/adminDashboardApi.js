import { httpClient } from "../../../../services/httpClient";

export async function getSpeciesPage() {
    const response = await httpClient.get("/admin/species", {
        params: { page: 0, size: 1 },
    });

    return response.data.data;
}

export async function getMarketSourcesForDashboard() {
    const response = await httpClient.get("/admin/market-sources", {
        params: { page: 0, size: 100 },
    });

    return response.data.data;
}

export async function getCrawlTargetsForDashboard() {
    const response = await httpClient.get("/admin/market-crawl-targets", {
        params: { page: 0, size: 100 },
    });

    return response.data.data;
}

export async function getIotDeviceSummaryForDashboard() {
    const response = await httpClient.get("/admin/iot-devices/summary");

    return response.data.data;
}

export async function getMarketPriceSummaryForDashboard() {
    const response = await httpClient.get("/admin/market-prices/summary");

    return response.data.data;
}