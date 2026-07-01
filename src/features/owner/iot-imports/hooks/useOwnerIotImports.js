import { useCallback, useEffect, useMemo, useState } from "react";
import {
    confirmImportScan,
    getImportScans,
    getPendingImportScans,
} from "../services/ownerIotImportApi";
import { useFarmTopic } from "../../../../hooks/useFarmTopic";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

function buildPageInfo(pageData, pageNumber, size, fallbackItems) {
    return {
        number: pageData?.number ?? pageData?.page ?? pageNumber,
        size: pageData?.size ?? size,
        totalPages: pageData?.totalPages ?? 0,
        totalElements: pageData?.totalElements ?? fallbackItems.length,
        first: pageData?.first ?? true,
        last: pageData?.last ?? true,
    };
}

export function useOwnerIotImports(farmId, initialPage = 0, initialSize = 10) {
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

    const loadPendingImports = useCallback(async () => {
        if (!farmId) return;

        try {
            setPendingLoading(true);
            setError("");

            const data = await getPendingImportScans(
                farmId,
                pendingPageNumber,
                size,
            );

            setPendingPage(data);
            setPendingScans(data?.content ?? []);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách nhập kho chờ xác nhận."));
        } finally {
            setPendingLoading(false);
        }
    }, [farmId, pendingPageNumber, size]);

    const loadImportHistory = useCallback(async () => {
        if (!farmId) return;

        try {
            setHistoryLoading(true);
            setError("");

            const data = await getImportScans(
                farmId,
                historyPageNumber,
                size,
            );

            setHistoryPage(data);
            setHistoryScans(data?.content ?? []);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải lịch sử nhập kho."));
        } finally {
            setHistoryLoading(false);
        }
    }, [farmId, historyPageNumber, size]);

    useEffect(() => {
        void loadPendingImports();
    }, [loadPendingImports]);

    useEffect(() => {
        void loadImportHistory();
    }, [loadImportHistory]);

    const reload = useCallback(async () => {
        await Promise.all([
            loadPendingImports(),
            loadImportHistory(),
        ]);
    }, [loadImportHistory, loadPendingImports]);

    useFarmTopic(farmId, "iot-imports", (scan) => {
        if (!scan?.transactionId) {
            void reload();
            return;
        }

        setPendingScans((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.transactionId === scan.transactionId,
            );

            if (existingIndex >= 0) {
                return prev.map((item, index) =>
                    index === existingIndex ? scan : item,
                );
            }

            return [scan, ...prev];
        });

        setPendingPage((prev) => {
            if (!prev) return prev;

            const content = prev.content ?? [];
            const alreadyExists = content.some(
                (item) => item.transactionId === scan.transactionId,
            );

            if (alreadyExists) {
                return {
                    ...prev,
                    content: content.map((item) =>
                        item.transactionId === scan.transactionId ? scan : item,
                    ),
                };
            }

            return {
                ...prev,
                content: [scan, ...content],
                totalElements: Number(prev.totalElements ?? 0) + 1,
            };
        });
    });

    async function confirmImport(transactionId, totalImportCost, packageCount = 1) {
        try {
            setSubmittingId(transactionId);
            setActionError("");
            setActionSuccess("");

            const result = await confirmImportScan(
                farmId,
                transactionId,
                totalImportCost,
                packageCount,
            );

            setPendingScans((prev) =>
                prev.filter((item) => item.transactionId !== transactionId),
            );

            await loadImportHistory();

            setActionSuccess(
                `Đã xác nhận nhập kho ${result.productName || "sản phẩm"}.`,
            );

            return result;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể xác nhận nhập kho."));
            return null;
        } finally {
            setSubmittingId(null);
        }
    }

    const summary = useMemo(() => {
        const totalImportCost = historyScans.reduce(
            (sum, item) => sum + Number(item.totalAmount || 0),
            0,
        );

        return {
            pending: pendingScans.length,
            recognized: pendingScans.filter((item) => item.productId).length,
            unrecognized: pendingScans.filter((item) => !item.productId).length,
            approved: historyScans.filter((item) => item.approvalStatus === "APPROVED").length,
            totalImportCost,
        };
    }, [pendingScans, historyScans]);

    return {
        pendingScans,
        historyScans,
        summary,

        pendingPageInfo: buildPageInfo(
            pendingPage,
            pendingPageNumber,
            size,
            pendingScans,
        ),

        historyPageInfo: buildPageInfo(
            historyPage,
            historyPageNumber,
            size,
            historyScans,
        ),

        pendingLoading,
        historyLoading,
        initialLoading: pendingLoading && pendingPage === null,
        tableLoading: pendingLoading && pendingPage !== null,
        submittingId,

        error,
        actionError,
        actionSuccess,

        setPendingPage: setPendingPageNumber,
        setHistoryPage: setHistoryPageNumber,

        reload,

        confirmImport,

        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}
