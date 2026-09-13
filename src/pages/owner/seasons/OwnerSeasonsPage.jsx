import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { SeasonDashboardStats } from "../../../features/owner/seasons/components/SeasonDashboardStats";
import { SeasonCardList } from "../../../features/owner/seasons/components/SeasonCardList";
import { SeasonCreateDrawer } from "../../../features/owner/seasons/components/SeasonCreateDrawer";
import { SeasonDetailDrawer } from "../../../features/owner/seasons/components/SeasonDetailDrawer";
import { useOwnerSeasons } from "../../../features/owner/seasons/hooks/useOwnerSeasons";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { OwnerPageHeader } from "../common/OwnerPageHeader";

function PageHeader({
    onCreate,
    onRefresh,
    loading,
}) {
    return (
        <OwnerPageHeader title="Mùa vụ" description="Theo dõi tiến độ, chi phí, trạng thái sinh trưởng và sản lượng dự kiến của từng mùa vụ." actions={<>
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={14}
                        className={loading ? "animate-spin" : ""}
                    />

                    <span className="whitespace-nowrap">
                        Làm mới
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onCreate}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00583d]"
                >
                    <Plus size={16} />

                    <span className="whitespace-nowrap">
                        Lên kế hoạch
                    </span>
                </button>
        </>} />
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-6 px-4 py-6 lg:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-[96px] animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                    />
                ))}
            </div>

            <div className="h-[460px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        </div>
    );
}

export function OwnerSeasonsPage() {
    const toast = useToast();
    const { user } = useAuth();

    const farmId = user?.farmId;
    const isOwner = user?.role === "OWNER" || user?.roles?.includes("OWNER");

    const {
        seasons,
        dashboard,
        selectedDetail,
        setSelectedDetail,
        materialUsages,
        materialUsagePageInfo,
        materialUsageLoading,
        setMaterialUsagePage,
        materialUsageSortKey,
        setMaterialUsageSortKey,
        harvests,
        harvestPageInfo,
        harvestLoading,
        setHarvestPage,
        harvestSortKey,
        setHarvestSortKey,
        otherCosts,
        otherCostPageInfo,
        otherCostLoading,
        setOtherCostPage,
        otherCostSortKey,
        setOtherCostSortKey,
        createOtherCost,
        updateOtherCost,
        deleteOtherCost,
        pageInfo,
        initialLoading,
        tableLoading,
        loadingDetailId,
        submitting,
        error,
        actionError,
        actionSuccess,
        reload,
        setPage,
        sortKey,
        setSortKey,
        loadDetail,
        createSeason,
        updateSeason,
        updateStatus,
        cancelSeason,
        clearActionMessages,
    } = useOwnerSeasons(farmId);

    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
            clearActionMessages();
        }

        if (actionError) {
            toast.error(actionError);
            clearActionMessages();
        }
    }, [
        actionSuccess,
        actionError,
        toast,
        clearActionMessages,
    ]);

    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu mùa vụ",
            );
        }
    }, [error, toast]);

    function handleOpenDetail(item) {
        loadDetail(item.id);
    }

    function handleCloseDetail() {
        clearActionMessages();
        setSelectedDetail(null);
    }

    function handleOpenCreate() {
        setCreateOpen(true);
    }

    function handleCloseCreate() {
        setCreateOpen(false);
    }

    async function handleCreateSeason(payload, file) {
        const id = await createSeason(payload, file);

        if (id) {
            setCreateOpen(false);
        }
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50/50">
            <PageHeader
                onCreate={handleOpenCreate}
                onRefresh={reload}
                loading={tableLoading}
            />

            {initialLoading ? (
                <PageSkeleton />
            ) : (
                <main className="space-y-6 px-4 py-6 lg:px-6">
                    <SeasonDashboardStats
                        dashboard={dashboard}
                    />

                    <SeasonCardList
                        seasons={seasons}
                        pageInfo={pageInfo}
                        loading={tableLoading}
                        loadingDetailId={loadingDetailId}
                        onPageChange={setPage}
                        sortKey={sortKey}
                        onSortChange={setSortKey}
                        onViewDetail={handleOpenDetail}
                    />
                </main>
            )}

            <SeasonCreateDrawer
                open={createOpen}
                submitting={submitting}
                actionError={actionError}
                onClose={handleCloseCreate}
                onSubmit={handleCreateSeason}
            />

            <SeasonDetailDrawer
                open={Boolean(selectedDetail)}
                season={selectedDetail}
                materialUsages={materialUsages}
                materialUsagePageInfo={
                    materialUsagePageInfo
                }
                materialUsageLoading={
                    materialUsageLoading
                }
                onMaterialUsagePageChange={
                    setMaterialUsagePage
                }
                materialUsageSortKey={materialUsageSortKey}
                onMaterialUsageSortChange={setMaterialUsageSortKey}
                harvests={harvests}
                harvestPageInfo={harvestPageInfo}
                harvestLoading={harvestLoading}
                onHarvestPageChange={setHarvestPage}
                harvestSortKey={harvestSortKey}
                onHarvestSortChange={setHarvestSortKey}
                otherCosts={otherCosts}
                otherCostPageInfo={otherCostPageInfo}
                otherCostLoading={otherCostLoading}
                onOtherCostPageChange={setOtherCostPage}
                otherCostSortKey={otherCostSortKey}
                onOtherCostSortChange={setOtherCostSortKey}
                createOtherCost={createOtherCost}
                updateOtherCost={updateOtherCost}
                deleteOtherCost={deleteOtherCost}
                submitting={submitting}
                actionError={actionError}
                onClose={handleCloseDetail}
                onUpdateSeason={updateSeason}
                onUpdateStatus={updateStatus}
                onCancelSeason={cancelSeason}
                canFinalizeSeason={isOwner}
            />
        </div>
    );
}

export default OwnerSeasonsPage;
