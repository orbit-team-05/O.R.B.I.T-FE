function SourceStatusBadge({ active }) {
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

export function MarketSourceTable({
                                      sources,
                                      pageInfo,
                                      onPageChange,
                                      onEdit,
                                      onToggleStatus,
                                  }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Nguồn dữ liệu
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Nguồn website dùng để thu thập giá thị trường
                </p>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Mã nguồn</th>
                        <th className="px-5 py-3">Tên nguồn</th>
                        <th className="px-5 py-3">Base URL</th>
                        <th className="px-5 py-3">Nhóm</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="w-[150px] px-5 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {sources.map((item) => {
                        const active = item.isActive ?? item.active;

                        return (
                            <tr
                                key={item.id}
                                className="border-t border-slate-200 text-sm text-slate-700"
                            >
                                <td className="px-5 py-4">
                                    #{String(item.id).padStart(2, "0")}
                                </td>

                                <td className="px-5 py-4 font-semibold text-slate-900">
                                    {item.sourceCode}
                                </td>

                                <td className="px-5 py-4">{item.sourceName}</td>

                                <td className="px-5 py-4">
                                    {item.baseUrl ? (
                                        <a
                                            href={item.baseUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-medium text-blue-600 hover:underline"
                                        >
                                            {item.baseUrl}
                                        </a>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                      {item.sourceGroup}
                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <SourceStatusBadge active={active} />
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

                    {sources.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có nguồn dữ liệu nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">
                    Tổng {pageInfo.totalElements} nguồn
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