import { useState } from "react";
import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { UserStats } from "../../../features/admin/users/components/UserStats";
import { UserTable } from "../../../features/admin/users/components/UserTable";
import { UserDrawer } from "../../../features/admin/users/components/UserDrawer";
import { useAdminUsers } from "../../../features/admin/users/hooks/useAdminUsers";
import { getUserDetail } from "../../../features/admin/users/services/userApi";

function AdminUsersHeader({ onCreate }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Quản lý Người dùng
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Xem thống kê tài khoản, phân vai trò, chỉ định nông trại trực thuộc và tạo mới người dùng
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
            >
                + Thêm Người dùng
            </button>
        </header>
    );
}

function AdminUsersSkeleton() {
    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
                <div className="h-9 w-32 bg-slate-200 animate-pulse rounded" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-xl" />
                ))}
            </div>

            <div className="h-[400px] bg-slate-200 animate-pulse rounded-xl" />
        </section>
    );
}

export function AdminUsersPage() {
    const { toast } = useToast();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        user: null,
    });

    const {
        users,
        summary,
        roles,
        farms,
        pageInfo,
        setPage,
        loading,
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
            console.error("Không thể tải thông tin chi tiết người dùng:", err);
            toast.error("Không thể tải thông tin chi tiết người dùng.");
        }
    }

    async function openEditDrawer(user) {
        clearActionError();
        setDrawerMode("edit");
        setSelectedUser(user);
        setDrawerOpen(true);

        try {
            const detail = await getUserDetail(user.id);
            setSelectedUser(detail);
        } catch (err) {
            console.error("Không thể tải thông tin chi tiết người dùng:", err);
        }
    }

    function closeDrawer() {
        setDrawerOpen(false);
        setSelectedUser(null);
    }

    async function handleDrawerSubmit(payload) {
        if (drawerMode === "create") {
            const success = await createUser(payload);
            if (success) {
                toast.success("Tạo tài khoản người dùng mới thành công!");
                closeDrawer();
            }
        } else {
            const success = await updateUser(selectedUser.id, payload);
            if (success) {
                toast.success("Cập nhật tài khoản người dùng thành công!");
                closeDrawer();
            }
        }
    }

    function handleOpenConfirm(user) {
        setConfirmState({
            open: true,
            user,
        });
    }

    function handleCloseConfirm() {
        setConfirmState({
            open: false,
            user: null,
        });
    }

    async function handleConfirmToggleStatus() {
        const { user } = confirmState;
        if (!user) return;

        const success = await toggleUserStatus(user);
        if (success) {
            const isLocking = user.status === "ACTIVE";
            toast.success(
                isLocking
                    ? `Đã khóa tài khoản "${user.fullName}" thành công!`
                    : `Đã mở khóa tài khoản "${user.fullName}" thành công!`
            );
            handleCloseConfirm();
        }
    }

    if (initialLoading) {
        return <AdminUsersSkeleton />;
    }

    const confirmUserActive = confirmState.user?.status === "ACTIVE";

    return (
        <>
            <section className="space-y-6">
                <AdminUsersHeader onCreate={openCreateDrawer} />

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {actionError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
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
                title={confirmUserActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                description={
                    confirmState.user
                        ? `Bạn có chắc chắn muốn ${
                              confirmUserActive ? "khóa" : "mở khóa"
                          } tài khoản "${confirmState.user.fullName}" không?`
                        : ""
                }
                confirmText={confirmUserActive ? "Khóa tài khoản" : "Mở khóa"}
                cancelText="Hủy"
                variant={confirmUserActive ? "danger" : "success"}
                loading={actionLoading}
                onCancel={handleCloseConfirm}
                onConfirm={handleConfirmToggleStatus}
            />
        </>
    );
}
