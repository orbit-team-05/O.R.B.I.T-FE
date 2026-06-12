const STATUS_LABELS = {
    UNASSIGNED: "Chưa gắn farm",
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đã tắt",
    LOST: "Mất kết nối",
    BROKEN: "Hư hỏng",
};

const STATUS_CLASSES = {
    UNASSIGNED: "bg-amber-50 text-amber-700",
    ACTIVE: "bg-[#006948] text-white",
    INACTIVE: "bg-slate-200 text-slate-600",
    LOST: "bg-red-50 text-red-600",
    BROKEN: "bg-red-100 text-red-700",
};

function DeviceStatusBadge({ status }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1",
                "text-[11px] font-medium",
                STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-600",
            ].join(" ")}
        >
      {STATUS_LABELS[status] ?? status}
    </span>
    );
}

function DeviceTypeBadge({ type }) {
    return (
        <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
      {type}
    </span>
    );
}

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
                "inline-flex h-8 w-[84px] items-center justify-center rounded-lg px-3",
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

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function IotDeviceTable({
                                   devices,
                                   pageInfo,
                                   onPageChange,
                                   onToggleStatus,
                                   onCopyActivationCode,
                                   onViewDetail,
                               }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách Thiết bị IoT
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Quản lý thiết bị cân, camera và bộ cam-cân trong hệ thống
                </p>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                    <thead className="bg-slate-50">
                    <tr className="text-[11px] font-medium uppercase text-slate-600">
                        <th className="px-5 py-3">Device ID</th>
                        <th className="px-5 py-3">Tên thiết bị</th>
                        <th className="px-5 py-3">Loại</th>
                        <th className="px-5 py-3">Farm</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Last seen</th>
                        <th className="px-5 py-3">Activation code</th>
                        <th className="w-[210px] px-5 py-3 text-left">Hành động</th>
                    </tr>
                    </thead>

                    <tbody>
                    {devices.map((item) => {
                        const isActive = item.status === "ACTIVE";
                        const isInactive = item.status === "INACTIVE";

                        return (
                            <tr
                                key={item.deviceId}
                                className="border-t border-slate-200 text-sm text-slate-700"
                            >
                                <td className="max-w-[190px] px-5 py-4 font-semibold text-slate-900">
                                    <div className="break-all">{item.deviceId}</div>
                                </td>

                                <td className="px-5 py-4">
                                    {item.deviceName || (
                                        <span className="italic text-slate-400">Chưa đặt tên</span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <DeviceTypeBadge type={item.deviceType} />
                                </td>

                                <td className="px-5 py-4">
                                    {item.farmName || (
                                        <span className="text-slate-400">Chưa gắn</span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <DeviceStatusBadge status={item.status} />
                                </td>

                                <td className="px-5 py-4">
                                    {formatDateTime(item.lastSeenAt)}
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
                                        <span className="text-slate-400">Đã kích hoạt</span>
                                    )}
                                </td>

                                <td className="w-[210px] px-5 py-4">
                                    <div className="grid grid-cols-[84px_84px] items-center gap-2">
                                        <ActionButton onClick={() => onViewDetail?.(item)}>
                                            Chi tiết
                                        </ActionButton>

                                        {isActive && (
                                            <ActionButton
                                                variant="danger"
                                                onClick={() => onToggleStatus?.(item, "INACTIVE")}
                                            >
                                                Tắt
                                            </ActionButton>
                                        )}

                                        {isInactive && (
                                            <ActionButton
                                                variant="success"
                                                onClick={() => onToggleStatus?.(item, "ACTIVE")}
                                            >
                                                Bật lại
                                            </ActionButton>
                                        )}

                                        {!isActive && !isInactive && (
                                            <span className="h-8 w-[84px]" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    {devices.length === 0 && (
                        <tr>
                            <td
                                colSpan={8}
                                className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                                Chưa có thiết bị IoT nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                <p className="text-xs text-slate-500">
                    Tổng {pageInfo.totalElements} thiết bị
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
        </section>
    );
}