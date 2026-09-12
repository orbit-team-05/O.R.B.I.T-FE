export function FarmStatusBadge({ active }) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                "text-[11px] font-medium",
                active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600",
            ].join(" ")}
        >
            <span aria-hidden="true" className={["h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-slate-500"].join(" ")} />
            {active ? "Đang hoạt động" : "Ngừng hoạt động"}
        </span>
    );
}
