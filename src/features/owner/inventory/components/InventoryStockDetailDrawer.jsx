import { X } from "lucide-react";

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

function DetailItem({ label, value, children }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
                {label}
            </p>

            <div className="mt-1 break-all text-sm font-medium text-slate-900">
                {children || value || <span className="text-slate-400">Chưa có</span>}
            </div>
        </div>
    );
}

export function InventoryStockDetailDrawer({
                                               open,
                                               detail,
                                               loading = false,
                                               onClose,
                                           }) {
    if (!open) return null;

    const stock = detail?.stock;
    const batches = detail?.batches ?? [];

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[620px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Chi tiết tồn kho
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Ảnh scan, số lượng tồn, giá trị tồn và các lô nhập gần nhất
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </header>

                {loading ? (
                    <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
                        Đang tải chi tiết tồn kho...
                    </div>
                ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        {stock?.imageUrl && (
                            <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Ảnh nhập kho gần nhất
                                </p>

                                <img
                                    src={stock.imageUrl}
                                    alt={stock.productName}
                                    className="mt-3 max-h-[260px] w-full rounded-lg border border-slate-200 object-contain"
                                />
                            </section>
                        )}

                        <section className="grid grid-cols-2 gap-3">
                            <DetailItem label="Sản phẩm" value={stock?.productName} />
                            <DetailItem label="Mã sản phẩm" value={stock?.productCode} />
                            <DetailItem label="Loại" value={stock?.category} />
                            <DetailItem label="Đơn vị" value={stock?.storageUnit} />
                            <DetailItem
                                label="Tồn kho"
                                value={formatQuantity(stock?.quantityGrams, stock?.storageUnit)}
                            />
                            <DetailItem
                                label="Ngưỡng thấp"
                                value={formatQuantity(stock?.minimumStockGrams, stock?.storageUnit)}
                            />
                            <DetailItem
                                label="Giá trị tồn"
                                value={formatMoney(stock?.inventoryValue)}
                            />
                            <DetailItem
                                label="Cập nhật"
                                value={formatDateTime(stock?.updatedAt)}
                            />
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white">
                            <header className="border-b border-slate-200 px-4 py-3">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Lô nhập gần nhất
                                </h3>
                            </header>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] border-collapse text-left">
                                    <thead className="bg-slate-50">
                                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                                        <th className="px-4 py-3">Mã lô</th>
                                        <th className="px-4 py-3">Còn lại</th>
                                        <th className="px-4 py-3">Tổng tiền</th>
                                        <th className="px-4 py-3">Ngày nhập</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {batches.map((batch) => (
                                        <tr
                                            key={batch.batchId}
                                            className="border-t border-slate-200 text-sm text-slate-700"
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                {batch.batchCode}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatQuantity(batch.remainingQuantityGrams, stock?.storageUnit)}
                                            </td>

                                            <td className="px-4 py-3 font-medium text-[#006948]">
                                                {formatMoney(batch.totalImportCost)}
                                            </td>

                                            <td className="px-4 py-3 text-slate-500">
                                                {formatDateTime(batch.importedAt)}
                                            </td>
                                        </tr>
                                    ))}

                                    {batches.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-8 text-center text-sm text-slate-500"
                                            >
                                                Chưa có lô nhập nào.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                <footer className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </footer>
            </aside>
        </div>
    );
}