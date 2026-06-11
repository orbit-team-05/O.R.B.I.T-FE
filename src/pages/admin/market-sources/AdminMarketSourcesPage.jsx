import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { MarketSourceDrawer } from "../../../features/admin/market-sources/components/MarketSourceDrawer";
import { MarketSourceStats } from "../../../features/admin/market-sources/components/MarketSourceStats";
import { MarketSourceTable } from "../../../features/admin/market-sources/components/MarketSourceTable";
import { useAdminMarketSources } from "../../../features/admin/market-sources/hooks/useAdminMarketSources";

function AdminMarketSourcesHeader({ onCreate }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Nguồn dữ liệu
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý website và nền tảng dùng để crawl giá thị trường
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
            >
                + Thêm nguồn
            </button>
        </header>
    );
}

function AdminMarketSourcesSkeleton() {
    return (
        <section className="space-y-5">
            <AdminMarketSourcesHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

export function AdminMarketSourcesPage() {
    const toast = useToast();

    const {
        sources,
        summary,
        pageInfo,
        loading,
        error,
        setPage,
        reload,

        actionLoading,
        actionError,
        clearActionError,
        createSource,
        updateSource,
        toggleSourceStatus,
    } = useAdminMarketSources();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [selectedSource, setSelectedSource] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        source: null,
    });

    function openCreateDrawer() {
        clearActionError();
        setSelectedSource(null);
        setDrawerMode("create");
        setDrawerOpen(true);
    }

    function openEditDrawer(item) {
        clearActionError();
        setSelectedSource(item);
        setDrawerMode("edit");
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        setDrawerOpen(false);
        setSelectedSource(null);
        clearActionError();
    }

    async function handleSubmitSource(payload) {
        const isEdit = drawerMode === "edit" && selectedSource;

        const success = isEdit
            ? await updateSource(selectedSource.id, payload)
            : await createSource(payload);

        if (!success) {
            toast.error(
                isEdit
                    ? "Không thể cập nhật nguồn dữ liệu."
                    : "Không thể thêm nguồn dữ liệu.",
            );
            return;
        }

        toast.success(
            isEdit
                ? `Đã cập nhật nguồn "${payload.sourceName}".`
                : `Đã thêm nguồn "${payload.sourceName}".`,
        );

        closeDrawer();
    }

    function handleToggleStatus(item) {
        clearActionError();

        setConfirmState({
            open: true,
            source: item,
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            source: null,
        });

        clearActionError();
    }

    async function confirmToggleStatus() {
        const item = confirmState.source;

        if (!item) return;

        const active = item.isActive ?? item.active;
        const actionText = active ? "tắt" : "bật lại";

        const success = await toggleSourceStatus(item);

        if (!success) {
            toast.error(`Không thể ${actionText} nguồn "${item.sourceName}".`);
            return;
        }

        toast.success(`Đã ${actionText} nguồn "${item.sourceName}".`);
        closeConfirmDialog();
    }

    if (loading) {
        return <AdminMarketSourcesSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminMarketSourcesHeader onCreate={openCreateDrawer} />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">{error}</p>

                    <button
                        type="button"
                        onClick={reload}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    const confirmSource = confirmState.source;
    const confirmSourceActive = confirmSource?.isActive ?? confirmSource?.active;

    return (
        <>
            <section className="space-y-5">
                <AdminMarketSourcesHeader onCreate={openCreateDrawer} />

                {actionError && !drawerOpen && !confirmState.open && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <MarketSourceStats summary={summary} />

                <MarketSourceTable
                    sources={sources}
                    pageInfo={pageInfo}
                    onPageChange={setPage}
                    onEdit={openEditDrawer}
                    onToggleStatus={handleToggleStatus}
                />
            </section>

            <MarketSourceDrawer
                open={drawerOpen}
                mode={drawerMode}
                source={selectedSource}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleSubmitSource}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={
                    confirmSourceActive ? "Tắt nguồn dữ liệu" : "Bật lại nguồn dữ liệu"
                }
                description={
                    confirmSource
                        ? `Bạn có chắc muốn ${
                            confirmSourceActive ? "tắt" : "bật lại"
                        } nguồn "${confirmSource.sourceName}" không?`
                        : ""
                }
                confirmText={confirmSourceActive ? "Tắt nguồn" : "Bật lại"}
                cancelText="Hủy"
                variant={confirmSourceActive ? "danger" : "success"}
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmToggleStatus}
            />
        </>
    );
}