function StatCard({ label, value, description, valueClassName = "" }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {label}
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
                <strong className={`text-3xl font-semibold leading-none ${valueClassName}`}>
                    {value}
                </strong>

                <span className="pb-0.5 text-xs text-slate-600">{description}</span>
            </div>
        </article>
    );
}

export function AdminDashboardStats({ stats }) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
                label="Tổng Species"
                value={stats.totalSpecies}
                description="Dữ liệu nền"
            />

            <StatCard
                label="Nguồn dữ liệu"
                value={stats.totalSources}
                description="Nguồn crawl"
                valueClassName="text-[#006948]"
            />

            <StatCard
                label="Target Crawl"
                value={stats.totalTargets}
                description="Đang cấu hình"
            />

            <StatCard
                label="Cần kiểm tra"
                value={stats.needReview}
                description="Lỗi / rủi ro"
                valueClassName={stats.needReview > 0 ? "text-red-600" : "text-[#006948]"}
            />
        </section>
    );
}