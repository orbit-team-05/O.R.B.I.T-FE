import { useCallback, useEffect, useMemo, useState } from "react";

import {
    createCrawlTarget,
    getCrawlTargets,
    getSourceOptions,
    getSpeciesOptions,
    updateCrawlTarget,
    updateCrawlTargetStatus,
} from "../services/crawlTargetApi";
import { useAdminRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const CRAWL_TARGET_REALTIME_TOPICS = [
    "market-crawl-targets",
    "market-sources",
    "species",
];

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useAdminCrawlTargets(initialPage = 0, initialSize = 10) {
    const [targetPage, setTargetPage] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const [sourceOptions, setSourceOptions] = useState([]);
    const [speciesOptions, setSpeciesOptions] = useState([]);

    const loadTargets = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCrawlTargets(page, size);
            setTargetPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải cấu hình crawl."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        loadTargets();
    }, [loadTargets]);

    const targets = targetPage?.content ?? [];

    const summary = useMemo(() => {
        const totalTargets = targetPage?.totalElements ?? targets.length;
        const activeTargets = targets.filter(
            (item) => item.isActive ?? item.active,
        ).length;
        const errorTargets = targets.filter((item) => Boolean(item.lastError)).length;

        const latestCrawledAt = targets
            .map((item) => item.lastCrawledAt)
            .filter(Boolean)
            .sort()
            .at(-1);

        return {
            totalTargets,
            activeTargets,
            errorTargets,
            latestCrawledAt,
        };
    }, [targetPage?.totalElements, targets]);

    const loadOptions = useCallback(async () => {
        try {
            const [sourcesData, speciesData] = await Promise.all([
                getSourceOptions(),
                getSpeciesOptions(),
            ]);

            setSourceOptions(sourcesData);
            setSpeciesOptions(speciesData);
        } catch (err) {
            console.error("Cannot load crawl target options:", err);
        }
    }, []);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    useAdminRealtimeRefresh(CRAWL_TARGET_REALTIME_TOPICS, async () => {
        await Promise.all([
            loadTargets(),
            loadOptions(),
        ]);
    });

    async function handleCreateTarget(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await createCrawlTarget(payload);
            await loadTargets();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo cấu hình crawl."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateTarget(targetId, payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await updateCrawlTarget(targetId, payload);
            await loadTargets();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật cấu hình crawl."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleToggleTargetStatus(target) {
        const currentActive = target.isActive ?? target.active;
        const nextActive = !currentActive;

        try {
            setActionLoading(true);
            setActionError("");

            await updateCrawlTargetStatus(target.id, nextActive);
            await loadTargets();

            return true;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể cập nhật trạng thái cấu hình crawl."),
            );
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        targets,
        summary,
        sourceOptions,
        speciesOptions,
        reloadOptions: loadOptions,
        pageInfo: {
            number: targetPage?.number ?? page,
            size: targetPage?.size ?? size,
            totalPages: targetPage?.totalPages ?? 0,
            totalElements: targetPage?.totalElements ?? 0,
            first: targetPage?.first ?? true,
            last: targetPage?.last ?? true,
        },
        page,
        setPage: handleSetPage,
        loading,
        initialLoading: loading && targetPage === null,
        tableLoading: loading && targetPage !== null,
        error,
        reload: loadTargets,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createTarget: handleCreateTarget,
        updateTarget: handleUpdateTarget,
        toggleTargetStatus: handleToggleTargetStatus,
    };
}
