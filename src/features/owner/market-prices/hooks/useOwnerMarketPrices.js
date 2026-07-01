import { useCallback, useMemo, useState } from "react";

import {
    getOwnerDashboardMarketPrices,
    getOwnerMarketPrices,
    getOwnerMarketWatchlistSummary,
} from "../services/ownerMarketPriceApi";
import { enrichMarketPrice } from "../utils/marketPriceUtils";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const DEFAULT_SUMMARY = {
    watchlistCount: 0,
    totalPrices: 0,
    increasedPrices: 0,
    decreasedPrices: 0,
    unchangedPrices: 0,
};

const MARKET_PRICE_REALTIME_TOPICS = [
    "market-prices",
    "market-watchlist",
];

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

function uniqueBy(items, getKey) {
    const map = new Map();

    items.forEach((item) => {
        const key = getKey(item);

        if (!key || map.has(key)) return;

        map.set(key, item);
    });

    return Array.from(map.values());
}

function buildSummary(watchlistSummary, prices, pageData) {
    const increasedPrices = prices.filter(
        (item) => Number(item.priceChangeValue) > 0,
    ).length;
    const decreasedPrices = prices.filter(
        (item) => Number(item.priceChangeValue) < 0,
    ).length;
    const unchangedPrices = prices.filter(
        (item) => Number(item.priceChangeValue) === 0,
    ).length;

    return {
        watchlistCount: watchlistSummary?.watchlistCount ?? 0,
        totalPrices: pageData?.totalElements ?? prices.length,
        increasedPrices,
        decreasedPrices,
        unchangedPrices,
    };
}

export function useOwnerDashboardMarketPrices(farmId, initialSize = 3) {
    const [pricePage, setPricePage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPrices = useCallback(async () => {
        if (!farmId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerDashboardMarketPrices(
                farmId,
                0,
                initialSize,
            );

            setPricePage(data);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Không thể tải giá thị trường cho dashboard.",
                ),
            );
        } finally {
            setLoading(false);
        }
    }, [farmId, initialSize]);

    const prices = useMemo(
        () => (pricePage?.content ?? []).map(enrichMarketPrice),
        [pricePage?.content],
    );

    useFarmRealtimeRefresh(farmId, MARKET_PRICE_REALTIME_TOPICS, loadPrices);

    return {
        prices,
        pageInfo: {
            number: pricePage?.number ?? 0,
            size: pricePage?.size ?? initialSize,
            totalPages: pricePage?.totalPages ?? 0,
            totalElements: pricePage?.totalElements ?? 0,
            first: pricePage?.first ?? true,
            last: pricePage?.last ?? true,
        },
        loading,
        error,
        reload: loadPrices,
    };
}

export function useOwnerMarketPrices(farmId, initialPage = 0, initialSize = 8) {
    const [pricePage, setPricePage] = useState(null);
    const [summaryPricePage, setSummaryPricePage] = useState(null);
    const [watchlistSummary, setWatchlistSummary] = useState(DEFAULT_SUMMARY);

    const [filters, setFilters] = useState({
        speciesName: "",
    });
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPrices = useCallback(async () => {
        if (!farmId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [pricesData, summaryPricesData, watchlistData] =
                await Promise.all([
                    getOwnerMarketPrices(farmId, page, size),
                    getOwnerMarketPrices(farmId, 0, 100),
                    getOwnerMarketWatchlistSummary(farmId),
                ]);

            setPricePage(pricesData);
            setSummaryPricePage(summaryPricesData);
            setWatchlistSummary(watchlistData ?? DEFAULT_SUMMARY);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Không thể tải dữ liệu giá thị trường.",
                ),
            );
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    const prices = useMemo(
        () => (pricePage?.content ?? []).map(enrichMarketPrice),
        [pricePage?.content],
    );

    const summaryPrices = useMemo(
        () => (summaryPricePage?.content ?? prices).map(enrichMarketPrice),
        [prices, summaryPricePage?.content],
    );

    const filteredPrices = useMemo(
        () =>
            prices.filter((item) => {
                return (
                    !filters.speciesName ||
                    item.speciesName === filters.speciesName
                );
            }),
        [filters, prices],
    );

    const speciesOptions = useMemo(
        () =>
            uniqueBy(summaryPrices, (item) => item.speciesName).map((item) => ({
                value: item.speciesName,
                label: item.speciesName,
            })),
        [summaryPrices],
    );

    const summary = useMemo(
        () => buildSummary(watchlistSummary, summaryPrices, summaryPricePage),
        [summaryPricePage, summaryPrices, watchlistSummary],
    );

    useFarmRealtimeRefresh(farmId, MARKET_PRICE_REALTIME_TOPICS, loadPrices);

    function updateFilter(name, value) {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function resetFilters() {
        setFilters({
            speciesName: "",
        });
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        prices: filteredPrices,
        rawPrices: prices,
        summary,
        speciesOptions,
        filters,
        updateFilter,
        resetFilters,
        pageInfo: {
            number: pricePage?.number ?? page,
            size: pricePage?.size ?? size,
            totalPages: pricePage?.totalPages ?? 0,
            totalElements: pricePage?.totalElements ?? 0,
            first: pricePage?.first ?? true,
            last: pricePage?.last ?? true,
        },
        page,
        setPage: handleSetPage,
        loading,
        initialLoading: loading && pricePage === null,
        tableLoading: loading && pricePage !== null,
        error,
        reload: loadPrices,
    };
}
