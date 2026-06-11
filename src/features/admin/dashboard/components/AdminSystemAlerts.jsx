const ALERT_CLASSES = {
    danger: "border-red-100 bg-red-50 text-red-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    info: "border-blue-100 bg-blue-50 text-blue-700",
    success: "border-emerald-100 bg-emerald-50 text-[#006948]",
};

export function AdminSystemAlerts({ alerts }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Cảnh báo hệ thống
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Các vấn đề cần Admin theo dõi
                </p>
            </header>

            <div className="space-y-3 p-5">
                {alerts.map((alert) => (
                    <article
                        key={alert.id}
                        className={[
                            "rounded-xl border px-4 py-3",
                            ALERT_CLASSES[alert.type] ?? ALERT_CLASSES.info,
                        ].join(" ")}
                    >
                        <p className="text-sm font-semibold">{alert.title}</p>
                        <p className="mt-1 text-xs opacity-80">{alert.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}