import { httpClient } from "../../../../services/httpClient";

const CRAWL_TARGET_ENDPOINT = "/admin/market-crawl-targets";

export async function getCrawlTargets(page = 0, size = 10) {
    const response = await httpClient.get(CRAWL_TARGET_ENDPOINT, {
        params: { page, size },
    });

    return response.data.data;
}

export async function createCrawlTarget(payload) {
    const response = await httpClient.post(CRAWL_TARGET_ENDPOINT, payload);

    return response.data.data;
}

export async function updateCrawlTarget(targetId, payload) {
    const response = await httpClient.put(
        `${CRAWL_TARGET_ENDPOINT}/${targetId}`,
        payload,
    );

    return response.data.data;
}

export async function updateCrawlTargetStatus(targetId, isActive) {
    const response = await httpClient.patch(
        `${CRAWL_TARGET_ENDPOINT}/${targetId}/status`,
        null,
        {
            params: { isActive },
        },
    );

    return response.data.data;
}

export async function getSourceOptions() {
    const response = await httpClient.get("/admin/market-sources", {
        params: {
            page: 0,
            size: 100,
        },
    });

    return response.data.data.content ?? [];
}

export async function getSpeciesOptions() {
    const response = await httpClient.get("/admin/species", {
        params: {
            page: 0,
            size: 100,
        },
    });

    return response.data.data.content ?? [];
}