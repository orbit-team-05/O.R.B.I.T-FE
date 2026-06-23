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

function formatWeight(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg/ml`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g/ml`;
}

export function IotImportPendingTable({
                                          title = "Scan nhập kho chờ xác nhận",
                                          description = "Dữ liệu từ cân IoT sẽ tự hiện ở đây qua WebSocket.",
                                          mode = "pending",
                                          scans,
                                          pageInfo,
                                          loading = false,
                                          submittingId = null,
                                          onConfirm,
                                          onPageChange,
                                      }) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    {title}
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    {description}
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Ảnh</th>
                                <th className="px-5 py-3">Transaction</th>
                                <th className="px-5 py-3">Thời gian</th>
                                <th className="px-5 py-3">Sản phẩm</th>
                                <th className="px-5 py-3">Khối lượng</th>
                                <th className="px-5 py-3">QR</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                {/* 🛠 ĐÃ SỬA: Chỉ render tiêu đề cột nếu là tab pending */}
                                {mode === "pending" && <th className="w-[150px] px-5 py-3">Hành động</th>}
                            </tr>
                            </thead>

                            <tbody>
                            {scans.map((item) => (
                                <tr
                                    key={item.transactionId}
                                    className="border-t border-slate-200 text-sm text-slate-700"
                                >
                                    <td className="px-5 py-4">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt="Ảnh scan"
                                                className="h-14 w-20 rounded-lg border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-400">
                                                No image
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                        #{item.transactionId}
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.scannedAt)}
                                    </td>

                                    <td className="max-w-[240px] px-5 py-4">
                                        <div className="line-clamp-2 font-medium text-slate-900">
                                            {item.productName || "Chưa nhận diện"}
                                        </div>
                                        <div className="mt-1 break-all text-xs text-slate-500">
                                            {item.productCode || item.deviceName || item.deviceId}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 font-medium text-slate-900">
                                        {formatWeight(item.weightGrams)}
                                    </td>

                                    <td className="max-w-[220px] px-5 py-4">
                                        <div className="text-xs font-medium text-slate-700">
                                            {item.qrType || "N/A"}
                                        </div>
                                        <div className="mt-1 break-all text-xs text-slate-500">
                                            {item.qrCodeValue || "Không đọc được QR"}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        {mode === "history" ? (
                                            <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-[#006948]">
                                                Đã nhập kho
                                            </span>
                                        ) : item.productId ? (
                                            <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-[#006948]">
                                                Chờ nhập giá
                                            </span>
                                        ) : (
                                            <span className="rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                                                Lỗi QR
                                            </span>
                                        )}
                                    </td>

                                    {/* 🛠 ĐÃ SỬA: Chỉ hiển thị ô chứa nút Xác nhận ở tab Chờ xác nhận */}
                                    {mode === "pending" && (
                                        <td className="w-[150px] px-5 py-4">
                                            <button
                                                type="button"
                                                disabled={!item.productId || submittingId === item.transactionId}
                                                onClick={() => onConfirm?.(item)}
                                                className="inline-flex h-8 items-center justify-center rounded-lg bg-[#006948] px-3 text-xs font-medium text-white transition-colors hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Xác nhận
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {scans.length === 0 && (
                                <tr>
                                    <td
                                        /* 🛠 ĐÃ SỬA: colSpan giảm từ 8 xuống 7 ở tab history */
                                        colSpan={mode === "pending" ? 8 : 7}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        {mode === "pending"
                                            ? "Chưa có scan nhập kho nào đang chờ xác nhận."
                                            : "Chưa có lịch sử nhập kho."}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} scan
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