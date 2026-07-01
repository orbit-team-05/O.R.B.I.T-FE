import { useCallback, useMemo, useState } from "react";

import { getOwnerIotDevices } from "../../iot-devices/services/ownerIotDeviceApi";
import { getOwnerDashboardMarketPrices } from "../../market-prices/services/ownerMarketPriceApi";
import { enrichMarketPrice } from "../../market-prices/utils/marketPriceUtils";
import {
    getOwnerDashboardRecentScans,
    getOwnerDashboardStockAlerts,
    getOwnerDashboardSummary,
} from "../services/ownerDashboardApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

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

const OWNER_DASHBOARD_REALTIME_TOPICS = [
    "inventory",
    "iot-devices",
    "iot-imports",
    "iot-exports",
    "iot-scans",
    "market-prices",
    "market-watchlist",
    "products",
    "seasons",
];

function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "Không có dữ liệu";
}

function getFulfilledValue(result, fallbackValue) {
    return result.status === "fulfilled" ? result.value : fallbackValue;
}

export function useOwnerDashboard(farmId) {
    const [summary, setSummary] = useState(null);
    const [stockAlertPage, setStockAlertPage] = useState(EMPTY_PAGE);
    const [recentScanPage, setRecentScanPage] = useState(EMPTY_PAGE);
    const [devicePage, setDevicePage] = useState(EMPTY_PAGE);
    const [marketPricePage, setMarketPricePage] = useState(EMPTY_PAGE);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sectionErrors, setSectionErrors] = useState({});

    const loadDashboard = useCallback(async (silent = false) => {
        if (!farmId) {
            setLoading(false);
            return;
        }

        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const results = await Promise.allSettled([
                getOwnerDashboardSummary(farmId),
                getOwnerDashboardStockAlerts(farmId, 0, 5),
                getOwnerDashboardRecentScans(farmId, 0, 5),
                getOwnerIotDevices(farmId, 0, 5),
                getOwnerDashboardMarketPrices(farmId, 0, 3),
            ]);

            const nextErrors = {};

            results.forEach((result, index) => {
                if (result.status === "fulfilled") return;

                const sectionKeys = [
                    "summary",
                    "stockAlerts",
                    "recentScans",
                    "devices",
                    "marketPrices",
                ];

                nextErrors[sectionKeys[index]] = getErrorMessage(result.reason);
            });

            setSectionErrors(nextErrors);
            setSummary(getFulfilledValue(results[0], null));
            setStockAlertPage(getFulfilledValue(results[1], EMPTY_PAGE));
            setRecentScanPage(getFulfilledValue(results[2], EMPTY_PAGE));
            setDevicePage(getFulfilledValue(results[3], EMPTY_PAGE));
            setMarketPricePage(getFulfilledValue(results[4], EMPTY_PAGE));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [farmId]);

    const reload = useCallback(() => {
        void loadDashboard(true);
    }, [loadDashboard]);

    const loadInitial = useCallback(() => {
        void loadDashboard(false);
    }, [loadDashboard]);

    useFarmRealtimeRefresh(
        farmId,
        OWNER_DASHBOARD_REALTIME_TOPICS,
        () => loadDashboard(true),
    );

    const stats = useMemo(
        () => [
            {
                key: "initialCapitalCost",
                title: "Chi phí đầu tư",
                value: summary?.initialCapitalCost ?? null,
            },
            {
                key: "totalSeasonCost",
                title: "Chi phí mùa vụ",
                value: summary?.totalSeasonCost ?? null,
            },
            {
                key: "expectedRevenue",
                title: "Doanh thu dự kiến",
                value: summary?.expectedRevenue ?? null,
            },
            {
                key: "estimatedNetProfit",
                title: "Lợi nhuận ước tính",
                value: summary?.estimatedNetProfit ?? null,
            },
        ],
        [summary],
    );

    const marketPrices = useMemo(
        () => (marketPricePage?.content ?? []).map(enrichMarketPrice),
        [marketPricePage?.content],
    );

    return {
        stats,
        stockAlerts: stockAlertPage?.content ?? [],
        recentScans: recentScanPage?.content ?? [],
        devices: devicePage?.content ?? [],
        marketPrices,
        loading,
        refreshing,
        sectionErrors,
        reload,
        loadInitial,
        counts: {
            stockAlerts: stockAlertPage?.totalElements ?? 0,
            devices: devicePage?.totalElements ?? 0,
            marketPrices: marketPricePage?.totalElements ?? 0,
            recentScans: recentScanPage?.totalElements ?? 0,
        },
    };
}
