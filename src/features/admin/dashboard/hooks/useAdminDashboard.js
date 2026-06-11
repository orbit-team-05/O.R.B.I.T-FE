import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getCrawlTargetsForDashboard,
    getIotDeviceSummaryForDashboard,
    getMarketPriceSummaryForDashboard,
    getMarketSourcesForDashboard,
    getSpeciesPage,
} from "../services/adminDashboardApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

function getPageContent(pageData) {
    return pageData?.content ?? [];
}

function getPageTotal(pageData) {
    return pageData?.totalElements ?? getPageContent(pageData).length;
}

function sortByLatestCrawl(targets) {
    return [...targets].sort((a, b) => {
        const aTime = a.lastCrawledAt ? new Date(a.lastCrawledAt).getTime() : 0;
        const bTime = b.lastCrawledAt ? new Date(b.lastCrawledAt).getTime() : 0;

        return bTime - aTime;
    });
}

export function useAdminDashboard() {
    const [speciesPage, setSpeciesPage] = useState(null);
    const [sourcePage, setSourcePage] = useState(null);
    const [targetPage, setTargetPage] = useState(null);
    const [deviceSummary, setDeviceSummary] = useState(null);
    const [priceSummary, setPriceSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [
                speciesData,
                sourceData,
                targetData,
                deviceData,
                priceData,
            ] = await Promise.all([
                getSpeciesPage(),
                getMarketSourcesForDashboard(),
                getCrawlTargetsForDashboard(),
                getIotDeviceSummaryForDashboard(),
                getMarketPriceSummaryForDashboard(),
            ]);

            setSpeciesPage(speciesData);
            setSourcePage(sourceData);
            setTargetPage(targetData);
            setDeviceSummary(deviceData);
            setPriceSummary(priceData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải tổng quan Admin."));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const dashboard = useMemo(() => {
        const sources = getPageContent(sourcePage);
        const targets = getPageContent(targetPage);

        const targetErrors = targets.filter((item) => Boolean(item.lastError));
        const inactiveSources = sources.filter(
            (item) => !(item.isActive ?? item.active),
        );

        const recentCrawlTargets = sortByLatestCrawl(targets).slice(0, 5);

        const alerts = [];

        if (targetErrors.length > 0) {
            alerts.push({
                id: "target-errors",
                type: "danger",
                title: `${targetErrors.length} target crawl đang lỗi`,
                description: "Cần kiểm tra cấu hình selector, URL hoặc nguồn crawl.",
            });
        }

        if (inactiveSources.length > 0) {
            alerts.push({
                id: "inactive-sources",
                type: "warning",
                title: `${inactiveSources.length} nguồn dữ liệu đang tắt`,
                description: "Các target thuộc nguồn này có thể không crawl được.",
            });
        }

        if ((deviceSummary?.unassignedDevices ?? 0) > 0) {
            alerts.push({
                id: "unassigned-devices",
                type: "info",
                title: `${deviceSummary.unassignedDevices} thiết bị IoT chờ kích hoạt`,
                description: "Thiết bị đã tạo nhưng chưa được owner gắn vào farm.",
            });
        }

        if ((deviceSummary?.lostDevices ?? 0) > 0) {
            alerts.push({
                id: "lost-devices",
                type: "danger",
                title: `${deviceSummary.lostDevices} thiết bị mất kết nối`,
                description: "Cần kiểm tra trạng thái thiết bị hoặc kết nối mạng.",
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                id: "healthy",
                type: "success",
                title: "Hệ thống đang ổn định",
                description: "Chưa ghi nhận cảnh báo quan trọng.",
            });
        }

        return {
            stats: {
                totalSpecies: getPageTotal(speciesPage),
                totalSources: getPageTotal(sourcePage),
                totalTargets: getPageTotal(targetPage),
                needReview:
                    targetErrors.length +
                    (deviceSummary?.lostDevices ?? 0) +
                    (deviceSummary?.brokenDevices ?? 0),
            },
            recentCrawlTargets,
            alerts,
            priceSummary,
            deviceSummary,
        };
    }, [speciesPage, sourcePage, targetPage, deviceSummary, priceSummary]);

    return {
        dashboard,
        loading,
        refreshing,
        error,
        reload: () => loadDashboard(true),
    };
}