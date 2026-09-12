import { X } from "lucide-react";
import { useState } from "react";
import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";

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

function getStatusBadge(status) {
    if (status === 'APPROVED' || status === 'AUTO_APPROVED') {
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Đã duyệt</span>;
    }
    if (status === 'REJECTED') {
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Từ chối</span>;
    }
    if (status === 'PENDING') {
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Chờ duyệt</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">Chưa có</span>;
}

export function InventoryStockDetailDrawer({
                                               open,
                                               detail,
                                               loading = false,
                                               onClose,
                                           }) {
    const [previewImage, setPreviewImage] = useState(null);
    const [activeTab, setActiveTab] = useState('import');

    if (!open) return null;

    const stock = detail?.stock;
    const batches = detail?.batches ?? [];
    const exports = detail?.exportHistories ?? [];

    return (
    <>
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-2/3 flex-col border-l border-slate-200 bg-white shadow-xl">
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

                        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <div className="flex border-b border-slate-200 bg-slate-50">
                                <button
                                    onClick={() => setActiveTab('import')}
                                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'import' ? 'border-[#006948] text-[#006948]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                                >
                                    Lô nhập gần nhất
                                </button>
                                <button
                                    onClick={() => setActiveTab('export')}
                                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'export' ? 'border-[#006948] text-[#006948]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                                >
                                    Lịch sử xuất kho
                                </button>
                            </div>

                            {activeTab === 'import' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] border-collapse text-left">
                                        <thead className="bg-slate-50">
                                        <tr className="text-[11px] font-medium uppercase text-slate-600 whitespace-nowrap">
                                            <th className="px-4 py-3">Mã lô</th>
                                            <th className="px-4 py-3">Còn lại</th>
                                            <th className="px-4 py-3">Tổng tiền</th>
                                            <th className="px-4 py-3">Ngày nhập</th>
                                            <th className="px-4 py-3">Người nhập</th>
                                            <th className="px-4 py-3">Minh chứng</th>
                                            <th className="px-4 py-3">Chứng chỉ</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {batches.map((batch) => (
                                            <tr
                                                key={batch.batchId}
                                                className="border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {batch.batchCode}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {formatQuantity(batch.remainingQuantityGrams, stock?.storageUnit)}
                                                </td>

                                                <td className="px-4 py-3 font-medium text-[#006948] whitespace-nowrap">
                                                    {formatMoney(batch.totalImportCost)}
                                                </td>

                                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                    {formatDateTime(batch.importedAt)}
                                                </td>
                                                
                                                <td className="px-4 py-3 text-slate-900 whitespace-nowrap">
                                                    {batch.creatorName || "Hệ thống"}
                                                </td>
                                                
                                                <td className="px-4 py-3">
                                                    {batch.evidenceImageUrl ? (
                                                        <button onClick={() => setPreviewImage(batch.evidenceImageUrl)} className="block w-10 h-10 shrink-0 overflow-hidden rounded-md border border-slate-200 hover:border-[#006948] transition-colors">
                                                            <img src={batch.evidenceImageUrl} alt="Minh chứng" className="w-full h-full object-cover" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">Không có</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {batch.certificateImageUrls?.length ? (
                                                        <div className="flex items-center gap-1">
                                                            {batch.certificateImageUrls.slice(0, 3).map((imageUrl, index) => (
                                                                <button
                                                                    key={`${imageUrl}-${index}`}
                                                                    type="button"
                                                                    onClick={() => setPreviewImage(imageUrl)}
                                                                    className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-emerald-200 hover:border-[#006948]"
                                                                    title={`Xem chứng chỉ ${index + 1}`}
                                                                >
                                                                    <img src={imageUrl} alt={`Chứng chỉ ${index + 1}`} className="h-full w-full object-cover" />
                                                                </button>
                                                            ))}
                                                            {batch.certificateImageUrls.length > 3 && <span className="text-xs font-semibold text-emerald-700">+{batch.certificateImageUrls.length - 3}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">Không có</span>
                                                    )}
                                                </td>
                                                
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {getStatusBadge(batch.approvalStatus)}
                                                </td>
                                            </tr>
                                        ))}

                                        {batches.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-4 py-8 text-center text-sm text-slate-500"
                                                >
                                                    Chưa có lô nhập nào.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] border-collapse text-left">
                                        <thead className="bg-slate-50">
                                        <tr className="text-[11px] font-medium uppercase text-slate-600">
                                            <th className="px-4 py-3">Mã GD</th>
                                            <th className="px-4 py-3">Người xuất</th>
                                            <th className="px-4 py-3">Loại giao dịch</th>
                                            <th className="px-4 py-3">Số lượng xuất</th>
                                            <th className="px-4 py-3">Đơn giá</th>
                                            <th className="px-4 py-3">Ngày duyệt</th>
                                            <th className="px-4 py-3">Minh chứng</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {exports.map((exp) => (
                                            <tr
                                                key={exp.transactionId}
                                                className="border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    #{exp.transactionId}
                                                </td>

                                                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                                    {exp.creatorName || "Hệ thống"}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                    {exp.transactionType === 'EXPORT_FEED' ? 'Cho ăn' : exp.transactionType === 'HARVEST_EXPORT' ? 'Thu hoạch' : exp.transactionType === 'RETURN_OUT' ? 'Trả hàng' : exp.transactionType === 'LEND' ? 'Cho mượn' : exp.transactionType}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {formatQuantity(exp.quantity, stock?.storageUnit)}
                                                </td>

                                                <td className="px-4 py-3 font-medium text-[#006948] whitespace-nowrap">
                                                    {formatMoney(exp.unitPrice)}
                                                </td>

                                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                    {formatDateTime(exp.approvedAt)}
                                                </td>
                                                
                                                <td className="px-4 py-3">
                                                    {exp.imageUrl ? (
                                                        <button onClick={() => setPreviewImage(exp.imageUrl)} className="block w-10 h-10 shrink-0 overflow-hidden rounded-md border border-slate-200 hover:border-[#006948] transition-colors">
                                                            <img src={exp.imageUrl} alt="Minh chứng" className="w-full h-full object-cover" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">Không có</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {getStatusBadge(exp.approvalStatus)}
                                                </td>
                                            </tr>
                                        ))}

                                        {exports.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-4 py-8 text-center text-sm text-slate-500"
                                                >
                                                    Chưa có lịch sử xuất kho.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
        <ImagePreviewModal open={!!previewImage} src={previewImage} onClose={() => setPreviewImage(null)} />
    </>
    );
}
