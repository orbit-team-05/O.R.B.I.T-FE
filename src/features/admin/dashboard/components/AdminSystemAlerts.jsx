const ALERT_CLASSES = {
    DANGER: "border-red-100 bg-red-50 text-red-700",
    WARNING: "border-amber-100 bg-amber-50 text-amber-700",
    INFO: "border-blue-100 bg-blue-50 text-blue-700",
    SUCCESS: "border-emerald-100 bg-emerald-50 text-[#006948]",
};

const ALERT_DOT_CLASSES = {
    DANGER: "bg-red-500",
    WARNING: "bg-amber-500",
    INFO: "bg-blue-500",
    SUCCESS: "bg-emerald-500",
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
                        key={alert.code}
                        className={[
                            "rounded-xl border px-4 py-3",
                            ALERT_CLASSES[alert.severity] ?? ALERT_CLASSES.INFO,
                        ].join(" ")}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="flex items-center gap-2 text-sm font-semibold">
                                <span
                                    aria-hidden="true"
                                    className={`h-2 w-2 shrink-0 rounded-full ${ALERT_DOT_CLASSES[alert.severity] ?? "bg-slate-400"}`}
                                />
                                {alert.title}
                            </p>
                            {alert.count > 0 && (
                                <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium">
                                    {alert.count}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-xs opacity-80">{alert.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
