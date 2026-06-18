import { useCallback, useEffect, useState } from "react";

import {
    createFarm,
    deleteFarm,
    getFarms,
    getFarmSummary,
    updateFarm,
} from "../services/farmApi";

const INITIAL_SUMMARY = {
    totalFarms: 0,
    totalOwners: 0,
};

function getErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallbackMessage
    );
}

export function useAdminFarms(initialPage = 0, initialSize = 10) {
    const [farmsPage, setFarmsPage] = useState(null);
    const [summary, setSummary] = useState(INITIAL_SUMMARY);
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadFarms = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [farmsData, summaryData] = await Promise.all([
                getFarms(page, size),
                getFarmSummary(),
            ]);

            setFarmsPage(farmsData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải dữ liệu Farm."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        loadFarms();
    }, [loadFarms]);

    async function handleCreateFarm(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await createFarm(payload);
            await loadFarms();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo Farm."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateFarm(farmId, payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await updateFarm(farmId, payload);
            await loadFarms();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật Farm."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteFarm(farmId) {
        try {
            setActionLoading(true);
            setActionError("");

            await deleteFarm(farmId);
            await loadFarms();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể xóa Farm."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        farms: farmsPage?.content ?? [],
        summary,
        pageInfo: {
            number: farmsPage?.number ?? page,
            size: farmsPage?.size ?? size,
            totalPages: farmsPage?.totalPages ?? 0,
            totalElements: farmsPage?.totalElements ?? 0,
            first: farmsPage?.first ?? true,
            last: farmsPage?.last ?? true,
        },
        page,
        setPage: handleSetPage,
        loading,
        initialLoading: loading && farmsPage === null,
        tableLoading: loading && farmsPage !== null,
        error,
        reload: loadFarms,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createFarm: handleCreateFarm,
        updateFarm: handleUpdateFarm,
        deleteFarm: handleDeleteFarm,
    };
}
