const STATUS_MAPPING = {
    PLANNING: {
        label: "Lên kế hoạch",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        dotClass: "bg-slate-400",
    },
    ACTIVE: {
        label: "Đang nuôi",
        badgeClass: "bg-emerald-100 text-[#006948] border-emerald-200",
        dotClass: "bg-[#006948]",
    },
    HARVESTING: {
        label: "Thu hoạch",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
    },
    COMPLETED: {
        label: "Hoàn thành",
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
        dotClass: "bg-blue-500",
    },
};

export function SeasonStatusBadge({ status }) {
    const config = STATUS_MAPPING[status] || {
        label: status || "Không rõ",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        dotClass: "bg-slate-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badgeClass}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
        </span>
    );
}
