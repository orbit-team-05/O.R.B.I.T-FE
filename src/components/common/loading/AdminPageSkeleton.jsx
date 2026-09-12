function SkeletonBlock({ className }) {
    return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

const VARIANT_CONFIG = {
    dashboard: {
        stats: 3,
        content: "dashboard",
    },
    table: {
        stats: 4,
        content: "table",
    },
    farm: {
        stats: 2,
        content: "table",
    },
    devices: {
        stats: 4,
        content: "cards",
    },
    reports: {
        stats: 4,
        content: "reports",
    },
    settings: {
        stats: 0,
        content: "settings",
    },
};

export function AdminPageSkeleton({ variant = "table" }) {
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.table;

    return (
        <section className="space-y-5" aria-busy="true" aria-label="Đang tải dữ liệu">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                    <SkeletonBlock className="h-8 w-56" />
                    <SkeletonBlock className="h-4 w-[min(520px,80vw)]" />
                </div>
                <SkeletonBlock className="h-10 w-28" />
            </header>

            {config.stats > 0 && (
                <section className={`grid grid-cols-1 gap-4 ${config.stats === 2 ? "md:grid-cols-2" : config.stats === 3 ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                    {Array.from({ length: config.stats }, (_, index) => (
                        <SkeletonBlock key={index} className="h-[86px]" />
                    ))}
                </section>
            )}

            {config.content === "dashboard" && (
                <>
                    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <SkeletonBlock className="h-[320px]" />
                        <SkeletonBlock className="h-[320px]" />
                    </section>
                    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <SkeletonBlock className="h-[240px]" />
                        <SkeletonBlock className="h-[240px]" />
                    </section>
                </>
            )}

            {config.content === "cards" && (
                <>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((item) => <SkeletonBlock key={item} className="h-10 w-36" />)}
                    </div>
                    <SkeletonBlock className="h-[480px]" />
                </>
            )}

            {config.content === "table" && <SkeletonBlock className="h-[420px]" />}

            {config.content === "reports" && (
                <>
                    <SkeletonBlock className="h-12 w-full" />
                    <SkeletonBlock className="h-24 w-full" />
                    <SkeletonBlock className="h-[420px] w-full" />
                </>
            )}

            {config.content === "settings" && (
                <section className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
                    <SkeletonBlock className="h-32 md:h-40" />
                    <SkeletonBlock className="h-[520px]" />
                </section>
            )}
        </section>
    );
}
