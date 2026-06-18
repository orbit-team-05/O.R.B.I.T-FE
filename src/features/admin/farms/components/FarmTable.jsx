import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

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

function formatDate(dateString) {
    if (!dateString) return "—";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

export function FarmTable({
                              farms,
                              pageInfo,
                              onPageChange,
                              loading = false,
                              onEdit,
                              onDelete,
                          }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Nông trại
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Quản lý thông tin nông trại, chủ sở hữu và nhân viên
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Tên Farm</th>
                        <th className="px-5 py-3">Địa chỉ</th>
                        <th className="px-5 py-3">Chủ sở hữu</th>
                        <th className="px-5 py-3">Nhân viên</th>
                        <th className="px-5 py-3">Ngày tạo</th>
                        <th className="w-[150px] px-5 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {farms.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-slate-200 text-sm text-slate-700"
                        >
                            <td className="px-5 py-4">
                                #{String(item.id).padStart(2, "0")}
                            </td>

                            <td className="px-5 py-4 font-medium text-slate-900">
                                {item.farmName}
                            </td>

                            <td className="max-w-[200px] truncate px-5 py-4" title={item.location}>
                                {item.location}
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">
                                        {item.ownerName ?? "—"}
                                    </span>
                                    {item.ownerEmail && (
                                        <span className="text-[11px] text-slate-500">
                                            {item.ownerEmail}
                                        </span>
                                    )}
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                                    {item.staffCount ?? 0} người
                                </span>
                            </td>

                            <td className="px-5 py-4 text-slate-500">
                                {formatDate(item.createdAt)}
                            </td>

                            <td className="w-[150px] px-5 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <ActionButton onClick={() => onEdit?.(item)}>
                                        Sửa
                                    </ActionButton>

                                    <ActionButton
                                        variant="danger"
                                        onClick={() => onDelete?.(item)}
                                    >
                                        Xóa
                                    </ActionButton>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {farms.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có Nông trại nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">
                    Tổng {pageInfo.totalElements} nông trại
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
                </>
            )}
        </section>
    );
}
