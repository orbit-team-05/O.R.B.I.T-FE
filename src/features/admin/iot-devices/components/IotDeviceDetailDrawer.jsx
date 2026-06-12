import { X } from "lucide-react";

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

function StatusBadge({ status }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-600",
            ].join(" ")}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function DeviceTypeBadge({ type }) {
    return (
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {type || "Chưa có"}
        </span>
    );
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

export function IotDeviceDetailDrawer({
                                          open,
                                          device,
                                          onClose,
                                          onReplaceComponent,
                                      }) {
    if (!open || !device) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[460px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Chi tiết thiết bị IoT
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Xem thông tin phần cứng và trạng thái thiết bị
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

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Device ID
                        </p>

                        <p className="mt-1 break-all text-base font-semibold text-slate-900">
                            {device.deviceId}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <DeviceTypeBadge type={device.deviceType} />
                            <StatusBadge status={device.status} />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3">
                        <DetailItem
                            label="Tên thiết bị"
                            value={device.deviceName}
                        />

                        <DetailItem
                            label="Farm"
                            value={device.farmName || "Chưa gắn farm"}
                        />

                        <DetailItem
                            label="Activation code"
                            value={device.activationCode}
                        />

                        <DetailItem
                            label="MAC cân"
                            value={device.macScale}
                        />

                        <DetailItem
                            label="MAC camera"
                            value={device.macCam}
                        />

                        <DetailItem
                            label="Hardware key"
                            value={device.hardwareKey}
                        />

                        <DetailItem
                            label="Last seen"
                            value={formatDateTime(device.lastSeenAt)}
                        />

                        <DetailItem
                            label="Ngày kích hoạt"
                            value={formatDateTime(device.activatedAt)}
                        />

                        <DetailItem
                            label="Ngày tạo"
                            value={formatDateTime(device.createdAt)}
                        />

                        <DetailItem
                            label="Cập nhật lần cuối"
                            value={formatDateTime(device.updatedAt)}
                        />
                    </section>

                    {device.status === "UNASSIGNED" && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                            Thiết bị này chưa được owner kích hoạt vào farm. Admin có thể kiểm tra hoặc thay linh kiện trước khi giao thiết bị.
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Đóng
                    </button>

                    <button
                        type="button"
                        onClick={() => onReplaceComponent?.(device)}
                        className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                    >
                        Thay linh kiện
                    </button>
                </footer>
            </aside>
        </div>
    );
}