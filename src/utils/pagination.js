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
    apiPage: 0,
    frontendPage: 1,
});

function toNonNegativeInteger(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

/**
 * Normalizes both Spring Page and ApiResponse<Page> into one frontend contract.
 * The API contract is zero-based. `number`/`apiPage` are API values and
 * `frontendPage` is the one-based value used by labels and mobile/web UI.
 */
export function normalizePageResponse(pageData, fallbackSize = 10) {
    const raw = pageData?.data ?? pageData ?? {};
    const content = Array.isArray(raw.content)
        ? raw.content
        : Array.isArray(raw.items)
            ? raw.items
            : Array.isArray(raw)
                ? raw
                : [];

    // Support Spring Data Web VIA_DTO serialization format where metadata is in raw.page
    const pageMeta = (raw.page && typeof raw.page === "object") ? raw.page : {};

    const size = Math.max(
        toNonNegativeInteger(
            raw.size ?? pageMeta.size ?? raw.pageSize ?? raw.pageable?.pageSize,
            fallbackSize,
        ),
        1,
    );

    const rawTotalElements = raw.totalElements ?? pageMeta.totalElements ?? raw.total ?? raw.totalCount;
    const totalElements = rawTotalElements !== undefined && rawTotalElements !== null
        ? toNonNegativeInteger(rawTotalElements, content.length)
        : content.length;

    const declaredTotalPages = raw.totalPages ?? pageMeta.totalPages;
    const calculatedTotalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
    const totalPages = declaredTotalPages !== undefined && declaredTotalPages !== null
        ? toNonNegativeInteger(declaredTotalPages, calculatedTotalPages)
        : calculatedTotalPages;

    const requestedNumber = toNonNegativeInteger(
        raw.number ?? pageMeta.number ?? raw.page ?? raw.currentPage ?? raw.pageable?.pageNumber,
        0,
    );
    const number = totalPages > 0 ? Math.min(requestedNumber, totalPages - 1) : 0;

    return {
        ...raw,
        content,
        number,
        page: number,
        apiPage: number,
        frontendPage: number + 1,
        size,
        totalElements: Math.max(totalElements, content.length),
        totalPages: Math.max(totalPages, totalElements > 0 ? 1 : 0),
        first: raw.first ?? pageMeta.first ?? (totalPages <= 1 || number === 0),
        last: raw.last ?? pageMeta.last ?? (totalPages <= 1 || number >= totalPages - 1),
        empty: content.length === 0,
    };
}

export function toApiPage(frontendPage) {
    return Math.max((Number(frontendPage) || 1) - 1, 0);
}

export function toFrontendPage(apiPage) {
    return Math.max(Number(apiPage) || 0, 0) + 1;
}
