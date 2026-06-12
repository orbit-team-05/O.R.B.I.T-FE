import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

const AI_STATUS_LABELS = {
    PENDING: "Đang chờ",
    SUCCESS: "Thành công",
    LOW_CONFIDENCE: "Độ tin cậy thấp",
    UNRECOGNIZED: "Không nhận diện",
    CORRECTED: "Đã chỉnh sửa",
};

const AI_STATUS_CLASSES = {
    PENDING: "bg-slate-100 text-slate-600",
    SUCCESS: "bg-[#006948] text-white",
    LOW_CONFIDENCE: "bg-amber-50 text-amber-700",
    UNRECOGNIZED: "bg-red-50 text-red-600",
    CORRECTED: "bg-blue-50 text-blue-700",
};

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

function formatWeight(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

function formatConfidence(value) {
    if (value == null) return "Chưa có";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) return "Chưa có";

    if (numberValue <= 1) {
        return `${Math.round(numberValue * 100)}%`;
    }

    return `${Math.round(numberValue)}%`;
}

function AiStatusBadge({ status }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                AI_STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-600",
            ].join(" ")}
        >
            {AI_STATUS_LABELS[status] ?? status ?? "Chưa có"}
        </span>
    );
}

export function OwnerAiReviewTable({
                                       reviews,
                                       pageInfo,
                                       loading = false,
                                       onPageChange,
                                       onReview,
                                   }) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách cần duyệt AI
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Kiểm tra ảnh scan và chọn sản phẩm đúng để hoàn tất hậu kiểm.
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
                                <th className="px-5 py-3">Transaction</th>
                                <th className="px-5 py-3">Ảnh</th>
                                <th className="px-5 py-3">Thời gian</th>
                                <th className="px-5 py-3">Thiết bị</th>
                                <th className="px-5 py-3">AI dự đoán</th>
                                <th className="px-5 py-3">Khối lượng</th>
                                <th className="px-5 py-3">Confidence</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="w-[120px] px-5 py-3">Hành động</th>
                            </tr>
                            </thead>

                            <tbody>
                            {reviews.map((item) => (
                                <tr
                                    key={item.transactionId}
                                    className="border-t border-slate-200 text-sm text-slate-700"
                                >
                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                        #{item.transactionId}
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt="Ảnh scan"
                                                className="h-12 w-16 rounded-lg border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-400">
                                                No image
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.scannedAt)}
                                    </td>

                                    <td className="max-w-[180px] px-5 py-4">
                                        <div className="font-medium text-slate-900">
                                            {item.deviceName || "Thiết bị IoT"}
                                        </div>
                                        <div className="mt-1 break-all text-xs text-slate-500">
                                            {item.deviceId}
                                        </div>
                                    </td>

                                    <td className="max-w-[220px] px-5 py-4">
                                        <div className="line-clamp-2 font-medium text-slate-900">
                                            {item.aiPredictedName || "Chưa nhận diện"}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 font-medium text-slate-900">
                                        {formatWeight(item.weightGrams)}
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatConfidence(item.aiConfidence)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <AiStatusBadge status={item.aiStatus} />
                                    </td>

                                    <td className="w-[120px] px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onReview?.(item)}
                                            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#006948] px-3 text-xs font-medium text-white transition-colors hover:bg-[#00583d]"
                                        >
                                            Duyệt
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {reviews.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không có giao dịch nào cần duyệt AI.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} giao dịch
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (isFirstPage) return;
                                    onPageChange(currentPage - 1);
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
                                    if (isLastPage) return;
                                    onPageChange(currentPage + 1);
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