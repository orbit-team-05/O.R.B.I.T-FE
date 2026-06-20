import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { SeasonDashboardStats } from "../../../features/owner/seasons/components/SeasonDashboardStats";
import { SeasonTable } from "../../../features/owner/seasons/components/SeasonTable";
import { SeasonCreateDrawer } from "../../../features/owner/seasons/components/SeasonCreateDrawer";
import { SeasonDetailDrawer } from "../../../features/owner/seasons/components/SeasonDetailDrawer";
import { useOwnerSeasons } from "../../../features/owner/seasons/hooks/useOwnerSeasons";
import { useToast } from "../../../components/common/toast/ToastProvider";

function PageHeader({ onCreate, onRefresh, loading }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-semibold text-[#006948]">
                    Bảng điều khiển
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Quản lý Mùa vụ
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Theo dõi tiến độ, chi phí giống, trạng thái sinh trưởng và sản lượng dự kiến của từng ao nuôi trồng.
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Làm mới
                </button>

                <button
                    type="button"
                    onClick={onCreate}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-bold text-white hover:bg-[#00583d] shadow-sm transition-all"
                >
                    <Plus size={16} />
                    Lên kế hoạch
                </button>
            </div>
        </header>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-6 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-[96px] animate-pulse rounded-xl bg-slate-100 border border-slate-200"
                    />
                ))}
            </div>
            <div className="h-[460px] animate-pulse rounded-xl bg-slate-100 border border-slate-200" />
        </div>
    );
}

export function OwnerSeasonsPage() {
    const toast = useToast();
    const {
        seasons,
        dashboard,
        selectedDetail,
        setSelectedDetail,
        materialUsages,
        materialUsagePageInfo,
        materialUsageLoading,
        setMaterialUsagePage,
        speciesList,
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
        loadDetail,
        createSeason,
        updateSeason,
        updateStatus,
        cancelSeason,
        clearActionMessages,
        speciesSizes,
        loadSpeciesSizes,
    } = useOwnerSeasons();

    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
            clearActionMessages();
        }
        // Only toast errors when the detail drawer is NOT open.
        // When the drawer is open, errors display inline inside the drawer.
        if (actionError && !selectedDetail) {
            toast.error(actionError);
            clearActionMessages();
        }
    }, [actionSuccess, actionError, selectedDetail, toast, clearActionMessages]);

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

    async function handleCreateSeason(payload) {
        const id = await createSeason(payload);
        if (id) {
            setCreateOpen(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                onCreate={handleOpenCreate}
                onRefresh={reload}
                loading={tableLoading}
            />

            {initialLoading ? (
                <PageSkeleton />
            ) : error ? (
                <div className="px-6 py-6">
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                </div>
            ) : (
                <main className="space-y-6 px-6 py-6">
                    <SeasonDashboardStats dashboard={dashboard} />

                    <SeasonTable
                        seasons={seasons}
                        pageInfo={pageInfo}
                        loading={tableLoading}
                        loadingDetailId={loadingDetailId}
                        onPageChange={setPage}
                        onViewDetail={handleOpenDetail}
                    />
                </main>
            )}

            <SeasonCreateDrawer
                open={createOpen}
                speciesList={speciesList}
                submitting={submitting}
                actionError={actionError}
                onClose={handleCloseCreate}
                onSubmit={handleCreateSeason}
            />

            <SeasonDetailDrawer
                open={Boolean(selectedDetail)}
                season={selectedDetail}
                materialUsages={materialUsages}
                materialUsagePageInfo={materialUsagePageInfo}
                materialUsageLoading={materialUsageLoading}
                onMaterialUsagePageChange={setMaterialUsagePage}
                submitting={submitting}
                actionError={actionError}
                onClose={handleCloseDetail}
                onUpdateSeason={updateSeason}
                onUpdateStatus={updateStatus}
                onCancelSeason={cancelSeason}
                speciesSizes={speciesSizes}
                loadSpeciesSizes={loadSpeciesSizes}
            />
        </div>
    );
}

export default OwnerSeasonsPage;
