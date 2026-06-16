import { useCallback, useEffect, useMemo, useState } from "react";
import {
    confirmExportScan,
    getExportScans,
    getPendingExportScans,
} from "../services/ownerIotExportApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerIotExports(farmId, initialPage = 0, initialSize = 10) {
    const [pendingPage, setPendingPage] = useState(null);
    const [historyPage, setHistoryPage] = useState(null);

    const [pendingScans, setPendingScans] = useState([]);
    const [historyScans, setHistoryScans] = useState([]);

    const [pendingPageNumber, setPendingPageNumber] = useState(initialPage);
    const [historyPageNumber, setHistoryPageNumber] = useState(initialPage);
    const [size] = useState(initialSize);

    const [pendingLoading, setPendingLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const loadPendingExports = useCallback(async () => {
        if (!farmId) return;

        try {
            setPendingLoading(true);
            setError("");

            const data = await getPendingExportScans(
                farmId,
                pendingPageNumber,
                size,
            );

            setPendingPage(data);
            setPendingScans(data?.content ?? []);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Không thể tải danh sách xuất vật tư chờ xác nhận.",
                ),
            );
        } finally {
            setPendingLoading(false);
        }
    }, [farmId, pendingPageNumber, size]);

    const loadExportHistory = useCallback(async () => {
        if (!farmId) return;

        try {
            setHistoryLoading(true);
            setError("");

            const data = await getExportScans(
                farmId,
                historyPageNumber,
                size,
            );

            setHistoryPage(data);
            setHistoryScans(data?.content ?? []);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Không thể tải lịch sử xuất vật tư.",
                ),
            );
        } finally {
            setHistoryLoading(false);
        }
    }, [farmId, historyPageNumber, size]);

    useEffect(() => {
        void loadPendingExports();
    }, [loadPendingExports]);

    useEffect(() => {
        void loadExportHistory();
    }, [loadExportHistory]);

    async function confirmExport(transactionId) {
        try {
            setSubmittingId(transactionId);
            setActionError("");
            setActionSuccess("");

            const result = await confirmExportScan(farmId, transactionId);

            setPendingScans((prev) =>
                prev.filter((item) => item.transactionId !== transactionId),
            );

            await loadExportHistory();

            setActionSuccess(
                `Đã xác nhận xuất vật tư ${result.productName || "sản phẩm"}.`,
            );

            return result;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể xác nhận xuất vật tư."),
            );
            return null;
        } finally {
            setSubmittingId(null);
        }
    }

    const summary = useMemo(() => {
        const approvedToday = historyScans.filter(
            (item) => item.approvalStatus === "APPROVED",
        ).length;

        const totalExportCost = historyScans.reduce(
            (sum, item) => sum + Number(item.totalAmount || 0),
            0,
        );

        return {
            pending: pendingScans.length,
            recognized: pendingScans.filter((item) => item.productId).length,
            unrecognized: pendingScans.filter((item) => !item.productId).length,
            approved: approvedToday,
            totalExportCost,
        };
    }, [pendingScans, historyScans]);

    return {
        pendingScans,
        historyScans,
        summary,

        pendingPageInfo: {
            number: pendingPage?.number ?? pendingPageNumber,
            size: pendingPage?.size ?? size,
            totalPages: pendingPage?.totalPages ?? 0,
            totalElements: pendingPage?.totalElements ?? pendingScans.length,
            first: pendingPage?.first ?? true,
            last: pendingPage?.last ?? true,
        },

        historyPageInfo: {
            number: historyPage?.number ?? historyPageNumber,
            size: historyPage?.size ?? size,
            totalPages: historyPage?.totalPages ?? 0,
            totalElements: historyPage?.totalElements ?? historyScans.length,
            first: historyPage?.first ?? true,
            last: historyPage?.last ?? true,
        },

        pendingLoading,
        historyLoading,
        submittingId,

        error,
        actionError,
        actionSuccess,

        setPendingPage: setPendingPageNumber,
        setHistoryPage: setHistoryPageNumber,

        reload: async () => {
            await Promise.all([
                loadPendingExports(),
                loadExportHistory(),
            ]);
        },

        confirmExport,

        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}