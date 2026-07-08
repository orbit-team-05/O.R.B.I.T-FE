import {
    CheckCircle2,
    DollarSign,
    Sprout,
    TrendingUp,
} from "lucide-react";

function formatCurrency(value) {
    if (value == null) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value) {
    if (value == null) return "0";

    return Number(value).toLocaleString("vi-VN");
}

export function SeasonDashboardStats({
    dashboard,
}) {
    const stats = [
        {
            key: "activeSeasons",
            label: "Mùa vụ đang nuôi",
            formattedValue: formatNumber(
                dashboard?.activeSeasons ?? 0,
            ),
            icon: Sprout,
            colorClass:
                "text-[#006948] bg-emerald-50 border-emerald-100",
        },
        {
            key: "totalInvestment",
            label: "Tổng chi phí đầu tư",
            formattedValue: formatCurrency(
                dashboard?.totalInvestment ?? 0,
            ),
            icon: DollarSign,
            colorClass:
                "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
            key: "totalExpectedRevenue",
            label: "Doanh thu dự kiến",
            formattedValue: formatCurrency(
                dashboard?.totalExpectedRevenue ?? 0,
            ),
            icon: TrendingUp,
            colorClass:
                "text-rose-600 bg-rose-50 border-rose-100",
        },
        {
            key: "completedSeasons",
            label: "Mùa vụ hoàn thành",
            formattedValue: formatNumber(
                dashboard?.completedSeasons ?? 0,
            ),
            icon: CheckCircle2,
            colorClass:
                "text-indigo-600 bg-indigo-50 border-indigo-100",
        },
    ];

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const IconComponent = stat.icon;

                return (
                    <div
                        key={stat.key}
                        className="flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                    >
                        <div
                            className={`shrink-0 rounded-xl border p-3 ${stat.colorClass}`}
                        >
                            <IconComponent size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p 
                                className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500"
                                title={stat.label}
                            >
                                {stat.label}
                            </p>

                            {/* Đã bỏ truncate và title, chuyển kích thước chữ thành text-base sm:text-lg lg:text-xl để số tự động thu gọn vừa vặn */}
                            <p 
                                className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg lg:text-xl"
                            >
                                {stat.formattedValue}
                            </p>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}