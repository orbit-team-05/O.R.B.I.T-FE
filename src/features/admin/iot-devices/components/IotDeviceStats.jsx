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

export function IotDeviceStats({ summary }) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
                label="Tổng thiết bị"
                value={summary.totalDevices}
                description="Trong hệ thống"
            />

            <StatCard
                label="Đang hoạt động"
                value={summary.activeDevices}
                description="Đang vận hành"
                valueClassName="text-[#006948]"
            />

            <StatCard
                label="Chưa gắn farm"
                value={summary.unassignedDevices}
                description="Chờ kích hoạt"
                valueClassName="text-amber-600"
            />

            <StatCard
                label="Đã tắt"
                value={summary.inactiveDevices}
                description="Tạm ngưng"
                valueClassName="text-slate-600"
            />
        </section>
    );
}