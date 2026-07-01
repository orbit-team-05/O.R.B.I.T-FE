import { useCallback, useMemo, useState } from "react";

import {
    getOwnerIotScanDetail,
    getOwnerIotScans,
} from "../services/ownerIotScanApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const IOT_SCAN_REALTIME_TOPICS = [
    "iot-scans",
    "iot-imports",
    "iot-exports",
    "ai-reviews",
];

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerIotScans(farmId, initialPage = 0, initialSize = 10) {
    const [scanPage, setScanPage] = useState(null);
    const [selectedScan, setSelectedScan] = useState(null);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

    const scans = scanPage?.content ?? [];

    const loadScans = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerIotScans(farmId, page, size);
            setScanPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải lịch sử scan IoT."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    const summary = useMemo(() => {
        const totalScans = scanPage?.totalElements ?? scans.length;

        const successScans = scans.filter(
            (item) => item.aiStatus === "SUCCESS",
        ).length;

        const needReviewScans = scans.filter(
            (item) => item.needKeypadInput || item.aiStatus === "UNRECOGNIZED",
        ).length;

        return {
            totalScans,
            successScans,
            needReviewScans,
        };
    }, [scanPage?.totalElements, scans]);

    async function loadScanDetail(transactionId) {
        if (!farmId || !transactionId) return null;

        try {
            setDetailLoading(true);
            setActionError("");

            const data = await getOwnerIotScanDetail(farmId, transactionId);
            setSelectedScan(data);

            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải chi tiết scan."));
            return null;
        } finally {
            setDetailLoading(false);
        }
    }

    useFarmRealtimeRefresh(farmId, IOT_SCAN_REALTIME_TOPICS, async () => {
        await loadScans();

        if (selectedScan?.transactionId) {
            await loadScanDetail(selectedScan.transactionId);
        }
    });

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        scans,
        selectedScan,
        setSelectedScan,
        summary,

        pageInfo: {
            number: scanPage?.number ?? page,
            size: scanPage?.size ?? size,
            totalPages: scanPage?.totalPages ?? 0,
            totalElements: scanPage?.totalElements ?? 0,
            first: scanPage?.first ?? true,
            last: scanPage?.last ?? true,
        },

        page,
        setPage: handleSetPage,

        loading,
        initialLoading: loading && scanPage === null,
        tableLoading: loading && scanPage !== null,
        detailLoading,

        error,
        actionError,
        clearActionError: () => setActionError(""),
        reload: loadScans,
        loadScanDetail,
    };
}
