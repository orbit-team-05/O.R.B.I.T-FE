import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import { useState } from "react";
import { Search } from "lucide-react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { UserStats } from "../../../features/admin/users/components/UserStats";
import { UserTable } from "../../../features/admin/users/components/UserTable";
import { UserDrawer } from "../../../features/admin/users/components/UserDrawer";
import { useAdminUsers } from "../../../features/admin/users/hooks/useAdminUsers";
import { getUserDetail, uploadUserAvatar } from "../../../features/admin/users/services/userApi";
import { createFarm } from "../../../features/admin/farms/services/farmApi";
import { useAuth } from "../../../features/auth/context/AuthContext";

function AdminUsersHeader({ onCreate }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Người dùng
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Xem thống kê tài khoản, phân quyền vai trò, quản lý nông trại
                    trực thuộc và tạo mới người dùng.
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition hover:bg-[#00583d]"
            >
                + Thêm Người dùng
            </button>
        </header>
    );
}

function AdminUsersSkeleton() {
    return <AdminPageSkeleton variant="table" />;
}

function ErrorAlert({ message }) {
    if (!message) return null;

    return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
        </div>
    );
}

export function AdminUsersPage() {
    const toast = useToast();

    const { user: currentUser } = useAuth();

    const currentUserId = currentUser?.userId;

    const {
        users,
        summary,
        roles,
        farms,
        pageInfo,
        setPage,
        sortKey,
        setSortKey,
        filters,
        updateFilters,

        initialLoading,
        tableLoading,

        error,

        actionLoading,
        actionError,
        clearActionError,

        createUser,
        updateUser,
        toggleUserStatus,
        reload,
    } = useAdminUsers();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [drawerMode, setDrawerMode] = useState("create");

    const [selectedUser, setSelectedUser] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        user: null,
    });

    function resetDrawerState() {
        setDrawerOpen(false);
        setSelectedUser(null);
        clearActionError();
    }

    function openCreateDrawer() {
        clearActionError();

        setDrawerMode("create");
        setSelectedUser(null);
        setDrawerOpen(true);
    }

    async function openViewDrawer(user) {
        clearActionError();

        setDrawerMode("view");
        setSelectedUser(user);
        setDrawerOpen(true);

        try {
            const detail = await getUserDetail(user.id);

            setSelectedUser(detail);
        } catch (err) {
            console.error("Không thể tải chi tiết người dùng:", err);

            toast.error("Không thể tải thông tin chi tiết người dùng.");
        }
    }

    async function openEditDrawer(user) {
        if (user.id === currentUserId) {
            toast.error(
                "Bạn không thể tự chỉnh sửa tài khoản của bản thân.",
            );

            return;
        }

        clearActionError();

        setDrawerMode("edit");
        setSelectedUser(user);
        setDrawerOpen(true);

        try {
            const detail = await getUserDetail(user.id);

            setSelectedUser(detail);
        } catch (err) {
            console.error("Không thể tải chi tiết người dùng:", err);

            toast.error("Không thể tải thông tin chi tiết người dùng.");
        }
    }

    function closeDrawer() {
        if (actionLoading) return;

        resetDrawerState();
    }

    async function handleDrawerSubmit(payload) {
        const isCreateMode = drawerMode === "create";

        const farmDraft = isCreateMode ? payload.farmDraft : null;
        const userPayload = isCreateMode
            ? (() => {
                  const accountPayload = { ...payload };
                  delete accountPayload.farmDraft;
                  return accountPayload;
              })()
            : payload;

        const result = isCreateMode
            ? await createUser(userPayload)
            : await updateUser(selectedUser.id, payload);

        if (!result) {
            toast.error(
                isCreateMode
                    ? "Không thể tạo người dùng mới."
                    : "Không thể cập nhật người dùng.",
            );

            return;
        }

        if (isCreateMode && farmDraft) {
            try {
                await createFarm({
                    ...farmDraft,
                    ownerId: result.id,
                });
                await reload();
            } catch {
                toast.error(
                    "Tài khoản đã tạo nhưng Farm chưa tạo được. Bạn có thể tạo lại Farm từ màn hình Farm.",
                );
                resetDrawerState();
                return;
            }
        }

        toast.success(
            isCreateMode
                ? farmDraft
                    ? "Đã tạo tài khoản Owner và Farm thành công."
                    : "Tạo người dùng thành công."
                : "Cập nhật người dùng thành công.",
        );

        resetDrawerState();
    }

    async function handleUploadAvatar(file) {
        if (!selectedUser || !file) return;
        if (!file.type || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Ảnh đại diện chỉ hỗ trợ JPEG, PNG hoặc WebP.");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error("Ảnh đại diện không được vượt quá 20MB.");
            return;
        }
        try {
            const detail = await uploadUserAvatar(selectedUser.id, file);
            setSelectedUser(detail);
            await reload();
            toast.success("Đã cập nhật ảnh đại diện.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể tải ảnh đại diện lên.");
        }
    }

    function handleOpenConfirm(user) {
        if (user.id === currentUserId) {
            toast.error(
                "Bạn không thể tự khóa tài khoản của bản thân.",
            );

            return;
        }

        clearActionError();

        setConfirmState({
            open: true,
            user,
        });
    }

    function handleCloseConfirm() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            user: null,
        });

        clearActionError();
    }

    async function handleConfirmToggleStatus() {
        const targetUser = confirmState.user;

        if (!targetUser) return;

        const success = await toggleUserStatus(targetUser);

        if (!success) {
            toast.error(
                `Không thể cập nhật trạng thái tài khoản "${targetUser.fullName}".`,
            );

            return;
        }

        const isLocking = targetUser.status === "ACTIVE";

        toast.success(
            isLocking
                ? `Đã khóa tài khoản "${targetUser.fullName}".`
                : `Đã mở khóa tài khoản "${targetUser.fullName}".`,
        );

        handleCloseConfirm();
    }

    if (initialLoading) {
        return <AdminUsersSkeleton />;
    }

    const confirmUser = confirmState.user;

    const confirmUserActive = confirmUser?.status === "ACTIVE";

    return (
        <>
            <section className="space-y-6">
                <AdminUsersHeader onCreate={openCreateDrawer} />

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1 lg:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={filters.keyword}
                            onChange={(event) => updateFilters({ keyword: event.target.value })}
                            placeholder="Tìm tên, username hoặc email..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>
                    <select value={filters.role} onChange={(event) => updateFilters({ role: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#006948]">
                        <option value="">Tất cả vai trò</option>
                        {roles.map((role) => <option key={role.id} value={role.roleName}>{role.roleName}</option>)}
                    </select>
                    <select value={filters.status} onChange={(event) => updateFilters({ status: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#006948]">
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Đã khóa</option>
                    </select>
                    <select value={filters.farmId} onChange={(event) => updateFilters({ farmId: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#006948]">
                        <option value="">Tất cả nông trại</option>
                        {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName}</option>)}
                    </select>
                </div>

                <ErrorAlert message={error} />

                {actionError && !drawerOpen && !confirmState.open && (
                    <ErrorAlert message={actionError} />
                )}

                <UserStats summary={summary} />

                <UserTable
                    users={users}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    sortKey={sortKey}
                    onSortChange={setSortKey}
                    onView={openViewDrawer}
                    onEdit={openEditDrawer}
                    onToggleStatus={handleOpenConfirm}
                    currentUserId={currentUserId}
                />
            </section>

            <UserDrawer
                open={drawerOpen}
                mode={drawerMode}
                user={selectedUser}
                roles={roles}
                farms={farms}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleDrawerSubmit}
                onUploadAvatar={handleUploadAvatar}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={
                    confirmUserActive
                        ? "Khóa tài khoản"
                        : "Mở khóa tài khoản"
                }
                description={
                    confirmUser
                        ? `Bạn có chắc muốn ${
                              confirmUserActive
                                  ? "khóa"
                                  : "mở khóa"
                          } tài khoản "${
                              confirmUser.fullName
                          }" không?`
                        : ""
                }
                confirmText={
                    confirmUserActive
                        ? "Khóa tài khoản"
                        : "Mở khóa"
                }
                cancelText="Hủy"
                variant={
                    confirmUserActive
                        ? "danger"
                        : "success"
                }
                loading={actionLoading}
                onCancel={handleCloseConfirm}
                onConfirm={handleConfirmToggleStatus}
            />
        </>
    );
}
