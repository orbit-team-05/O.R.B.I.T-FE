import { AdminDashboardInfoPanel } from "../../../features/admin/dashboard/components/AdminDashboardInfoPanel";
import { AdminDashboardStats } from "../../../features/admin/dashboard/components/AdminDashboardStats";
import { AdminSystemAlerts } from "../../../features/admin/dashboard/components/AdminSystemAlerts";
import { RecentCrawlTargetsTable } from "../../../features/admin/dashboard/components/RecentCrawlTargetsTable";
import { useAdminDashboard } from "../../../features/admin/dashboard/hooks/useAdminDashboard";

function AdminDashboardHeader({ onReload }) {
    return (
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Tổng quan Admin
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Theo dõi dữ liệu nền, crawler, thiết bị IoT và trạng thái vận hành hệ thống.
                </p>
            </div>

            <button
                type="button"
                onClick={onReload}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
                Làm mới
            </button>
        </header>
    );
}

function AdminDashboardSkeleton() {
    return (
        <section className="space-y-5">
            <AdminDashboardHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[96px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-white" />

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-[240px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                <div className="h-[240px] animate-pulse rounded-xl border border-slate-200 bg-white" />
            </section>
        </section>
    );
}

function EmptyState({ onReload }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
                Không có dữ liệu dashboard để hiển thị.
            </p>

            <button
                type="button"
                onClick={onReload}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#006948] px-4 text-sm font-medium text-white hover:bg-[#00583d]"
            >
                Tải lại dữ liệu
            </button>
        </div>
    );
}

export function AdminDashboardPage() {
    const {
        dashboard,
        loading,
        error,
        reload,
    } = useAdminDashboard();

    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminDashboardHeader onReload={reload} />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {error || "Không thể tải dữ liệu dashboard."}
                    </p>

                    <button
                        type="button"
                        onClick={reload}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    if (!dashboard) {
        return (
            <section className="space-y-5">
                <AdminDashboardHeader onReload={reload} />
                <EmptyState onReload={reload} />
            </section>
        );
    }

    return (
        <section className="space-y-5">
            <AdminDashboardHeader onReload={reload} />

            <AdminDashboardStats
                stats={dashboard?.stats || {}}
            />

            <RecentCrawlTargetsTable
                targets={dashboard?.recentCrawlTargets || []}
            />

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <AdminDashboardInfoPanel
                    priceSummary={dashboard?.priceSummary || {}}
                    deviceSummary={dashboard?.deviceSummary || {}}
                />

                <AdminSystemAlerts
                    alerts={dashboard?.alerts || []}
                />
            </section>
        </section>
    );
}