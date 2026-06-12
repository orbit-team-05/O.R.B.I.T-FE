function StatCard({ label, value, description, tone = "default" }) {
    const valueClass =
        tone === "success"
            ? "text-[#006948]"
            : tone === "danger"
                ? "text-red-600"
                : "text-slate-900";

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase text-slate-500">
                {label}
            </p>

            <div className="mt-3 flex items-end gap-3">
                <p className={["text-3xl font-semibold", valueClass].join(" ")}>
                    {value}
                </p>

                <p className="pb-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

export function OwnerIotDeviceStats({ summary }) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
                label="Tổng thiết bị"
                value={summary.totalDevices}
                description="Trong farm"
            />

            <StatCard
                label="Đang active"
                value={summary.activeDevices}
                description="Đang vận hành"
                tone="success"
            />

            <StatCard
                label="Đã tắt"
                value={summary.inactiveDevices}
                description="Tạm ngưng"
            />

            <StatCard
                label="Mất kết nối"
                value={summary.lostDevices}
                description="Cần kiểm tra"
                tone="danger"
            />
        </section>
    );
}