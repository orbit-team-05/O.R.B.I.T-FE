import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import { useState } from "react";
import { Search } from "lucide-react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { FarmDrawer } from "../../../features/admin/farms/components/FarmDrawer";
import { FarmStats } from "../../../features/admin/farms/components/FarmStats";
import { FarmTable } from "../../../features/admin/farms/components/FarmTable";
import { useAdminFarms } from "../../../features/admin/farms/hooks/useAdminFarms";
import { getFarmById } from "../../../features/admin/farms/services/farmApi";

function AdminFarmHeader({ onCreate = () => {} }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Nông trại
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
    return <AdminPageSkeleton variant="farm" />;
}

export function AdminFarmPage() {
    const toast = useToast();

    const {
        farms = [],
        summary = {},
        pageInfo = {},
        error,
        setPage,
        filters,
        updateFilters,
        reload,

        initialLoading,
        tableLoading,

        owners = [],
        actionLoading,
        actionError,
        clearActionError,
        createFarm,
        updateFarm,
        updateFarmStatus,
        uploadFarmImage,
    } = useAdminFarms() || {};

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [selectedFarm, setSelectedFarm] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        farm: null,
        nextActive: false,
    });

    function openCreateDrawer() {
        clearActionError?.();
        setSelectedFarm(null);
        setDrawerMode("create");
        setDrawerOpen(true);
    }

    async function openFarmDrawer(item, mode) {
        clearActionError?.();
        setSelectedFarm(item || null);
        setDrawerMode(mode);
        setDrawerOpen(true);

        try {
            const detail = await getFarmById(item.id);
            setSelectedFarm(detail);
        } catch (err) {
            console.error("Không thể tải thông tin chi tiết nông trại:", err);
            toast.error("Không thể tải thông tin chi tiết nông trại.");
        }
    }

    function openViewDrawer(item) {
        return openFarmDrawer(item, "view");
    }

    function openEditDrawer(item) {
        return openFarmDrawer(item, "edit");
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

    function handleToggleFarmStatus(item) {
        clearActionError?.();

        setConfirmState({
            open: true,
            farm: item || null,
            nextActive: !item?.isActive,
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            farm: null,
            nextActive: false,
        });

        clearActionError?.();
    }

    async function confirmStatusChange() {
        try {
            const item = confirmState?.farm;

            if (!item?.id) {
                toast.error("Không tìm thấy thông tin nông trại.");
                return;
            }

            const success = await updateFarmStatus?.(
                item.id,
                confirmState.nextActive,
            );

            if (!success) {
                toast.error(`Không thể cập nhật trạng thái nông trại "${item?.farmName || ""}".`);
                return;
            }

            toast.success(
                confirmState.nextActive
                    ? `Đã kích hoạt nông trại "${item?.farmName || ""}".`
                    : `Đã tạm ngưng nông trại "${item?.farmName || ""}".`,
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

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1 lg:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input value={filters.keyword} onChange={(event) => updateFilters({ keyword: event.target.value })} placeholder="Tìm tên hoặc địa chỉ nông trại..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#006948] focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <select value={filters.active} onChange={(event) => updateFilters({ active: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#006948]">
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Đã tạm ngưng</option>
                    </select>
                </div>

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
                    onView={openViewDrawer}
                    onEdit={openEditDrawer}
                    onToggleStatus={handleToggleFarmStatus}
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
                onUploadImage={async (file) => {
                    if (!selectedFarm?.id) return;
                    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                        toast.error("Ảnh Farm chỉ hỗ trợ JPEG, PNG hoặc WebP.");
                        return;
                    }
                    if (file.size > 20 * 1024 * 1024) {
                        toast.error("Ảnh Farm không được vượt quá 20MB.");
                        return;
                    }
                    const updated = await uploadFarmImage?.(selectedFarm.id, file);
                    if (updated) {
                        setSelectedFarm(updated);
                        toast.success("Đã cập nhật ảnh nông trại.");
                    }
                }}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.nextActive ? "Kích hoạt Nông trại" : "Tạm ngưng Nông trại"}
                description={
                    confirmFarm
                        ? `Bạn có chắc muốn ${confirmState.nextActive ? "kích hoạt" : "tạm ngưng"} nông trại "${confirmFarm.farmName}" không?`
                        : ""
                }
                confirmText={confirmState.nextActive ? "Kích hoạt" : "Tạm ngưng"}
                cancelText="Hủy"
                variant={confirmState.nextActive ? "default" : "danger"}
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmStatusChange}
            />
        </>
    );
}
