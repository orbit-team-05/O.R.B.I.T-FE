import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

function SourceStatusBadge({ active }) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                "text-[11px] font-medium whitespace-nowrap",
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
                "inline-flex h-8 items-center justify-center rounded-lg px-3",
                "text-xs font-medium transition-colors duration-150 whitespace-nowrap",
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
    loading = false,
    onEdit,
    onToggleStatus,
}) {
    return (
        <section className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Danh sách Nguồn dữ liệu</h2>
                <p className="mt-1 text-xs text-slate-600">Nguồn website dùng để thu thập giá thị trường</p>
            </header>

            {loading ? <TableLoadingOverlay /> : (
                <div className="w-full">
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead className="bg-slate-50">
                            {/* Phân bổ lại tỉ lệ % các cột để cân đối và không rớt dòng */}
                            <tr className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                <th className="w-[8%] py-4 pl-5">ID</th>
                                <th className="w-[12%] px-2 py-4">Mã nguồn</th>
                                <th className="w-[18%] px-2 py-4">Tên nguồn</th>
                                <th className="w-[22%] px-2 py-4">Base URL</th>
                                <th className="w-[15%] px-2 py-4">Nhóm</th>
                                <th className="w-[13%] px-2 py-4">Trạng thái</th>
                                <th className="w-[12%] px-2 py-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map((item) => {
                                const active = item.isActive ?? item.active;
                                return (
                                    <tr key={item.id} className="border-t border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50/55">
                                        <td className="px-5 py-4">#{String(item.id).padStart(2, "0")}</td>
                                        <td className="truncate px-2 py-4 font-semibold text-slate-900" title={item.sourceCode}>{item.sourceCode}</td>
                                        <td className="truncate px-2 py-4" title={item.sourceName}>{item.sourceName}</td>
                                        <td className="truncate px-2 py-4">
                                            <a href={item.baseUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline" title={item.baseUrl}>
                                                {item.baseUrl}
                                            </a>
                                        </td>
                                        <td className="px-2 py-4">
                                            <span className="inline-block max-w-full truncate rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600" title={item.sourceGroup}>
                                                {item.sourceGroup}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4"><SourceStatusBadge active={active} /></td>
                                        <td className="px-2 py-4 whitespace-nowrap text-center">
                                            <div className="inline-flex items-center justify-center gap-1">
                                                <ActionButton onClick={() => onEdit?.(item)}>Sửa</ActionButton>
                                                <ActionButton variant={active ? "danger" : "success"} onClick={() => onToggleStatus?.(item)}>
                                                    {active ? "Tắt" : "Bật lại"}
                                                </ActionButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">Tổng {pageInfo.totalElements} nguồn</p>
                <div className="flex items-center gap-2">
                    <button type="button" disabled={pageInfo.first} onClick={() => onPageChange(pageInfo.number - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                    <span className="text-xs text-slate-600">Trang {pageInfo.number + 1} / {Math.max(pageInfo.totalPages, 1)}</span>
                    <button type="button" disabled={pageInfo.last} onClick={() => onPageChange(pageInfo.number + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
                </div>
            </footer>
        </section>
    );
}