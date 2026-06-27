import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";

import { CrawlTargetDrawer } from "../../../features/admin/crawl-targets/components/CrawlTargetDrawer";
import { CrawlTargetStats } from "../../../features/admin/crawl-targets/components/CrawlTargetStats";
import { CrawlTargetTable } from "../../../features/admin/crawl-targets/components/CrawlTargetTable";

import { useAdminCrawlTargets } from "../../../features/admin/crawl-targets/hooks/useAdminCrawlTargets";

function AdminCrawlTargetsHeader({ onCreate }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Cấu hình Crawl
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý URL crawl, ánh xạ species và bộ lọc dữ liệu giá thị trường.
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition hover:bg-[#00583d]"
            >
                + Thêm Target
            </button>
        </header>
    );
}

function AdminCrawlTargetsSkeleton() {
    return (
        <section className="space-y-5">
            <AdminCrawlTargetsHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[360px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

function ErrorAlert({ message }) {
    if (!message) return null;

    return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
        </div>
    );
}

export function AdminCrawlTargetsPage() {
    const toast = useToast();

    const {
        targets,
        summary,
        sourceOptions,
        speciesOptions,
        pageInfo,

        error,
        setPage,
        reload,

        initialLoading,
        tableLoading,

        actionLoading,
        actionError,
        clearActionError,

        createTarget,
        updateTarget,
        toggleTargetStatus,
    } = useAdminCrawlTargets();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [drawerMode, setDrawerMode] = useState("create");

    const [selectedTarget, setSelectedTarget] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        target: null,
    });

    function resetDrawerState() {
        setDrawerOpen(false);
        setSelectedTarget(null);
        clearActionError();
    }

    function openCreateDrawer() {
        clearActionError();

        setSelectedTarget(null);
        setDrawerMode("create");
        setDrawerOpen(true);
    }

    function openEditDrawer(target) {
        clearActionError();

        setSelectedTarget(target);
        setDrawerMode("edit");
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        resetDrawerState();
    }

    async function handleSubmitTarget(payload) {
        const isEditMode =
            drawerMode === "edit" && selectedTarget;

        const success = isEditMode
            ? await updateTarget(selectedTarget.id, payload)
            : await createTarget(payload);

        if (!success) {
            toast.error(
                isEditMode
                    ? "Không thể cập nhật cấu hình crawl."
                    : "Không thể thêm cấu hình crawl.",
            );

            return;
        }

        toast.success(
            isEditMode
                ? `Đã cập nhật target "${payload.targetName}".`
                : `Đã thêm target "${payload.targetName}".`,
        );

        resetDrawerState();
    }

    function handleToggleStatus(target) {
        clearActionError();

        setConfirmState({
            open: true,
            target,
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            target: null,
        });

        clearActionError();
    }

    async function confirmToggleStatus() {
        const target = confirmState.target;

        if (!target) return;

        const isActive =
            target.isActive ?? target.active;

        const actionText = isActive
            ? "tắt"
            : "bật lại";

        const success = await toggleTargetStatus(target);

        if (!success) {
            toast.error(
                `Không thể ${actionText} target "${target.targetName}".`,
            );

            return;
        }

        toast.success(
            `Đã ${actionText} target "${target.targetName}".`,
        );

        closeConfirmDialog();
    }

    if (initialLoading) {
        return <AdminCrawlTargetsSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminCrawlTargetsHeader
                    onCreate={openCreateDrawer}
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={reload}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    const confirmTarget = confirmState.target;

    const confirmTargetActive =
        confirmTarget?.isActive ??
        confirmTarget?.active;

    return (
        <>
            <section className="space-y-5">
                <AdminCrawlTargetsHeader
                    onCreate={openCreateDrawer}
                />

                {actionError &&
                    !drawerOpen &&
                    !confirmState.open && (
                        <ErrorAlert
                            message={actionError}
                        />
                    )}

                <CrawlTargetStats summary={summary} />

                <CrawlTargetTable
                    targets={targets}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onEdit={openEditDrawer}
                    onToggleStatus={handleToggleStatus}
                />
            </section>

            <CrawlTargetDrawer
                open={drawerOpen}
                mode={drawerMode}
                target={selectedTarget}
                sourceOptions={sourceOptions}
                speciesOptions={speciesOptions}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleSubmitTarget}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={
                    confirmTargetActive
                        ? "Tắt Target Crawl"
                        : "Bật lại Target Crawl"
                }
                description={
                    confirmTarget
                        ? `Bạn có chắc muốn ${
                              confirmTargetActive
                                  ? "tắt"
                                  : "bật lại"
                          } target "${
                              confirmTarget.targetName
                          }" không?`
                        : ""
                }
                confirmText={
                    confirmTargetActive
                        ? "Tắt Target"
                        : "Bật lại"
                }
                cancelText="Hủy"
                variant={
                    confirmTargetActive
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