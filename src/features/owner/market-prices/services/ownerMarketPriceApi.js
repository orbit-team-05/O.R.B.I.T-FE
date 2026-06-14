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
    };
}

export async function getOwnerDashboardMarketPrices(farmId, page = 0, size = 3) {
    const response = await httpClient.get(`/dashboard/${farmId}/market-prices`, {
        params: { page, size },
    });

    const pageData = unwrapApiResponse(
        response.data,
        "Không thể tải giá thị trường trên dashboard.",
    );

    return normalizePageResponse(pageData);
}

export async function getOwnerMarketPrices(farmId, page = 0, size = 10) {
    const response = await httpClient.get(`/market-prices/farms/${farmId}`, {
        params: { page, size },
    });

    const pageData = unwrapApiResponse(
        response.data,
        "Không thể tải danh sách giá thị trường.",
    );

    return normalizePageResponse(pageData);
}

export async function getOwnerMarketWatchlistSummary(farmId) {
    const response = await httpClient.get(
        `/farms/${farmId}/market-watchlist/summary`,
    );

    return (
        unwrapApiResponse(
            response.data,
            "Không thể tải tổng số mặt hàng đang theo dõi.",
        ) ?? { watchlistCount: 0 }
    );
}
