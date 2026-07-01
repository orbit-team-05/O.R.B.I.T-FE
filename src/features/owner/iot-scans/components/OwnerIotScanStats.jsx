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

export function OwnerIotScanStats({ summary }) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
                label="Tổng scan"
                value={summary.totalScans}
                description="Trong farm"
            />

            <StatCard
                label="Thành công"
                value={summary.successScans}
                description="Đọc được QR"
                tone="success"
            />

            <StatCard
                label="Cần kiểm tra"
                value={summary.needReviewScans}
                description="QR lỗi / cần keypad"
                tone="danger"
            />
        </section>
    );
}
