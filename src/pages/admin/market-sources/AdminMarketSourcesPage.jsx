import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { MarketSourceDrawer } from "../../../features/admin/market-sources/components/MarketSourceDrawer";
import { MarketSourceStats } from "../../../features/admin/market-sources/components/MarketSourceStats";
import { MarketSourceTable } from "../../../features/admin/market-sources/components/MarketSourceTable";
import { useAdminMarketSources } from "../../../features/admin/market-sources/hooks/useAdminMarketSources";

function AdminMarketSourcesHeader({ onCreate }) {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#00583d]"
            >
                + Thêm nguồn
            </button>
        </header>
    );
}

function AdminMarketSourcesSkeleton() {
    return (
        <section className="space-y-5">
            <AdminMarketSourcesHeader onCreate={() => {}} />

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

function ErrorState({ error, onRetry, onCreate }) {
    return (
        <section className="space-y-5">
            <AdminMarketSourcesHeader onCreate={onCreate} />

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-medium text-red-700">
                    {error || "Đã xảy ra lỗi khi tải dữ liệu."}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        </section>
    );
}

export function AdminMarketSourcesPage() {
    const toast = useToast();

    const {
        sources,
        summary,
        pageInfo,
        error,
        setPage,
        reload,

        initialLoading,
        tableLoading,

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

    function resetDrawerState() {
        setDrawerOpen(false);
        setDrawerMode("create");
        setSelectedSource(null);
    }

    function openCreateDrawer() {
        clearActionError();

        setDrawerMode("create");
        setSelectedSource(null);
        setDrawerOpen(true);
    }

    function openEditDrawer(source) {
        clearActionError();

        setDrawerMode("edit");
        setSelectedSource(source);
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        resetDrawerState();
        clearActionError();
    }

    async function handleSubmitSource(payload) {
        const isEdit =
            drawerMode === "edit" && selectedSource;

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

    function handleToggleStatus(source) {
        clearActionError();

        setConfirmState({
            open: true,
            source,
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
        const source = confirmState.source;

        if (!source) return;

        const isActive =
            source.isActive ?? source.active;

        const actionText = isActive
            ? "tắt"
            : "bật lại";

        const success =
            await toggleSourceStatus(source);

        if (!success) {
            toast.error(
                `Không thể ${actionText} nguồn "${source.sourceName}".`,
            );

            return;
        }

        toast.success(
            `Đã ${actionText} nguồn "${source.sourceName}".`,
        );

        closeConfirmDialog();
    }

    if (initialLoading) {
        return <AdminMarketSourcesSkeleton />;
    }

    if (error) {
        return (
            <ErrorState
                error={error}
                onRetry={reload}
                onCreate={openCreateDrawer}
            />
        );
    }

    const confirmSource = confirmState.source;

    const confirmSourceActive =
        confirmSource?.isActive ??
        confirmSource?.active;

    return (
        <>
            <section className="space-y-5">
                <AdminMarketSourcesHeader
                    onCreate={openCreateDrawer}
                />

                {actionError &&
                    !drawerOpen &&
                    !confirmState.open && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}

                <MarketSourceStats
                    summary={summary}
                />

                <MarketSourceTable
                    sources={sources}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onEdit={openEditDrawer}
                    onToggleStatus={
                        handleToggleStatus
                    }
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
                    confirmSourceActive
                        ? "Tắt nguồn dữ liệu"
                        : "Bật lại nguồn dữ liệu"
                }
                description={
                    confirmSource
                        ? `Bạn có chắc muốn ${
                              confirmSourceActive
                                  ? "tắt"
                                  : "bật lại"
                          } nguồn "${
                              confirmSource.sourceName
                          }" không?`
                        : ""
                }
                confirmText={
                    confirmSourceActive
                        ? "Tắt nguồn"
                        : "Bật lại"
                }
                cancelText="Hủy"
                variant={
                    confirmSourceActive
                        ? "danger"
                        : "success"
                }
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmToggleStatus}
            />
        </>
    );
}