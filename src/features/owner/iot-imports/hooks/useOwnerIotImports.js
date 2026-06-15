import { useCallback, useEffect, useMemo, useState } from "react";
import {
    confirmImportScan,
    getPendingImportScans,
} from "../services/ownerIotImportApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerIotImports(farmId, initialPage = 0, initialSize = 10) {
    const [scanPage, setScanPage] = useState(null);
    const [scans, setScans] = useState([]);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const loadPendingImports = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getPendingImportScans(farmId, page, size);

            setScanPage(data);
            setScans(data?.content ?? []);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách nhập kho chờ xác nhận."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    useEffect(() => {
        void loadPendingImports();
    }, [loadPendingImports]);

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

            setScans((prev) =>
                prev.filter((item) => item.transactionId !== transactionId),
            );

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
        return {
            pending: scans.length,
            recognized: scans.filter((item) => item.productId).length,
            unrecognized: scans.filter((item) => !item.productId).length,
        };
    }, [scans]);

    return {
        scans,
        summary,

        pageInfo: {
            number: scanPage?.number ?? scanPage?.page ?? page,
            size: scanPage?.size ?? size,
            totalPages: scanPage?.totalPages ?? 0,
            totalElements: scanPage?.totalElements ?? scans.length,
            first: scanPage?.first ?? true,
            last: scanPage?.last ?? true,
        },

        loading,
        initialLoading: loading && scanPage === null,
        tableLoading: loading && scanPage !== null,
        submittingId,

        error,
        actionError,
        actionSuccess,

        setPage,
        reload: loadPendingImports,
        confirmImport,
        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}