import { httpClient } from "../../../../services/httpClient";

function unwrapApiResponse(responseData, fallbackMessage) {
    if (responseData?.success === false) {
        throw new Error(responseData.message || fallbackMessage);
    }

    return responseData?.data ?? responseData;
}

function normalizePageResponse(pageData) {
    const content = Array.isArray(pageData?.content) ? pageData.content : [];
    const number = Number(
        pageData?.number ?? pageData?.page ?? pageData?.pageable?.pageNumber ?? 0,
    );
    const size = Number(
        pageData?.size ?? pageData?.pageSize ?? pageData?.pageable?.pageSize ?? content.length,
    );
    const totalElements = Number(pageData?.totalElements ?? content.length);
    const totalPages = Number(
        pageData?.totalPages ??
            (size > 0 ? Math.ceil(totalElements / size) : content.length ? 1 : 0),
    );

    return {
        ...pageData,
        content,
        number,
        page: number,
        size,
        totalElements,
        totalPages,
        first: pageData?.first ?? number <= 0,
        last: pageData?.last ?? number >= Math.max(totalPages - 1, 0),
        empty: pageData?.empty ?? content.length === 0,
    };
}

export async function getOwnerMarketWatchlist(farmId, page = 0, size = 10) {
    const response = await httpClient.get(`/farms/${farmId}/market-watchlist`, {
        params: { page, size },
    });

    return normalizePageResponse(
        unwrapApiResponse(
            response.data,
            "Không thể tải danh sách species đang theo dõi.",
        ),
    );
}

export async function getOwnerAvailableWatchlistTargets(
    farmId,
    page = 0,
    size = 100,
) {
    const response = await httpClient.get(
        `/farms/${farmId}/market-watchlist/available-targets`,
        {
            params: { page, size },
        },
    );

    return normalizePageResponse(
        unwrapApiResponse(
            response.data,
            "Không thể tải danh sách mục tiêu có thể thêm.",
        ),
    );
}

export async function getOwnerMarketWatchlistSummary(farmId) {
    const response = await httpClient.get(
        `/farms/${farmId}/market-watchlist/summary`,
    );

    return (
        unwrapApiResponse(
            response.data,
            "Không thể tải tổng quan watchlist.",
        ) ?? { watchlistCount: 0 }
    );
}

export async function addOwnerMarketWatchlistTarget(farmId, targetId) {
    const response = await httpClient.post(`/farms/${farmId}/market-watchlist`, {
        targetId,
    });

    return unwrapApiResponse(
        response.data,
        "Không thể thêm mục tiêu vào watchlist.",
    );
}

export async function removeOwnerMarketWatchlistTarget(farmId, targetId) {
    const response = await httpClient.delete(
        `/farms/${farmId}/market-watchlist/targets/${targetId}`,
    );

    return unwrapApiResponse(
        response.data,
        "Không thể xóa mục tiêu khỏi watchlist.",
    );
}
