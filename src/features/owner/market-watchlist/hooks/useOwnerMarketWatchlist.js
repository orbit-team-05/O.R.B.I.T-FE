import { useCallback, useMemo, useState } from "react";

import {
    addOwnerMarketWatchlistSpecies,
    getOwnerAvailableWatchlistSpecies,
    getOwnerMarketWatchlist,
    getOwnerMarketWatchlistSummary,
    removeOwnerMarketWatchlistSpecies,
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
    const [availableSpeciesPage, setAvailableSpeciesPage] = useState(EMPTY_PAGE);
    const [summary, setSummary] = useState({ watchlistCount: 0 });

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [removingSpeciesId, setRemovingSpeciesId] = useState(null);

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
                getOwnerAvailableWatchlistSpecies(farmId, 0, 100),
                getOwnerMarketWatchlistSummary(farmId),
            ]);

            setWatchlistPage(watchlistData);
            setAvailableSpeciesPage(availableData);
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
    const availableSpecies = availableSpeciesPage?.content ?? [];

    const stats = useMemo(() => {
        const activeWatchlist = summary?.watchlistCount ?? 0;
        const availableCount = availableSpeciesPage?.totalElements ?? 0;
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
        availableSpeciesPage?.totalElements,
        page,
        summary?.watchlistCount,
        watchlist.length,
        watchlistPage?.number,
        watchlistPage?.totalPages,
    ]);

    async function addSpecies(speciesId) {
        if (!farmId || !speciesId) return null;

        try {
            setSubmitting(true);
            const data = await addOwnerMarketWatchlistSpecies(farmId, speciesId);
            await loadData();
            return data;
        } catch (err) {
            throw new Error(
                getErrorMessage(err, "Không thể thêm species vào watchlist."),
                { cause: err },
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function removeSpecies(speciesId) {
        if (!farmId || !speciesId) return null;

        try {
            setRemovingSpeciesId(speciesId);
            const data = await removeOwnerMarketWatchlistSpecies(farmId, speciesId);

            if (watchlist.length === 1 && page > 0) {
                setPage((prev) => Math.max(prev - 1, 0));
            } else {
                await loadData();
            }

            return data;
        } catch (err) {
            throw new Error(
                getErrorMessage(err, "Không thể xóa species khỏi watchlist."),
                { cause: err },
            );
        } finally {
            setRemovingSpeciesId(null);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        watchlist,
        availableSpecies,
        summary,
        stats,
        loading,
        initialLoading: loading && watchlistPage === null,
        tableLoading: loading && watchlistPage !== null,
        error,
        submitting,
        removingSpeciesId,
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
        addSpecies,
        removeSpecies,
    };
}
