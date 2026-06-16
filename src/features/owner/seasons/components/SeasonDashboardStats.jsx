import { Calendar, CheckCircle2, DollarSign, Sprout, TrendingUp } from "lucide-react";

function formatCurrency(value) {
    if (value == null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
}

function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
}

export function SeasonDashboardStats({ dashboard }) {
    const stats = [
        {
            key: "activeSeasons",
            label: "Mùa vụ đang nuôi",
            value: dashboard?.activeSeasons ?? 0,
            formattedValue: formatNumber(dashboard?.activeSeasons ?? 0),
            icon: Sprout,
            colorClass: "text-[#006948] bg-emerald-50 border-emerald-100",
        },
        {
            key: "totalInvestment",
            label: "Tổng chi phí đầu tư",
            value: dashboard?.totalInvestment ?? 0,
            formattedValue: formatCurrency(dashboard?.totalInvestment ?? 0),
            icon: DollarSign,
            colorClass: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
            key: "expectedYield",
            label: "Sản lượng dự kiến",
            value: dashboard?.expectedYieldKg ?? 0,
            formattedValue: `${formatNumber(dashboard?.expectedYieldKg ?? 0)} kg`,
            icon: Calendar,
            colorClass: "text-amber-600 bg-amber-50 border-amber-100",
        },
        {
            key: "totalExpectedRevenue",
            label: "Doanh thu dự kiến",
            value: dashboard?.totalExpectedRevenue ?? 0,
            formattedValue: formatCurrency(dashboard?.totalExpectedRevenue ?? 0),
            icon: TrendingUp,
            colorClass: "text-rose-600 bg-rose-50 border-rose-100",
        },
        {
            key: "completedSeasons",
            label: "Mùa vụ hoàn thành",
            value: dashboard?.completedSeasons ?? 0,
            formattedValue: formatNumber(dashboard?.completedSeasons ?? 0),
            icon: CheckCircle2,
            colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                    <div
                        key={stat.key}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className={`rounded-xl border p-3 ${stat.colorClass}`}>
                            <IconComponent size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {stat.label}
                            </p>
                            <p className="mt-1.5 text-2xl font-bold text-slate-900">
                                {stat.formattedValue}
                            </p>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

