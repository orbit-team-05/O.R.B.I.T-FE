import { useCallback, useMemo, useState } from "react";
import { getOwnerIotDevices } from "../../iot-devices/services/ownerIotDeviceApi";
import {
    getOwnerDashboardRecentTransactions,
    getOwnerDashboardStockAlerts,
    getOwnerDashboardSummary,
} from "../services/ownerDashboardApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const EMPTY_PAGE = { content: [], number: 0, size: 0, totalPages: 0, totalElements: 0, first: true, last: true, empty: true };
const OWNER_DASHBOARD_REALTIME_TOPICS = ["inventory", "iot-devices", "products", "seasons"];

function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "Không có dữ liệu";
}

function getFulfilledValue(result, fallbackValue) {
    return result.status === "fulfilled" ? result.value : fallbackValue;
}

function getDateRange(rangeDays) {
    const safeDays = Math.min(Math.max(Number(rangeDays) || 30, 7), 365);
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - safeDays + 1);
    const toParam = to.toISOString().slice(0, 10);
    const fromParam = from.toISOString().slice(0, 10);
    return { from: fromParam, to: toParam };
}

export function useOwnerDashboard(farmId, rangeDays = 30) {
    const [summary, setSummary] = useState(null);
    const [stockAlertPage, setStockAlertPage] = useState(EMPTY_PAGE);
    const [recentTransactionPage, setRecentTransactionPage] = useState(EMPTY_PAGE);
    const [devicePage, setDevicePage] = useState(EMPTY_PAGE);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sectionErrors, setSectionErrors] = useState({});

    const loadDashboard = useCallback(async (silent = false) => {
        if (!farmId) {
            setLoading(false);
            return;
        }
        try {
            if (silent) setRefreshing(true);
            else setLoading(true);
            const results = await Promise.allSettled([
                getOwnerDashboardSummary(farmId, getDateRange(rangeDays)),
                getOwnerDashboardStockAlerts(farmId, 0, 5),
                getOwnerDashboardRecentTransactions(farmId, 0, 6),
                getOwnerIotDevices(farmId, 0, 5),
            ]);
            const sectionKeys = ["summary", "stockAlerts", "recentTransactions", "devices"];
            const nextErrors = {};
            results.forEach((result, index) => {
                if (result.status === "rejected") nextErrors[sectionKeys[index]] = getErrorMessage(result.reason);
            });
            setSectionErrors(nextErrors);
            setSummary(getFulfilledValue(results[0], null));
            setStockAlertPage(getFulfilledValue(results[1], EMPTY_PAGE));
            setRecentTransactionPage(getFulfilledValue(results[2], EMPTY_PAGE));
            setDevicePage(getFulfilledValue(results[3], EMPTY_PAGE));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [farmId, rangeDays]);

    const reload = useCallback(() => void loadDashboard(true), [loadDashboard]);
    const loadInitial = useCallback(() => void loadDashboard(false), [loadDashboard]);

    useFarmRealtimeRefresh(farmId, OWNER_DASHBOARD_REALTIME_TOPICS, () => loadDashboard(true));

    const devices = useMemo(() => devicePage?.content ?? [], [devicePage?.content]);
    const stats = useMemo(() => [
        { key: "initialCapitalCost", title: "Chi phí đầu tư", value: summary?.initialCapitalCost ?? null },
        { key: "totalSeasonCost", title: "Chi phí mùa vụ", value: summary?.totalSeasonCost ?? null },
        { key: "expectedRevenue", title: "Doanh thu dự kiến", value: summary?.expectedRevenue ?? null },
        { key: "estimatedNetProfit", title: "Lợi nhuận ước tính", value: summary?.estimatedNetProfit ?? null },
    ], [summary]);

    return {
        stats,
        summary,
        stockAlerts: stockAlertPage?.content ?? [],
        recentTransactions: recentTransactionPage?.content ?? [],
        transactionTrend: summary?.transactionTrend ?? [],
        devices,
        loading,
        refreshing,
        sectionErrors,
        reload,
        loadInitial,
        counts: {
            stockAlerts: stockAlertPage?.totalElements ?? 0,
            recentTransactions: recentTransactionPage?.totalElements ?? 0,
            devices: devicePage?.totalElements ?? 0,
        },
    };
}
