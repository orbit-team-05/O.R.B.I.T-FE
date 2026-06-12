import { useCallback, useEffect, useState } from "react";

import {
    createSpecies,
    getSpecies,
    getSpeciesSummary,
    updateSpecies,
    updateSpeciesStatus,
} from "../services/speciesApi";

const INITIAL_SUMMARY = {
    totalSpecies: 0,
    activeSpecies: 0,
    inactiveSpecies: 0,
};

function getErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallbackMessage
    );
}

export function useAdminSpecies(initialPage = 0, initialSize = 10) {
    const [speciesPage, setSpeciesPage] = useState(null);
    const [summary, setSummary] = useState(INITIAL_SUMMARY);
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadSpecies = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [speciesData, summaryData] = await Promise.all([
                getSpecies(page, size),
                getSpeciesSummary(),
            ]);

            setSpeciesPage(speciesData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải dữ liệu Species."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        loadSpecies();
    }, [loadSpecies]);

    async function handleCreateSpecies(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await createSpecies(payload);
            await loadSpecies();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo Species."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateSpecies(speciesId, payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await updateSpecies(speciesId, payload);
            await loadSpecies();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật Species."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleToggleSpeciesStatus(species) {
        const currentActive = species.isActive ?? species.active;
        const nextActive = !currentActive;

        try {
            setActionLoading(true);
            setActionError("");

            await updateSpeciesStatus(species.id, nextActive);
            await loadSpecies();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật trạng thái Species."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        species: speciesPage?.content ?? [],
        summary,
        pageInfo: {
            number: speciesPage?.number ?? page,
            size: speciesPage?.size ?? size,
            totalPages: speciesPage?.totalPages ?? 0,
            totalElements: speciesPage?.totalElements ?? 0,
            first: speciesPage?.first ?? true,
            last: speciesPage?.last ?? true,
        },
        page,
        setPage: handleSetPage,
        loading,
        initialLoading: loading && speciesPage === null,
        tableLoading: loading && speciesPage !== null,
        error,
        reload: loadSpecies,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createSpecies: handleCreateSpecies,
        updateSpecies: handleUpdateSpecies,
        toggleSpeciesStatus: handleToggleSpeciesStatus,
    };
}