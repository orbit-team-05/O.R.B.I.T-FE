export function SpeciesStatusBadge({ active }) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                "text-[11px] font-medium",
                active
                    ? "bg-[#008b61] text-white"
                    : "bg-slate-200 text-slate-600",
            ].join(" ")}
        >
      <span
          className={[
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-white" : "bg-slate-500",
          ].join(" ")}
      />

            {active ? "Đang hoạt động" : "Đã tắt"}
    </span>
    );
}