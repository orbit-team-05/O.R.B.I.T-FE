import { useCallback, useEffect, useState } from "react";

import {
    getAdminMarketPrices,
    getAdminMarketPriceSummary,
    getMarketPriceSourceOptions,
    getMarketPriceSpeciesOptions,
    runActiveCrawl,
} from "../services/marketPriceApi";

const DEFAULT_SUMMARY = {
    totalPrices: 0,
    totalSources: 0,
    totalSpecies: 0,
    latestUpdatedAt: null,
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useAdminMarketPrices(initialPage = 0, initialSize = 10) {
    const [pricePage, setPricePage] = useState(null);
    const [summary, setSummary] = useState(DEFAULT_SUMMARY);

    const [sourceOptions, setSourceOptions] = useState([]);
    const [speciesOptions, setSpeciesOptions] = useState([]);

    const [filters, setFilters] = useState({
        sourceId: "",
        speciesId: "",
        location: "",
    });

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [crawling, setCrawling] = useState(false);

    const loadOptions = useCallback(async () => {
        const [sources, species] = await Promise.all([
            getMarketPriceSourceOptions(),
            getMarketPriceSpeciesOptions(),
        ]);

        setSourceOptions(sources);
        setSpeciesOptions(species);
    }, []);

    const loadPrices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [pricesData, summaryData] = await Promise.all([
                getAdminMarketPrices({
                    page,
                    size,
                    sourceId: filters.sourceId,
                    speciesId: filters.speciesId,
                    location: filters.location,
                }),
                getAdminMarketPriceSummary(),
            ]);

            setPricePage(pricesData);
            setSummary(summaryData ?? DEFAULT_SUMMARY);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải dữ liệu giá crawl."));
        } finally {
            setLoading(false);
        }
    }, [page, size, filters]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    useEffect(() => {
        loadPrices();
    }, [loadPrices]);

    function updateFilter(name, value) {
        setPage(0);

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function resetFilters() {
        setPage(0);

        setFilters({
            sourceId: "",
            speciesId: "",
            location: "",
        });
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    async function runCrawl() {
        try {
            setCrawling(true);
            const savedCount = await runActiveCrawl();
            await loadPrices();
            return { success: true, count: savedCount };
        } catch (err) {
            return {
                success: false,
                error: getErrorMessage(err, "Không thể thực hiện chạy crawl."),
            };
        } finally {
            setCrawling(false);
        }
    }

    return {
        prices: pricePage?.content ?? [],
        summary,
        sourceOptions,
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

        crawling,
        runCrawl,
    };
}