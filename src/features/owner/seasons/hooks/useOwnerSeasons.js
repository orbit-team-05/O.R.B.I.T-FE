import { useCallback, useEffect, useState } from "react";
import {
    getSeasonDashboard,
    getSeasonCards,
    createSeason as apiCreateSeason,
    getSeasonDetail,
    updateSeason as apiUpdateSeason,
    updateSeasonStatus,
    cancelSeason as apiCancelSeason,
    getActiveSpecies,
} from "../services/ownerSeasonApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerSeasons(initialPage = 0, initialSize = 10) {
    const [seasonPage, setSeasonPage] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [speciesList, setSpeciesList] = useState([]);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loadingDetailId, setLoadingDetailId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const seasons = seasonPage?.content ?? [];

    const loadDashboard = useCallback(async () => {
        try {
            const data = await getSeasonDashboard();
            setDashboard(data);
        } catch (err) {
            console.error("Không thể tải dashboard mùa vụ:", err);
        }
    }, []);

    const loadSeasons = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getSeasonCards(page, size);
            setSeasonPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách mùa vụ."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    const loadSpecies = useCallback(async () => {
        try {
            const data = await getActiveSpecies();
            setSpeciesList(data);
        } catch (err) {
            console.error("Không thể tải danh sách species:", err);
        }
    }, []);

    const reload = useCallback(async () => {
        await Promise.all([loadDashboard(), loadSeasons(), loadSpecies()]);
    }, [loadDashboard, loadSeasons, loadSpecies]);

    // Initial load on mount or page change
    useEffect(() => {
        loadSeasons();
    }, [loadSeasons]);

    // Load dashboard and species list on mount
    useEffect(() => {
        loadDashboard();
        loadSpecies();
    }, [loadDashboard, loadSpecies]);

    const loadDetail = useCallback(async (id) => {
        if (!id) return;
        try {
            setDetailLoading(true);
            setLoadingDetailId(id);
            setActionError("");
            const data = await getSeasonDetail(id);
            setSelectedDetail(data);
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải chi tiết mùa vụ."));
        } finally {
            setDetailLoading(false);
            setLoadingDetailId(null);
        }
    }, []);

    const createSeason = async (payload) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");
            const id = await apiCreateSeason(payload);
            setActionSuccess("Tạo mùa vụ mới thành công.");
            await reload();
            return id;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo mùa vụ."));
            return null;
        } finally {
            setSubmitting(false);
        }
    };

    const updateSeason = async (id, payload) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");
            const data = await apiUpdateSeason(id, payload);
            setActionSuccess("Cập nhật thông tin mùa vụ thành công.");
            setSelectedDetail(null);
            await reload();
            return data;
        } catch (err) {
            const msg = getErrorMessage(err, "Không thể cập nhật mùa vụ.");
            setActionError(msg);
            // Keep drawer open so the user can see the inline error
            return null;
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");
            await updateSeasonStatus(id, status);
            setActionSuccess("Chuyển trạng thái mùa vụ thành công.");
            setSelectedDetail(null);
            await reload();
            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể chuyển trạng thái mùa vụ."));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const cancelSeason = async (id) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");
            await apiCancelSeason(id);
            setActionSuccess("Đã hủy mùa vụ thành công.");
            setSelectedDetail(null);
            await reload();
            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể hủy mùa vụ."));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        seasons,
        dashboard,
        selectedDetail,
        setSelectedDetail,
        speciesList,

        pageInfo: {
            number: seasonPage?.number ?? page,
            size: seasonPage?.size ?? size,
            totalPages: seasonPage?.totalPages ?? 0,
            totalElements: seasonPage?.totalElements ?? 0,
            first: seasonPage?.first ?? true,
            last: seasonPage?.last ?? true,
        },

        loading,
        initialLoading: loading && seasonPage === null,
        tableLoading: loading && seasonPage !== null,
        detailLoading,
        loadingDetailId,
        submitting,

        error,
        actionError,
        actionSuccess,

        setPage: handleSetPage,
        reload,
        loadDetail,
        createSeason,
        updateSeason,
        updateStatus,
        cancelSeason,
        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}
