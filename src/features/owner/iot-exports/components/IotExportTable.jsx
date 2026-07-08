import { Eye } from "lucide-react";
import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

function formatDateTime(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
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
        if (numberValue >= 1000) return `${(numberValue / 1000).toLocaleString("vi-VN")} lít`;
        return `${numberValue.toLocaleString("vi-VN")} ml`;
    }
    if (numberValue >= 1000) return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    return `${numberValue.toLocaleString("vi-VN")} g`;
}

function StatusBadge({ status }) {
    if (status === "APPROVED") return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-[#006948] whitespace-nowrap">Đã xuất</span>;
    if (status === "PENDING") return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 whitespace-nowrap">Chờ xác nhận</span>;
    return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 whitespace-nowrap">{status || "N/A"}</span>;
}

export function IotExportTable({ title, description, scans, pageInfo, loading = false, submittingId = null, mode = "pending", onConfirm, onViewDetail, onPageChange }) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;
    const isPendingMode = mode === "pending";

    return (
        <section className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-xs text-slate-600">{description}</p>
            </header>

            {loading ? <TableLoadingOverlay /> : (
                <div className="w-full">
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead className="bg-slate-50">
                            <tr className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                <th className="w-[8%] py-4 pl-5">Ảnh</th>
                                <th className="w-[8%] px-2 py-4">ID</th>
                                <th className="w-[12%] px-2 py-4">Thời gian</th>
                                <th className="w-[14%] px-2 py-4">Mùa vụ</th>
                                <th className="w-[14%] px-2 py-4">Vật tư</th>
                                <th className="w-[10%] px-2 py-4">Khối lượng</th>
                                <th className="w-[14%] px-2 py-4">QR</th>
                                <th className="w-[9%] px-2 py-4 text-center">Trạng thái</th>
                                <th className="w-[7%] px-2 py-4 text-center">Chi tiết</th>
                                {isPendingMode && <th className="w-[9%] py-4 pl-2 pr-6 text-right">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {scans.map((item) => {
                                const isDisabled = !item.productId || item.needKeypadInput;
                                const isSubmitting = submittingId === item.transactionId;
                                return (
                                    <tr key={item.transactionId} className="border-t border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50/60">
                                        <td className="py-3 pl-5"><img src={item.imageUrl} className="h-10 w-14 rounded-lg border border-slate-200 object-cover" /></td>
                                        <td className="truncate px-2 py-3 font-semibold text-slate-900" title={`#${item.transactionId}`}>#{item.transactionId}</td>
                                        <td className="px-2 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(item.approvedAt || item.createdAt)}</td>
                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate font-medium text-slate-900" title={item.seasonName || "Chưa có mùa vụ"}>{item.seasonName || "Chưa có mùa vụ"}</div>
                                            <div className="text-[11px] text-slate-500 truncate" title={`ID: ${item.seasonId}`}>ID: {item.seasonId || "N/A"}</div>
                                        </td>
                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate font-medium text-slate-900" title={item.productName || "Chưa nhận diện"}>{item.productName || "Chưa nhận diện"}</div>
                                            <div className="text-[11px] text-slate-500 truncate" title={item.productCode || item.deviceId}>{item.productCode || item.deviceId}</div>
                                        </td>
                                        <td className="px-2 py-3 font-medium text-slate-900 truncate">{formatQuantity(item.quantity ?? item.quantityGrams, item.storageUnit)}</td>
                                        <td className="overflow-hidden px-2 py-3">
                                            <div className="truncate text-[11px] font-semibold text-slate-700" title={item.qrType || "N/A"}>{item.qrType || "N/A"}</div>
                                            <div className="truncate text-xs text-slate-500" title={item.qrCodeValue || "Không đọc được QR"}>{item.qrCodeValue || "Không đọc được QR"}</div>
                                        </td>
                                        {/* Đã gỡ bỏ truncate để badge hiện trọn vẹn */}
                                        <td className="px-2 py-3 text-center"><StatusBadge status={item.approvalStatus} /></td>
                                        <td className="px-2 py-3 text-center">
                                            <button onClick={() => onViewDetail?.(item)} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100" title="Xem chi tiết">
                                                <Eye size={13} /> Xem
                                            </button>
                                        </td>
                                        {isPendingMode && (
                                            <td className="whitespace-nowrap py-3 pl-2 pr-5 text-right">
                                                <button
                                                    disabled={isDisabled || isSubmitting}
                                                    onClick={() => onConfirm?.(item)}
                                                    className={[
                                                        // Giảm chiều rộng xuống w-[88px] và thêm whitespace-nowrap để không bao giờ xuống hàng
                                                        "inline-flex h-8 w-[88px] items-center justify-center rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                                                        isDisabled
                                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                            : "bg-[#006948] text-white hover:bg-[#00583d] shadow-sm",
                                                    ].join(" ")}
                                                >
                                                    {isSubmitting ? "Đang xuất..." : "Xác nhận"}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">Tổng {pageInfo?.totalElements || 0} scan</p>
                <div className="flex items-center gap-2">
                    <button type="button" disabled={isFirstPage} onClick={() => { if (!isFirstPage) onPageChange(currentPage - 1); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                    <span className="text-xs text-slate-600">Trang {currentPage + 1} / {totalPages}</span>
                    <button type="button" disabled={isLastPage} onClick={() => { if (!isLastPage) onPageChange(currentPage + 1); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
                </div>
            </footer>
        </section>
    );
}