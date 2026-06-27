import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { FarmDrawer } from "../../../features/admin/farms/components/FarmDrawer";
import { FarmStats } from "../../../features/admin/farms/components/FarmStats";
import { FarmTable } from "../../../features/admin/farms/components/FarmTable";
import { useAdminFarms } from "../../../features/admin/farms/hooks/useAdminFarms";

function AdminFarmHeader({ onCreate = () => {} }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Quản lý Nông trại
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý danh sách nông trại, chủ sở hữu và phạm vi dữ liệu trong hệ thống
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition hover:bg-[#00583d]"
            >
                + Thêm Nông trại
            </button>
        </header>
    );
}

function AdminFarmSkeleton() {
    return (
        <section className="space-y-5">
            <AdminFarmHeader onCreate={() => {}} />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-80 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="space-y-3 px-5 py-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-10 animate-pulse rounded bg-slate-100"
                        />
                    ))}
                </div>
            </section>
        </section>
    );
}

export function AdminFarmPage() {
    const toast = useToast();

    const {
        farms = [],
        summary = {},
        pageInfo = {},
        error,
        setPage,
        reload,

        initialLoading,
        tableLoading,

        owners = [],
        actionLoading,
        actionError,
        clearActionError,
        createFarm,
        updateFarm,
        deleteFarm,
    } = useAdminFarms() || {};

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [selectedFarm, setSelectedFarm] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        farm: null,
    });

    function openCreateDrawer() {
        clearActionError?.();
        setSelectedFarm(null);
        setDrawerMode("create");
        setDrawerOpen(true);
    }

    function openEditDrawer(item) {
        clearActionError?.();
        setSelectedFarm(item || null);
        setDrawerMode("edit");
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        setDrawerOpen(false);
        setSelectedFarm(null);
        clearActionError?.();
    }

    async function handleSubmitFarm(payload = {}) {
        try {
            const isEdit = drawerMode === "edit" && selectedFarm;

            const success = isEdit
                ? await updateFarm?.(selectedFarm?.id, payload)
                : await createFarm?.(payload);

            if (!success) {
                toast.error(
                    isEdit
                        ? "Không thể cập nhật nông trại."
                        : "Không thể thêm nông trại.",
                );
                return;
            }

            toast.success(
                isEdit
                    ? `Đã cập nhật nông trại "${payload?.farmName || ""}".`
                    : `Đã thêm nông trại "${payload?.farmName || ""}".`,
            );

            closeDrawer();
        } catch (err) {
            console.error(err);

            toast.error(
                err?.message || "Có lỗi xảy ra khi xử lý nông trại.",
            );
        }
    }

    function handleDeleteFarm(item) {
        clearActionError?.();

        setConfirmState({
            open: true,
            farm: item || null,
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            farm: null,
        });

        clearActionError?.();
    }

    async function confirmDelete() {
        try {
            const item = confirmState?.farm;

            if (!item?.id) {
                toast.error("Không tìm thấy thông tin nông trại.");
                return;
            }

            const success = await deleteFarm?.(item.id);

            if (!success) {
                toast.error(
                    `Không thể xóa nông trại "${item?.farmName || ""}".`,
                );
                return;
            }

            toast.success(
                `Đã xóa nông trại "${item?.farmName || ""}".`,
            );

            closeConfirmDialog();
        } catch (err) {
            console.error(err);

            toast.error(
                err?.message || "Có lỗi xảy ra khi xóa nông trại.",
            );
        }
    }

    if (initialLoading) {
        return <AdminFarmSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminFarmHeader onCreate={openCreateDrawer} />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {error || "Không thể tải dữ liệu nông trại."}
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

    const confirmFarm = confirmState?.farm;

    return (
        <>
            <section className="space-y-5">
                <AdminFarmHeader onCreate={openCreateDrawer} />

                {actionError &&
                    !drawerOpen &&
                    !confirmState.open && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}

                <FarmStats summary={summary || {}} />

                <FarmTable
                    farms={Array.isArray(farms) ? farms : []}
                    pageInfo={pageInfo || {}}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onEdit={openEditDrawer}
                    onDelete={handleDeleteFarm}
                />
            </section>

            <FarmDrawer
                open={drawerOpen}
                mode={drawerMode}
                farm={selectedFarm}
                ownersList={Array.isArray(owners) ? owners : []}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleSubmitFarm}
            />

            <ConfirmDialog
                open={confirmState.open}
                title="Xóa Nông trại"
                description={
                    confirmFarm
                        ? `Bạn có chắc muốn xóa nông trại "${confirmFarm.farmName}" không? Hành động này không thể hoàn tác.`
                        : ""
                }
                confirmText="Xóa Nông trại"
                cancelText="Hủy"
                variant="danger"
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmDelete}
            />
        </>
    );
}