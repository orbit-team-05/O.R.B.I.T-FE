import { useCallback, useEffect, useMemo, useState } from "react";

import {
    createMarketSource,
    getMarketSources,
    updateMarketSource,
    updateMarketSourceStatus,
} from "../services/marketSourceApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

function normalizePage(data, page, size) {
    return {
        content: data?.content ?? [],
        number: data?.number ?? page,
        size: data?.size ?? size,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 0,
        first: data?.first ?? true,
        last: data?.last ?? true,
    };
}

export function useAdminMarketSources(initialPage = 0, initialSize = 10) {
    const [sourcePage, setSourcePage] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadSources = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMarketSources(page, size);
            setSourcePage(normalizePage(data, page, size));
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải nguồn dữ liệu."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        loadSources();
    }, [loadSources]);

    const sources = sourcePage?.content ?? [];

    const summary = useMemo(() => {
        const totalSources = sourcePage?.totalElements ?? sources.length;
        const activeSources = sources.filter(
            (item) => item.isActive ?? item.active,
        ).length;

        return {
            totalSources,
            activeSources,
            inactiveSources: Math.max(totalSources - activeSources, 0),
        };
    }, [sourcePage?.totalElements, sources]);

    async function handleCreateSource(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await createMarketSource(payload);
            await loadSources();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo nguồn dữ liệu."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateSource(sourceId, payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await updateMarketSource(sourceId, payload);
            await loadSources();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật nguồn dữ liệu."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleToggleSourceStatus(source) {
        const currentActive = source.isActive ?? source.active;
        const nextActive = !currentActive;

        try {
            setActionLoading(true);
            setActionError("");

            await updateMarketSourceStatus(source.id, nextActive);
            await loadSources();

            return true;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể cập nhật trạng thái nguồn dữ liệu."),
            );
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    return {
        sources,
        summary,
        pageInfo: {
            number: sourcePage?.number ?? page,
            size: sourcePage?.size ?? size,
            totalPages: sourcePage?.totalPages ?? 0,
            totalElements: sourcePage?.totalElements ?? 0,
            first: sourcePage?.first ?? true,
            last: sourcePage?.last ?? true,
        },
        page,
        setPage,
        loading,
        error,
        reload: loadSources,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createSource: handleCreateSource,
        updateSource: handleUpdateSource,
        toggleSourceStatus: handleToggleSourceStatus,
    };
}