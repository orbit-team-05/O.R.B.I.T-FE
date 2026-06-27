import { useCallback, useMemo, useState } from "react";

import {
    addOwnerMarketWatchlistTarget,
    getOwnerAvailableWatchlistTargets,
    getOwnerMarketWatchlist,
    getOwnerMarketWatchlistSummary,
    removeOwnerMarketWatchlistTarget,
} from "../services/ownerMarketWatchlistApi";

const EMPTY_PAGE = {
    content: [],
    number: 0,
    size: 0,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
    empty: true,
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerMarketWatchlist(
    farmId,
    initialPage = 0,
    initialSize = 10,
) {
    const [watchlistPage, setWatchlistPage] = useState(null);
    const [availableTargetsPage, setAvailableTargetsPage] = useState(EMPTY_PAGE);
    const [summary, setSummary] = useState({ watchlistCount: 0 });

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [removingTargetId, setRemovingTargetId] = useState(null);

    const loadData = useCallback(async () => {
        if (!farmId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [watchlistData, availableData, summaryData] = await Promise.all([
                getOwnerMarketWatchlist(farmId, page, size),
                getOwnerAvailableWatchlistTargets(farmId, 0, 100),
                getOwnerMarketWatchlistSummary(farmId),
            ]);

            setWatchlistPage(watchlistData);
            setAvailableTargetsPage(availableData);
            setSummary(summaryData ?? { watchlistCount: 0 });
        } catch (err) {
            setError(
                getErrorMessage(err, "Không thể tải dữ liệu watchlist farm."),
            );
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    const watchlist = watchlistPage?.content ?? [];
    const availableTargets = availableTargetsPage?.content ?? [];

    const stats = useMemo(() => {
        const activeWatchlist = summary?.watchlistCount ?? 0;
        const availableCount = availableTargetsPage?.totalElements ?? 0;
        const visibleCount = watchlist.length;
        const currentPage = (watchlistPage?.number ?? page) + 1;
        const totalPages = Math.max(Number(watchlistPage?.totalPages ?? 1), 1);

        return {
            activeWatchlist,
            availableCount,
            visibleCount,
            currentPage,
            totalPages,
        };
    }, [
        availableTargetsPage?.totalElements,
        page,
        summary?.watchlistCount,
        watchlist.length,
        watchlistPage?.number,
        watchlistPage?.totalPages,
    ]);

    async function addTarget(targetId) {
        if (!farmId || !targetId) return null;

        try {
            setSubmitting(true);
            const data = await addOwnerMarketWatchlistTarget(farmId, targetId);
            await loadData();
            return data;
        } catch (err) {
            throw new Error(
                getErrorMessage(err, "Không thể thêm mục tiêu vào watchlist."),
                { cause: err },
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function removeTarget(targetId) {
        if (!farmId || !targetId) return null;

        try {
            setRemovingTargetId(targetId);
            const data = await removeOwnerMarketWatchlistTarget(farmId, targetId);

            if (watchlist.length === 1 && page > 0) {
                setPage((prev) => Math.max(prev - 1, 0));
            } else {
                await loadData();
            }

            return data;
        } catch (err) {
            throw new Error(
                getErrorMessage(err, "Không thể xóa mục tiêu khỏi watchlist."),
                { cause: err },
            );
        } finally {
            setRemovingTargetId(null);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        watchlist,
        availableTargets,
        summary,
        stats,
        loading,
        initialLoading: loading && watchlistPage === null,
        tableLoading: loading && watchlistPage !== null,
        error,
        submitting,
        removingTargetId,
        pageInfo: {
            number: watchlistPage?.number ?? page,
            size: watchlistPage?.size ?? size,
            totalPages: watchlistPage?.totalPages ?? 0,
            totalElements: watchlistPage?.totalElements ?? 0,
            first: watchlistPage?.first ?? true,
            last: watchlistPage?.last ?? true,
        },
        reload: loadData,
        setPage: handleSetPage,
        addTarget,
        removeTarget,
    };
}
