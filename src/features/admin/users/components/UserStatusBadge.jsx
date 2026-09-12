const STATUS_PRESENTATION = {
    ACTIVE: {
        fallbackLabel: "Đang hoạt động",
        className: "bg-emerald-100 text-emerald-800",
        dotClassName: "bg-emerald-500",
    },
    INACTIVE: {
        fallbackLabel: "Ngừng hoạt động",
        className: "bg-slate-200 text-slate-600",
        dotClassName: "bg-slate-500",
    },
    LOCKED: {
        fallbackLabel: "Đã khóa",
        className: "bg-red-100 text-red-700",
        dotClassName: "bg-red-500",
    },
    PENDING: {
        fallbackLabel: "Đang chờ",
        className: "bg-amber-100 text-amber-800",
        dotClassName: "bg-amber-500",
    },
    EXPIRED: {
        fallbackLabel: "Đã hết hạn",
        className: "bg-orange-100 text-orange-800",
        dotClassName: "bg-orange-500",
    },
};

export function UserStatusBadge({ status }) {
    const statusCode = typeof status === "object" ? status?.code : status;
    const statusConfig = STATUS_PRESENTATION[statusCode] ?? {
        fallbackLabel: "Không xác định",
        className: "bg-slate-100 text-slate-600",
        dotClassName: "bg-slate-400",
    };
    const statusLabel =
        typeof status === "object" && status?.label
            ? status.label
            : statusConfig.fallbackLabel;

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                "text-[11px] font-medium",
                statusConfig.className,
            ].join(" ")}
        >
            <span
                aria-hidden="true"
                className={["h-1.5 w-1.5 rounded-full", statusConfig.dotClassName].join(" ")}
            />
            {statusLabel}
        </span>
    );
}
