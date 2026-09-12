
import { formatCurrency, formatNumber } from "../../../../utils/formatUtils";

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
        },
        {
            key: "completedSeasons",
            label: "Mùa vụ hoàn thành",
            formattedValue: formatNumber(
                dashboard?.completedSeasons ?? 0,
            ),
        },
        {
            key: "totalInvestment",
            label: "Tổng chi phí",
            formattedValue: formatCurrency(
                dashboard?.totalInvestment ?? 0,
            ),
        },
        {
            key: "totalExpectedRevenue",
            label: "Doanh thu",
            formattedValue: formatCurrency(
                dashboard?.totalExpectedRevenue ?? 0,
            ),
        },
    ];

        return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <article
                    key={stat.key}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {stat.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {stat.formattedValue}
                    </p>
                </article>
            ))}
        </section>
    );
}