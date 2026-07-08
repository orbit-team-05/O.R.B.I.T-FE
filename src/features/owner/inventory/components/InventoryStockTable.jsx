import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatQuantity(value, storageUnit) {
    const numberValue = Number(value || 0);

    if (storageUnit === "MILLILITER") {
        if (numberValue >= 1000) {
            return `${(numberValue / 1000).toLocaleString("vi-VN")} lít`;
        }

        return `${numberValue.toLocaleString("vi-VN")} ml`;
    }

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

export function InventoryStockTable({
    stocks,
    pageInfo,
    loading = false,
    onPageChange,
    onViewDetail,
}) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Tồn kho hiện tại
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Danh sách sản phẩm đã xác nhận nhập kho, gồm ảnh nhập gần nhất, số lượng còn tồn và giá trị tồn kho.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="w-full">
                        <table className="w-full table-fixed border-collapse text-left">
                            <thead className="bg-slate-50">
                                <tr className="whitespace-nowrap text-[11px] font-medium uppercase text-slate-600">
                                    {/* Phân bổ tỷ lệ % ĐỀU đặn hơn cho các cột */}
                                    <th className="w-[8%] px-2 py-3 pl-4">Ảnh</th>
                                    <th className="w-[22%] px-2 py-3">Sản phẩm</th>
                                    <th className="w-[10%] px-2 py-3">Loại</th>
                                    <th className="w-[10%] px-2 py-3">Tồn kho</th>
                                    <th className="w-[10%] px-2 py-3">Ngưỡng thấp</th>
                                    <th className="w-[12%] px-2 py-3">Giá trị tồn</th>
                                    <th className="w-[10%] px-2 py-3">Trạng thái</th>
                                    <th className="w-[10%] px-2 py-3">Cập nhật</th>
                                    <th className="w-[8%] px-2 py-3 pr-4 text-right">Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {stocks.map((item) => (
                                    <tr
                                        key={item.stockId}
                                        className="border-t border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50/55"
                                    >
                                        <td className="px-2 py-3 pl-4">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="h-10 w-14 rounded-lg border border-slate-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">
                                                    No image
                                                </div>
                                            )}
                                        </td>

                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate font-semibold text-slate-900" title={item.productName}>
                                                {item.productName}
                                            </div>
                                            <div className="mt-0.5 truncate text-xs text-slate-500" title={item.productCode}>
                                                {item.productCode}
                                            </div>
                                        </td>

                                        <td className="overflow-hidden px-2 py-3">
                                            <span className="truncate rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600" title={item.category}>
                                                {item.category}
                                            </span>
                                        </td>

                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate font-semibold text-slate-900" title={formatQuantity(item.quantityGrams, item.storageUnit)}>
                                                {formatQuantity(item.quantityGrams, item.storageUnit)}
                                            </div>
                                        </td>

                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate text-slate-600" title={formatQuantity(item.minimumStockGrams, item.storageUnit)}>
                                                {formatQuantity(item.minimumStockGrams, item.storageUnit)}
                                            </div>
                                        </td>

                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate font-semibold text-[#006948]" title={formatMoney(item.inventoryValue)}>
                                                {formatMoney(item.inventoryValue)}
                                            </div>
                                        </td>

                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate">
                                                {item.lowStock ? (
                                                    <span className="rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                                                        Sắp hết
                                                    </span>
                                                ) : (
                                                    <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-[#006948]">
                                                        Ổn
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-2 py-3 text-xs text-slate-500">
                                            {formatDateTime(item.updatedAt)}
                                        </td>

                                        <td className="px-2 py-3 pr-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => onViewDetail?.(item)}
                                                className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {stocks.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center text-sm text-slate-500"
                                        >
                                            Chưa có sản phẩm nào trong kho.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} sản phẩm tồn kho
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (!isFirstPage) onPageChange(currentPage - 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang {currentPage + 1} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (!isLastPage) onPageChange(currentPage + 1);
                                }}
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