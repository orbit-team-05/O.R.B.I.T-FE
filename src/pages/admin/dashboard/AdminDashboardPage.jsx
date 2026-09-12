import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import { AdminDashboardInfoPanel } from "../../../features/admin/dashboard/components/AdminDashboardInfoPanel";
import {
    AdminDashboardStatusChart,
    AdminDashboardTransactionChart,
} from "../../../features/admin/dashboard/components/AdminDashboardCharts";
import { AdminDashboardStats } from "../../../features/admin/dashboard/components/AdminDashboardStats";
import { AdminSystemAlerts } from "../../../features/admin/dashboard/components/AdminSystemAlerts";
import { useAdminDashboard } from "../../../features/admin/dashboard/hooks/useAdminDashboard";
import { formatDateTime } from "../../../utils/formatUtils";
import { RefreshCw } from "lucide-react";

function AdminDashboardHeader({ generatedAt, onReload, refreshing }) {
    return (
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Tổng quan vận hành
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Theo dõi sức khỏe User, Farm, thiết bị cân và hoạt động giao dịch.
                    {generatedAt && (
                        <span className="ml-2 text-xs text-slate-500">
                            Cập nhật: {formatDateTime(generatedAt)}
                        </span>
                    )}
                </p>
            </div>

            <button
                type="button"
                onClick={onReload}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Làm mới
            </button>
        </header>
    );
}

function AdminDashboardSkeleton() {
    return <AdminPageSkeleton variant="dashboard" />;
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
        refreshing,
    } = useAdminDashboard();

    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminDashboardHeader onReload={reload} refreshing={refreshing} />

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
                <AdminDashboardHeader onReload={reload} refreshing={refreshing} />
                <EmptyState onReload={reload} />
            </section>
        );
    }

    return (
        <section className="space-y-5">
            <AdminDashboardHeader
                generatedAt={dashboard.generatedAt}
                onReload={reload}
                refreshing={refreshing}
            />

            <AdminDashboardStats
                overview={dashboard?.overview || {}}
                iotOverview={dashboard?.iotOverview || {}}
            />

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <AdminDashboardStatusChart
                    statusBreakdown={dashboard?.statusBreakdown || []}
                />
                <AdminDashboardTransactionChart
                    transactionTrend={dashboard?.transactionTrend || []}
                />
            </section>

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <AdminDashboardInfoPanel
                    pendingActions={dashboard?.pendingActions || {}}
                />

                <AdminSystemAlerts
                    alerts={dashboard?.alerts || []}
                />
            </section>
        </section>
    );
}
