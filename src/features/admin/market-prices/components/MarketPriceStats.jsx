function StatCard({ label, value, description, valueClassName = "" }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {label}
            </p>

            <div className="mt-2 flex items-end gap-2">
                <strong className={`text-3xl font-semibold leading-none ${valueClassName}`}>
                    {value}
                </strong>

                <span className="pb-0.5 text-xs text-slate-600">{description}</span>
            </div>
        </article>
    );
}

function formatLatestTime(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(value));
}

export function MarketPriceStats({ summary }) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
                label="Dòng giá"
                value={summary.totalPrices}
                description="Trong hệ thống"
            />

            <StatCard
                label="Nguồn crawl"
                value={summary.totalSources}
                description="Nguồn dữ liệu"
                valueClassName="text-[#006948]"
            />

            <StatCard
                label="Species"
                value={summary.totalSpecies}
                description="Đã map"
            />

            <StatCard
                label="Mới nhất"
                value={formatLatestTime(summary.latestUpdatedAt)}
                description="Cập nhật cuối"
            />
        </section>
    );
}