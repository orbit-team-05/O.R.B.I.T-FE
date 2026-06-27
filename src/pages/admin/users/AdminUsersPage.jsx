import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { UserStats } from "../../../features/admin/users/components/UserStats";
import { UserTable } from "../../../features/admin/users/components/UserTable";
import { UserDrawer } from "../../../features/admin/users/components/UserDrawer";
import { useAdminUsers } from "../../../features/admin/users/hooks/useAdminUsers";
import { getUserDetail } from "../../../features/admin/users/services/userApi";
import { useAuth } from "../../../features/auth/context/AuthContext";

function AdminUsersHeader({ onCreate }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Quản lý Người dùng
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
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />

                <div className="h-9 w-36 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl bg-slate-200"
                    />
                ))}
            </div>

            <div className="h-[420px] animate-pulse rounded-xl bg-slate-200" />
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

        initialLoading,
        tableLoading,

        error,

        actionLoading,
        actionError,
        clearActionError,

        createUser,
        updateUser,
        toggleUserStatus,
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

        const success = isCreateMode
            ? await createUser(payload)
            : await updateUser(selectedUser.id, payload);

        if (!success) {
            toast.error(
                isCreateMode
                    ? "Không thể tạo người dùng mới."
                    : "Không thể cập nhật người dùng.",
            );

            return;
        }

        toast.success(
            isCreateMode
                ? "Tạo người dùng thành công."
                : "Cập nhật người dùng thành công.",
        );

        resetDrawerState();
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