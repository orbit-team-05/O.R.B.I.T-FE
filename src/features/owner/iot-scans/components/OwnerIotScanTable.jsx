import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

const AI_STATUS_LABELS = {
    SUCCESS: "Nhận diện QR",
    LOW_CONFIDENCE: "Độ tin cậy thấp",
    UNRECOGNIZED: "Không nhận diện",
    CORRECTED: "Không nhận diện QR - đã nhập mã",
};

const AI_STATUS_CLASSES = {
    SUCCESS: "bg-[#006948] text-white",
    LOW_CONFIDENCE: "bg-amber-50 text-amber-700",
    UNRECOGNIZED: "bg-red-50 text-red-600",
    CORRECTED: "bg-blue-50 text-blue-700",
};

function getScanDisplayStatus(item) {
    if (item?.aiStatus === "CORRECTED") {
        return {
            label: "Không nhận diện QR - đã nhập mã",
            className: AI_STATUS_CLASSES.CORRECTED,
        };
    }

    if (item?.needKeypadInput) {
        return {
            label: "Cần nhập mã keypad",
            className: "bg-amber-50 text-amber-700",
        };
    }

    return {
        label: AI_STATUS_LABELS[item?.aiStatus] ?? item?.aiStatus ?? "Chưa có",
        className: AI_STATUS_CLASSES[item?.aiStatus] ?? "bg-slate-100 text-slate-600",
    };
}
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
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

function AiStatusBadge({ item }) {
    const status = getScanDisplayStatus(item);

    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                status.className,
            ].join(" ")}
        >
            {status.label}
        </span>
    );
}

function getFlowLabel(item) {
    if (
        item?.requestedAction === "EXPORT_FEED" ||
        item?.transactionType === "EXPORT_FEED"
    ) {
        return {
            label: "Xuất vật tư",
            className: "bg-orange-50 text-orange-700",
        };
    }

    if (
        item?.requestedAction === "IMPORT" ||
        item?.requestedAction === "IMPORT_STOCK" ||
        item?.transactionType === "IMPORT"
    ) {
        return {
            label: "Nhập kho",
            className: "bg-emerald-50 text-[#006948]",
        };
    }

    return {
        label: "Scan IoT",
        className: "bg-slate-100 text-slate-600",
    };
}

function FlowBadge({ item }) {
    const flow = getFlowLabel(item);

    return (
        <span
            className={[
                "inline-flex rounded-full px-3 py-1 text-[11px] font-medium",
                flow.className,
            ].join(" ")}
        >
            {flow.label}
        </span>
    );
}

export function OwnerIotScanTable({
                                      scans,
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
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Lịch sử Scan IoT
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Hiển thị toàn bộ scan từ thiết bị IoT: nhập kho, xuất vật tư, nhập keypad và voice phản hồi.
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Transaction</th>
                                <th className="px-5 py-3">Luồng</th>
                                <th className="px-5 py-3">Thời gian</th>
                                <th className="px-5 py-3">Thiết bị</th>
                                <th className="px-5 py-3">Sản phẩm / QR</th>
                                <th className="px-5 py-3">Khối lượng</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3">Voice</th>
                                <th className="w-[120px] px-5 py-3">Hành động</th>
                            </tr>
                            </thead>

                            <tbody>
                            {scans.map((item) => (
                                <tr
                                    key={item.transactionId}
                                    className="border-t border-slate-200 text-sm text-slate-700"
                                >
                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                        #{item.transactionId}
                                    </td>
                                    <td className="px-5 py-4">
                                        <FlowBadge item={item} />
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

                                        {item.needKeypadInput && (
                                            <div className="mt-1 text-xs font-medium text-amber-600">
                                                Cần nhập mã keypad
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-slate-900">
                                        {formatWeight(item.weightGrams)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <AiStatusBadge item={item} />
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.hasAudio ? (
                                            <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-[#006948]">
            Có voice
        </span>
                                        ) : (
                                            <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
            Chưa có
        </span>
                                        )}
                                    </td>

                                    <td className="w-[120px] px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetail?.(item)}
                                            className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {scans.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Chưa có lịch sử scan IoT nào.
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