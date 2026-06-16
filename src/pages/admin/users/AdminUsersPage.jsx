import { useState } from "react";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { UserStats } from "../../../features/admin/users/components/UserStats";
import { UserTable } from "../../../features/admin/users/components/UserTable";
import { CreateUserDrawer } from "../../../features/admin/users/components/CreateUserDrawer";
import { useAdminUsers } from "../../../features/admin/users/hooks/useAdminUsers";

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
    } = useAdminUsers();

    function openCreateDrawer() {
        clearActionError();
        setDrawerOpen(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
    }

    async function handleCreateUser(payload) {
        const success = await createUser(payload);
        if (success) {
            toast.success("Tạo tài khoản người dùng mới thành công!");
            closeDrawer();
        }
    }

    if (initialLoading) {
        return <AdminUsersSkeleton />;
    }

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
                />
            </section>

            <CreateUserDrawer
                open={drawerOpen}
                roles={roles}
                farms={farms}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleCreateUser}
            />
        </>
    );
}
