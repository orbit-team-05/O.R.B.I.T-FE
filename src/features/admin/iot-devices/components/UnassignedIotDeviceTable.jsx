import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function DeviceTypeBadge({ type }) {
    return (
        <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
            {type}
        </span>
    );
}


export function UnassignedIotDeviceTable({
                                             devices,
                                             pageInfo,
                                             loading = false,
                                             onPageChange,
                                             onCopyActivationCode,
                                             onViewDetail,
                                         }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Thiết bị chưa gắn farm
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Các thiết bị đã bootstrap hoặc đã tạo nhưng chưa được owner kích hoạt vào farm
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Device ID</th>
                                <th className="px-5 py-3">Tên thiết bị</th>
                                <th className="px-5 py-3">Loại</th>
                                <th className="px-5 py-3">Activation code</th>
                                <th className="px-5 py-3">Ngày tạo</th>
                                <th className="w-[140px] px-5 py-3 text-left">Hành động</th>
                            </tr>
                            </thead>

                            <tbody>
                            {devices.map((item) => (
                                <tr
                                    key={item.deviceId}
                                    className="border-t border-slate-200 text-sm text-slate-700"
                                >
                                    <td className="max-w-[190px] px-5 py-4 font-semibold text-slate-900">
                                        <div className="break-all">{item.deviceId}</div>
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.deviceName || (
                                            <span className="italic text-slate-400">
                                    Chưa đặt tên
                                </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <DeviceTypeBadge type={item.deviceType} />
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.activationCode ? (
                                            <button
                                                type="button"
                                                onClick={() => onCopyActivationCode?.(item)}
                                                className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-[#006948] hover:bg-emerald-100"
                                            >
                                                {item.activationCode}
                                            </button>
                                        ) : (
                                            <span className="text-slate-400">Không có</span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.createdAt)}
                                    </td>

                                    <td className="w-[140px] px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetail?.(item)}
                                            className="inline-flex h-8 w-[84px] items-center justify-center rounded-lg px-3 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006948]/30"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {devices.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không có thiết bị nào đang chờ gắn farm.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} thiết bị chưa gắn farm
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={pageInfo.first}
                                onClick={() => {
                                    if (pageInfo.first) return;
                                    onPageChange(pageInfo.number - 1);
                                }}
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
                                onClick={() => {
                                    if (pageInfo.last) return;
                                    onPageChange(pageInfo.number + 1);
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