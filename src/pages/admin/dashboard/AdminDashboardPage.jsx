import { AdminDashboardInfoPanel } from "../../../features/admin/dashboard/components/AdminDashboardInfoPanel";
import { AdminDashboardStats } from "../../../features/admin/dashboard/components/AdminDashboardStats";
import { AdminSystemAlerts } from "../../../features/admin/dashboard/components/AdminSystemAlerts";
import { RecentCrawlTargetsTable } from "../../../features/admin/dashboard/components/RecentCrawlTargetsTable";
import { useAdminDashboard } from "../../../features/admin/dashboard/hooks/useAdminDashboard";

function AdminDashboardHeader() {
    return (
        <header>
            <h1 className="text-2xl font-semibold text-slate-900">
                Tổng quan Admin
            </h1>

            <p className="mt-1 text-sm text-slate-600">
                Theo dõi dữ liệu nền, crawler, thiết bị IoT và trạng thái vận hành hệ thống
            </p>
        </header>
    );
}

function AdminDashboardSkeleton() {
    return (
        <section className="space-y-5">
            <AdminDashboardHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[320px] animate-pulse rounded-xl border border-slate-200 bg-white" />

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-[220px] animate-pulse rounded-xl border border-slate-200 bg-white" />
                <div className="h-[220px] animate-pulse rounded-xl border border-slate-200 bg-white" />
            </section>
        </section>
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
                <AdminDashboardHeader />

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

    return (
        <section className="space-y-5">
            <AdminDashboardHeader />

            <AdminDashboardStats stats={dashboard.stats} />

            <RecentCrawlTargetsTable targets={dashboard.recentCrawlTargets} />

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <AdminDashboardInfoPanel
                    priceSummary={dashboard.priceSummary}
                    deviceSummary={dashboard.deviceSummary}
                />

                <AdminSystemAlerts alerts={dashboard.alerts} />
            </section>
        </section>
    );
}