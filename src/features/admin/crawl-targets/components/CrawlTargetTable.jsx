import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

function SourceStatusBadge({ active }) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                "text-[11px] font-medium whitespace-nowrap",
                active ? "bg-[#006948] text-white" : "bg-slate-200 text-slate-600",
            ].join(" ")}
        >
            <span className={["h-1.5 w-1.5 rounded-full", active ? "bg-white" : "bg-slate-500"].join(" ")} />
            {active ? "Đang hoạt động" : "Đã tắt"}
        </span>
    );
}

function ActionButton({ children, variant = "default", ...props }) {
    const variantClass = variant === "danger" ? "text-red-600 hover:bg-red-50" : variant === "success" ? "text-[#006948] hover:bg-emerald-50" : "text-slate-700 hover:bg-slate-100";
    return (
        <button
            type="button"
            className={[
                "inline-flex h-8 w-[88px] items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap",
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
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(new Date(value));
}

export function CrawlTargetTable({ targets, pageInfo, loading = false, onPageChange, onEdit, onToggleStatus }) {
    return (
        <section className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Danh sách Cấu hình Crawl</h2>
                <p className="mt-1 text-xs text-slate-600">URL crawl, nguồn, species và bộ lọc dữ liệu giá thị trường</p>
            </header>

            {loading ? <TableLoadingOverlay /> : (
                <div className="w-full">
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead className="bg-slate-50">
                            <tr className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                <th className="w-[6%] py-4 pl-5">ID</th>
                                <th className="w-[18%] px-2 py-4">Target</th>
                                <th className="w-[10%] px-2 py-4">Nguồn</th>
                                <th className="w-[12%] px-2 py-4">Species</th>
                                <th className="w-[10%] px-2 py-4">Khu vực</th>
                                <th className="w-[8%] px-2 py-4">Đơn vị</th>
                                <th className="w-[10%] px-2 py-4">Lần crawl</th>
                                <th className="w-[14%] px-2 py-4">Lỗi</th>
                                <th className="w-[8%] px-2 py-4 text-center">Trạng thái</th>
                                <th className="w-[6%] px-2 py-4 text-center">Sửa</th>
                                <th className="w-[8%] py-4 pl-2 pr-5 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {targets.map((item) => {
                                const active = item.isActive ?? item.active;
                                return (
                                    <tr key={item.id} className="border-t border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50/55">
                                        <td className="px-5 py-4">#{String(item.id).padStart(2, "0")}</td>
                                        <td className="px-2 py-4 font-semibold text-slate-900 truncate" title={item.targetName}>{item.targetName}</td>
                                        <td className="px-2 py-4">
                                            <span className="inline-block rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 whitespace-nowrap">{item.sourceCode}</span>
                                        </td>
                                        <td className="px-2 py-4 truncate" title={item.speciesName}>{item.speciesName}</td>
                                        <td className="px-2 py-4 truncate">{item.defaultLocation || "-"}</td>
                                        <td className="px-2 py-4 truncate">{item.defaultPriceUnit || "-"}</td>
                                        <td className="px-2 py-4 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(item.lastCrawledAt)}</td>
                                        <td className="px-2 py-4 truncate" title={item.lastError}>
                                            {item.lastError ? <span className="rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">{item.lastError}</span> : <span className="text-slate-400">-</span>}
                                        </td>
                                        <td className="px-2 py-4 text-center whitespace-nowrap"><SourceStatusBadge active={active} /></td>
                                        <td className="px-2 py-4 text-center">
                                            <button onClick={() => onEdit?.(item)} className="text-slate-500 hover:text-slate-900 text-xs font-medium">Sửa</button>
                                        </td>
                                        <td className="py-4 pl-2 pr-5 text-right whitespace-nowrap">
                                            <ActionButton variant={active ? "danger" : "success"} onClick={() => onToggleStatus?.(item)}>
                                                {active ? "Tắt" : "Bật lại"}
                                            </ActionButton>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">Tổng {pageInfo.totalElements} target</p>
                <div className="flex items-center gap-2">
                    <button type="button" disabled={pageInfo.first} onClick={() => onPageChange(pageInfo.number - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                    <span className="text-xs text-slate-600">Trang {pageInfo.number + 1} / {Math.max(pageInfo.totalPages, 1)}</span>
                    <button type="button" disabled={pageInfo.last} onClick={() => onPageChange(pageInfo.number + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
                </div>
            </footer>
        </section>
    );
}