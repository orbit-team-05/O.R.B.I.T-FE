export const EMPTY_PAGE = Object.freeze({
    content: [],
    number: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
});

function toNonNegativeInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

/**
 * Normalizes both Spring Page and ApiResponse<Page> into one frontend contract.
 * All page numbers remain zero-based internally.
 */
export function normalizePageResponse(pageData, fallbackSize = 10) {
    const raw = pageData?.data ?? pageData ?? {};
    const content = Array.isArray(raw.content) ? raw.content : [];
    const size = Math.max(
        toNonNegativeInteger(
            raw.size ?? raw.pageSize ?? raw.pageable?.pageSize,
            fallbackSize,
        ),
        1,
    );
    const totalElements = toNonNegativeInteger(raw.totalElements, content.length);
    const calculatedTotalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
    const totalPages = toNonNegativeInteger(raw.totalPages, calculatedTotalPages);
    const requestedNumber = toNonNegativeInteger(
        raw.number ?? raw.page ?? raw.pageable?.pageNumber,
        0,
    );
    const number = totalPages > 0 ? Math.min(requestedNumber, totalPages - 1) : 0;

    return {
        ...raw,
        content,
        number,
        page: number,
        size,
        totalElements,
        totalPages,
        first: totalPages <= 1 || number === 0,
        last: totalPages <= 1 || number >= totalPages - 1,
        empty: content.length === 0,
    };
}
