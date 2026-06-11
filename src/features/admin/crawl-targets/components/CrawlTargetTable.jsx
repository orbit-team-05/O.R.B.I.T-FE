function StatusBadge({ active }) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                "text-[11px] font-medium",
                active ? "bg-[#006948] text-white" : "bg-slate-200 text-slate-600",
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

function ActionButton({ children, variant = "default", ...props }) {
    const variantClass =
        variant === "danger"
            ? "text-red-600 hover:bg-red-50"
            : variant === "success"
                ? "text-[#006948] hover:bg-emerald-50"
                : "text-slate-700 hover:bg-slate-100";

    return (
        <button
            type="button"
            className={[
                "inline-flex h-8 min-w-[58px] items-center justify-center rounded-lg px-3",
                "text-xs font-medium transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006948]/30",
                variantClass,
            ].join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}

function formatDateTime(value) {
    if (!value) return "Chưa crawl";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function CrawlTargetTable({
                                     targets,
                                     pageInfo,
                                     onPageChange,
                                     onEdit,
                                     onToggleStatus,
                                 }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Danh sách Cấu hình Crawl
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                        URL crawl, nguồn, species và bộ lọc dữ liệu giá thị trường
                    </p>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Target</th>
                        <th className="px-5 py-3">Nguồn</th>
                        <th className="px-5 py-3">Species</th>
                        <th className="px-5 py-3">Khu vực</th>
                        <th className="px-5 py-3">Đơn vị</th>
                        <th className="px-5 py-3">Lần crawl</th>
                        <th className="px-5 py-3">Lỗi</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="w-[150px] px-5 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {targets.map((item) => {
                        const active = item.isActive ?? item.active;

                        return (
                            <tr
                                key={item.id}
                                className="border-t border-slate-200 text-sm text-slate-700"
                            >
                                <td className="px-5 py-4">
                                    #{String(item.id).padStart(2, "0")}
                                </td>

                                <td className="max-w-[180px] px-5 py-4 font-medium text-slate-900">
                                    <div className="line-clamp-2">{item.targetName}</div>
                                </td>

                                <td className="px-5 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                      {item.sourceCode}
                    </span>
                                </td>

                                <td className="max-w-[160px] px-5 py-4">
                                    <div className="line-clamp-2">{item.speciesName}</div>
                                </td>

                                <td className="px-5 py-4">
                                    {item.defaultLocation || "-"}
                                </td>

                                <td className="px-5 py-4">
                                    {item.defaultPriceUnit || "-"}
                                </td>

                                <td className="px-5 py-4">
                                    {formatDateTime(item.lastCrawledAt)}
                                </td>

                                <td className="px-5 py-4">
                                    {item.lastError ? (
                                        <span className="rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                        {item.lastError}
                      </span>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <StatusBadge active={active} />
                                </td>

                                <td className="w-[150px] px-5 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <ActionButton onClick={() => onEdit?.(item)}>
                                            Sửa
                                        </ActionButton>

                                        <ActionButton
                                            variant={active ? "danger" : "success"}
                                            onClick={() => onToggleStatus?.(item)}
                                        >
                                            {active ? "Tắt" : "Bật lại"}
                                        </ActionButton>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    {targets.length === 0 && (
                        <tr>
                            <td
                                colSpan={10}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có cấu hình crawl nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">
                    Tổng {pageInfo.totalElements} target
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={pageInfo.first}
                        onClick={() => onPageChange(pageInfo.number - 1)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Trước
                    </button>

                    <span className="text-xs text-slate-600">
            Trang {pageInfo.number + 1} / {Math.max(pageInfo.totalPages, 1)}
          </span>

                    <button
                        type="button"
                        disabled={pageInfo.last}
                        onClick={() => onPageChange(pageInfo.number + 1)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Sau
                    </button>
                </div>
            </footer>
        </section>
    );
}