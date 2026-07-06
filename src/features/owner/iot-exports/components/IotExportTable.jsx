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
        if (numberValue >= 1000) {
            return `${(
                numberValue / 1000
            ).toLocaleString("vi-VN")} lít`;
        }

        return `${numberValue.toLocaleString(
            "vi-VN",
        )} ml`;
    }

    if (numberValue >= 1000) {
        return `${(
            numberValue / 1000
        ).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString(
        "vi-VN",
    )} g`;
}

function StatusBadge({ status }) {
    if (status === "APPROVED") {
        return (
            <span className="inline-flex whitespace-nowrap items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-[#006948]">
                Đã xuất
            </span>
        );
    }

    if (status === "PENDING") {
        return (
            <span className="inline-flex whitespace-nowrap items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                Chờ xác nhận
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {status || "N/A"}
        </span>
    );
}

export function IotExportTable({
    title,
    description,
    scans,
    pageInfo,
    loading = false,
    submittingId = null,
    mode = "pending",
    onConfirm,
    onViewDetail,
    onPageChange,
}) {
    const currentPage = Math.max(
        Number(pageInfo?.number ?? 0),
        0,
    );

    const totalPages = Math.max(
        Number(pageInfo?.totalPages ?? 1),
        1,
    );

    const isFirstPage =
        currentPage <= 0 || pageInfo?.first;

    const isLastPage =
        currentPage >= totalPages - 1 ||
        pageInfo?.last;

    const isPendingMode =
        mode === "pending";

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                        <table className="w-full min-w-[1180px] border-collapse text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                    <th className="px-5 py-3">
                                        Ảnh
                                    </th>

                                    <th className="px-5 py-3">
                                        Transaction
                                    </th>

                                    <th className="px-5 py-3">
                                        Thời gian
                                    </th>

                                    <th className="px-5 py-3">
                                        Mùa vụ
                                    </th>

                                    <th className="px-5 py-3">
                                        Vật tư
                                    </th>

                                    <th className="px-5 py-3">
                                        Khối lượng
                                    </th>

                                    <th className="px-5 py-3">
                                        QR
                                    </th>

                                    <th className="px-5 py-3">
                                        Trạng thái
                                    </th>

                                    <th className="w-[100px] px-5 py-3">
                                        Chi tiết
                                    </th>

                                    {isPendingMode && (
                                        <th className="w-[190px] px-5 py-3 text-center">
                                            Hành động
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {scans.map((item) => {
                                    const isDisabled =
                                        !item.productId ||
                                        item.needKeypadInput;

                                    const isSubmitting =
                                        submittingId ===
                                        item.transactionId;

                                    return (
                                        <tr
                                            key={
                                                item.transactionId
                                            }
                                            className="border-t border-slate-200 text-sm text-slate-700 transition-colors hover:bg-slate-50/60"
                                        >
                                            <td className="px-5 py-4">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={
                                                            item.imageUrl
                                                        }
                                                        alt="Ảnh scan xuất"
                                                        className="h-14 w-20 rounded-lg border border-slate-200 object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[11px] text-slate-400">
                                                        No image
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                #
                                                {
                                                    item.transactionId
                                                }
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {formatDateTime(
                                                    item.approvedAt ||
                                                    item.createdAt,
                                                )}
                                            </td>

                                            <td className="max-w-[220px] px-5 py-4">
                                                <div className="line-clamp-2 font-medium text-slate-900">
                                                    {item.seasonName ||
                                                        "Chưa có mùa vụ"}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    Season ID:{" "}
                                                    {item.seasonId ||
                                                        "N/A"}
                                                </div>
                                            </td>

                                            <td className="max-w-[240px] px-5 py-4">
                                                <div className="line-clamp-2 font-medium text-slate-900">
                                                    {item.productName ||
                                                        "Chưa nhận diện"}
                                                </div>

                                                <div className="mt-1 break-all text-xs text-slate-500">
                                                    {item.productCode ||
                                                        item.deviceName ||
                                                        item.deviceId}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                {formatQuantity(
                                                    item.quantity ??
                                                    item.quantityGrams,
                                                    item.storageUnit,
                                                )}
                                            </td>

                                            <td className="max-w-[220px] px-5 py-4">
                                                <div className="text-xs font-semibold text-slate-700">
                                                    {item.qrType ||
                                                        "N/A"}
                                                </div>

                                                <div className="mt-1 break-all text-xs text-slate-500">
                                                    {item.qrCodeValue ||
                                                        "Không đọc được QR"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={
                                                        item.approvalStatus
                                                    }
                                                />
                                            </td>

                                            <td className="w-[100px] px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onViewDetail?.(
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100"
                                                >
                                                    <Eye
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    Xem
                                                </button>
                                            </td>

                                            {isPendingMode && (
                                                <td className="w-[190px] px-5 py-4">
                                                    <div className="flex justify-center">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isDisabled ||
                                                                isSubmitting ||
                                                                item.approvalStatus ===
                                                                "APPROVED"
                                                            }
                                                            onClick={() => {
                                                                if (
                                                                    item.approvalStatus !==
                                                                    "APPROVED"
                                                                ) {
                                                                    onConfirm?.(item);
                                                                }
                                                            }}
                                                            className={[
                                                                "text-sm font-semibold transition-colors duration-200",

                                                                item.approvalStatus ===
                                                                    "APPROVED"
                                                                    ? "cursor-not-allowed text-slate-400"
                                                                    : "text-[#006948] hover:text-[#00583d]",

                                                                isDisabled
                                                                    ? "cursor-not-allowed text-slate-400"
                                                                    : "",
                                                            ].join(" ")}
                                                        >
                                                            {isSubmitting
                                                                ? "Đang xuất..."
                                                                : item.approvalStatus ===
                                                                    "APPROVED"
                                                                    ? "Đã xác nhận"
                                                                    : "Xác nhận xuất"}
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}

                                {scans.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={
                                                isPendingMode
                                                    ? 10
                                                    : 9
                                            }
                                            className="px-5 py-10 text-center text-sm text-slate-500"
                                        >
                                            {isPendingMode
                                                ? "Chưa có scan xuất vật tư nào đang chờ xác nhận."
                                                : "Chưa có lịch sử xuất vật tư."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng{" "}
                            {pageInfo?.totalElements ||
                                0}{" "}
                            scan
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (
                                        !isFirstPage
                                    ) {
                                        onPageChange(
                                            currentPage -
                                            1,
                                        );
                                    }
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang{" "}
                                {currentPage + 1} /{" "}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (
                                        !isLastPage
                                    ) {
                                        onPageChange(
                                            currentPage +
                                            1,
                                        );
                                    }
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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