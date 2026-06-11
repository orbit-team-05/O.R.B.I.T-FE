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

                <span className="pb-0.5 text-xs text-slate-600">
          {description}
        </span>
            </div>
        </article>
    );
}

export function SpeciesStats({ summary }) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
                label="Tổng Species"
                value={summary.totalSpecies}
                description="Trong hệ thống"
            />

            <StatCard
                label="Đang hoạt động"
                value={summary.activeSpecies}
                description="Có thể sử dụng"
                valueClassName="text-[#006948]"
            />

            <StatCard
                label="Đã tắt"
                value={summary.inactiveSpecies}
                description="Không sử dụng"
                valueClassName="text-slate-600"
            />
        </section>
    );
}