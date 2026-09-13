import { useCallback, useEffect, useState } from "react";
import {
    getSeasonDashboard,
    getSeasonCards,
    createSeason as apiCreateSeason,
    getSeasonDetail,
    getSeasonMaterialUsages,
    updateSeason as apiUpdateSeason,
    updateSeasonStatus,
    cancelSeason as apiCancelSeason,
    getSeasonHarvests,
    getSeasonOtherCosts,
    createSeasonOtherCost as apiCreateSeasonOtherCost,
    updateSeasonOtherCost as apiUpdateSeasonOtherCost,
    deleteSeasonOtherCost as apiDeleteSeasonOtherCost,
    uploadSeasonOtherCostReceipt as apiUploadSeasonOtherCostReceipt,
    uploadSeasonImage as apiUploadSeasonImage,
} from "../services/ownerSeasonApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const SEASON_REALTIME_TOPICS = [
    "seasons",
    "inventory",
    "iot-imports",
    "iot-exports",
];

const SEASON_SORTS = {
    createdDesc: "created,desc",
    nameAsc: "name,asc",
    nameDesc: "name,desc",
    startAsc: "startDate,asc",
    status: "status,asc",
};

const MATERIAL_USAGE_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    quantityDesc: "quantity,desc",
    amountDesc: "amount,desc",
    product: "product,asc",
};

const HARVEST_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    quantityDesc: "quantity,desc",
    revenueDesc: "amount,desc",
};

const OTHER_COST_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    amountDesc: "amount,desc",
    description: "description,asc",
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerSeasons(farmId, initialPage = 0, initialSize = 10) {
    const [seasonPage, setSeasonPage] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [materialUsagePage, setMaterialUsagePage] = useState(null);
    const [materialUsagePageNumber, setMaterialUsagePageNumber] = useState(0);
    const [materialUsageSize] = useState(10);
    const [materialUsageLoading, setMaterialUsageLoading] = useState(false);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);
    const [sortKey, setSortKeyState] = useState("createdDesc");
    const [materialUsageSortKey, setMaterialUsageSortKeyState] = useState("createdDesc");
    const [harvestSortKey, setHarvestSortKeyState] = useState("createdDesc");
    const [otherCostSortKey, setOtherCostSortKeyState] = useState("createdDesc");

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loadingDetailId, setLoadingDetailId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const seasons = seasonPage?.content ?? [];

    const [harvestPage, setHarvestPage] = useState(null);
    const [harvestPageNumber, setHarvestPageNumber] = useState(0);
    const [harvestSize] = useState(10);
    const [harvestLoading, setHarvestLoading] = useState(false);

    const [otherCostPage, setOtherCostPage] = useState(null);
    const [otherCostPageNumber, setOtherCostPageNumber] = useState(0);
    const [otherCostSize] = useState(10);
    const [otherCostLoading, setOtherCostLoading] = useState(false);

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
            const data = await getSeasonCards(page, size, SEASON_SORTS[sortKey] || SEASON_SORTS.createdDesc);
            setSeasonPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách mùa vụ."));
        } finally {
            setLoading(false);
        }
    }, [page, size, sortKey]);

    const reload = useCallback(async () => {
        await Promise.all([loadDashboard(), loadSeasons()]);
    }, [loadDashboard, loadSeasons]);

    // Initial load on mount or page change
    useEffect(() => {
        // This effect starts the async data-loading lifecycle for the page.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadSeasons();
    }, [loadSeasons]);

    // Load dashboard on mount
    useEffect(() => {
        // This effect starts the async summary-loading lifecycle for the page.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [loadDashboard]);

    const loadMaterialUsages = useCallback(
        async (seasonId, nextPage = 0, nextSortKey = materialUsageSortKey) => {
            if (!seasonId) return null;

            try {
                setMaterialUsageLoading(true);

                const data = await getSeasonMaterialUsages(
                    seasonId,
                    nextPage,
                    materialUsageSize,
                    MATERIAL_USAGE_SORTS[nextSortKey] || MATERIAL_USAGE_SORTS.createdDesc,
                );

                setMaterialUsagePage(data);
                return data;
            } catch (err) {
                setActionError(
                    getErrorMessage(err, "Không thể tải lịch sử vật tư mùa vụ."),
                );
                return null;
            } finally {
                setMaterialUsageLoading(false);
            }
        },
        [materialUsageSize, materialUsageSortKey],
    );

    const loadHarvests = useCallback(
        async (seasonId, nextPage = 0, nextSortKey = harvestSortKey) => {
            if (!seasonId) return null;

            try {
                setHarvestLoading(true);

                const data = await getSeasonHarvests(
                    seasonId,
                    nextPage,
                    harvestSize,
                    HARVEST_SORTS[nextSortKey] || HARVEST_SORTS.createdDesc,
                );

                setHarvestPage(data);
                return data;
            } catch (err) {
                setActionError(
                    getErrorMessage(err, "Không thể tải lịch sử thu hoạch mùa vụ."),
                );
                return null;
            } finally {
                setHarvestLoading(false);
            }
        },
        [harvestSize, harvestSortKey],
    );

    const loadOtherCosts = useCallback(
        async (seasonId, nextPage = 0, nextSortKey = otherCostSortKey) => {
            if (!seasonId) return null;
            
            try {
                setOtherCostLoading(true);
                const data = await getSeasonOtherCosts(
                    seasonId,
                    nextPage,
                    otherCostSize,
                    OTHER_COST_SORTS[nextSortKey] || OTHER_COST_SORTS.createdDesc,
                );
                setOtherCostPage(data);
                return data;
            } catch (err) {
                setActionError(getErrorMessage(err, "Không thể tải danh sách chi phí phát sinh."));
                return null;
            } finally {
                setOtherCostLoading(false);
            }
        },
        [otherCostSize, otherCostSortKey]
    );

    const loadDetail = useCallback(
        async (id) => {
            if (!id) return;

            try {
                setDetailLoading(true);
                setLoadingDetailId(id);
                setActionError("");
                setMaterialUsagePage(null);
                setMaterialUsagePageNumber(0);
                setHarvestPage(null);
                setHarvestPageNumber(0);
                setOtherCostPage(null);
                setOtherCostPageNumber(0);

                const data = await getSeasonDetail(id);
                setSelectedDetail(data);

                await Promise.all([
                    loadMaterialUsages(id, 0),
                    loadHarvests(id, 0),
                    loadOtherCosts(id, 0),
                ]);

                return data;
            } catch (err) {
                setActionError(getErrorMessage(err, "Không thể tải chi tiết mùa vụ."));
            } finally {
                setDetailLoading(false);
                setLoadingDetailId(null);
            }
        },
        [loadMaterialUsages, loadHarvests, loadOtherCosts],
    );

    useFarmRealtimeRefresh(farmId, SEASON_REALTIME_TOPICS, async () => {
        await reload();

        if (selectedDetail?.id) {
            await loadDetail(selectedDetail.id);
        }
    });

    const createSeason = async (payload, file = null) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");
            const id = await apiCreateSeason(payload);
            
            if (file) {
                await apiUploadSeasonImage(id, file);
            }
            
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

    const updateSeason = async (id, payload, imageFile = null) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");
            const data = await apiUpdateSeason(id, payload);
            
            if (imageFile) {
                await apiUploadSeasonImage(id, imageFile);
            }

            setActionSuccess("Cập nhật thông tin mùa vụ thành công.");
            await reload();
            if (id) {
                await loadDetail(id);
            }
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

    const updateStatus = async (id, status, extraPayload = {}) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");

            await updateSeasonStatus(id, {
                status,
                ...extraPayload,
            });

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

    async function handleSetMaterialUsagePage(nextPage) {
        const normalizedPage = Math.max(Number(nextPage) || 0, 0);
        setMaterialUsagePageNumber(normalizedPage);

        if (selectedDetail?.id) {
            await loadMaterialUsages(selectedDetail.id, normalizedPage);
        }
    }

    async function handleSetHarvestPage(nextPage) {
        const normalizedPage = Math.max(Number(nextPage) || 0, 0);
        setHarvestPageNumber(normalizedPage);

        if (selectedDetail?.id) {
            await loadHarvests(selectedDetail.id, normalizedPage);
        }
    }

    async function handleSetOtherCostPage(nextPage) {
        const normalizedPage = Math.max(Number(nextPage) || 0, 0);
        setOtherCostPageNumber(normalizedPage);

        if (selectedDetail?.id) {
            await loadOtherCosts(selectedDetail.id, normalizedPage);
        }
    }

    async function handleSetMaterialUsageSort(nextSortKey) {
        setMaterialUsageSortKeyState(nextSortKey);
        setMaterialUsagePageNumber(0);
        if (selectedDetail?.id) {
            await loadMaterialUsages(selectedDetail.id, 0, nextSortKey);
        }
    }

    async function handleSetHarvestSort(nextSortKey) {
        setHarvestSortKeyState(nextSortKey);
        setHarvestPageNumber(0);
        if (selectedDetail?.id) {
            await loadHarvests(selectedDetail.id, 0, nextSortKey);
        }
    }

    async function handleSetOtherCostSort(nextSortKey) {
        setOtherCostSortKeyState(nextSortKey);
        setOtherCostPageNumber(0);
        if (selectedDetail?.id) {
            await loadOtherCosts(selectedDetail.id, 0, nextSortKey);
        }
    }

    const createOtherCost = async (seasonId, payload, file) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");

            const newCost = await apiCreateSeasonOtherCost(seasonId, payload);
            if (file) {
                await apiUploadSeasonOtherCostReceipt(seasonId, newCost.id, file);
            }

            setActionSuccess("Thêm chi phí phát sinh thành công.");
            await loadOtherCosts(seasonId, otherCostPageNumber);
            if (selectedDetail?.id === seasonId) {
                await loadDetail(seasonId); // To update total otherCost
            }
            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể thêm chi phí phát sinh."));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const updateOtherCost = async (seasonId, costId, payload, file) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");

            await apiUpdateSeasonOtherCost(seasonId, costId, payload);
            if (file) {
                await apiUploadSeasonOtherCostReceipt(seasonId, costId, file);
            }

            setActionSuccess("Cập nhật chi phí phát sinh thành công.");
            await loadOtherCosts(seasonId, otherCostPageNumber);
            if (selectedDetail?.id === seasonId) {
                await loadDetail(seasonId); // To update total otherCost
            }
            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật chi phí phát sinh."));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteOtherCost = async (seasonId, costId) => {
        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");

            await apiDeleteSeasonOtherCost(seasonId, costId);

            setActionSuccess("Xóa chi phí phát sinh thành công.");
            await loadOtherCosts(seasonId, otherCostPageNumber);
            if (selectedDetail?.id === seasonId) {
                await loadDetail(seasonId); // To update total otherCost
            }
            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể xóa chi phí phát sinh."));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    function setSortKey(nextSortKey) {
        setSortKeyState(nextSortKey);
        setPage(0);
    }

    return {
        seasons,
        dashboard,
        selectedDetail,
        setSelectedDetail,

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
        materialUsages: materialUsagePage?.content ?? [],
        materialUsagePageInfo: {
            number: materialUsagePage?.number ?? materialUsagePageNumber,
            size: materialUsagePage?.size ?? materialUsageSize,
            totalPages: materialUsagePage?.totalPages ?? 0,
            totalElements: materialUsagePage?.totalElements ?? 0,
            first: materialUsagePage?.first ?? true,
            last: materialUsagePage?.last ?? true,
        },
        materialUsageLoading,
        setMaterialUsagePage: handleSetMaterialUsagePage,
        materialUsageSortKey,
        setMaterialUsageSortKey: handleSetMaterialUsageSort,
        reloadMaterialUsages: () => {
            if (!selectedDetail?.id) return Promise.resolve(null);
            return loadMaterialUsages(selectedDetail.id, materialUsagePageNumber);
        },

        harvests: harvestPage?.content ?? [],
        harvestPageInfo: {
            number: harvestPage?.number ?? harvestPageNumber,
            size: harvestPage?.size ?? harvestSize,
            totalPages: harvestPage?.totalPages ?? 0,
            totalElements: harvestPage?.totalElements ?? 0,
            first: harvestPage?.first ?? true,
            last: harvestPage?.last ?? true,
        },
        harvestLoading,
        setHarvestPage: handleSetHarvestPage,
        harvestSortKey,
        setHarvestSortKey: handleSetHarvestSort,

        otherCosts: otherCostPage?.content ?? [],
        otherCostPageInfo: {
            number: otherCostPage?.number ?? otherCostPageNumber,
            size: otherCostPage?.size ?? otherCostSize,
            totalPages: otherCostPage?.totalPages ?? 0,
            totalElements: otherCostPage?.totalElements ?? 0,
            first: otherCostPage?.first ?? true,
            last: otherCostPage?.last ?? true,
        },
        otherCostLoading,
        setOtherCostPage: handleSetOtherCostPage,
        otherCostSortKey,
        setOtherCostSortKey: handleSetOtherCostSort,

        setPage: handleSetPage,
        sortKey,
        setSortKey,
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
        createOtherCost,
        updateOtherCost,
        deleteOtherCost,
    };
}
