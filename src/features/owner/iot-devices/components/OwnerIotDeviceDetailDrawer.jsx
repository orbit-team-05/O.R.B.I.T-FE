import { X } from "lucide-react";

const STATUS_LABELS = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đã tắt",
    LOST: "Mất kết nối",
    BROKEN: "Hư hỏng",
    UNASSIGNED: "Chưa gắn farm",
};

const STATUS_CLASSES = {
    ACTIVE: "bg-[#006948] text-white",
    INACTIVE: "bg-slate-200 text-slate-600",
    LOST: "bg-red-50 text-red-600",
    BROKEN: "bg-red-100 text-red-700",
    UNASSIGNED: "bg-amber-50 text-amber-700",
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

function maskValue(value) {
    if (!value) return "Chưa có";
    if (value.length <= 8) return "********";

    return `${value.slice(0, 4)}****${value.slice(-4)}`;
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

export function OwnerIotDeviceDetailDrawer({
                                               open,
                                               device,
                                               loading = false,
                                               onClose,
                                           }) {
    if (!open) return null;

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
                            Chi tiết thiết bị
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Thông tin phần cứng, bảo mật và kết nối
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
                        Đang tải chi tiết thiết bị...
                    </div>
                ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Device ID
                            </p>

                            <p className="mt-1 break-all text-base font-semibold text-slate-900">
                                {device?.deviceId || "Chưa có"}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <DeviceTypeBadge type={device?.deviceType} />
                                <StatusBadge status={device?.status} />
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-3">
                            <DetailItem
                                label="Tên thiết bị"
                                value={device?.deviceName}
                            />

                            <DetailItem
                                label="Farm"
                                value={device?.farmName}
                            />

                            <DetailItem
                                label="MAC cân"
                                value={device?.macScale}
                            />

                            <DetailItem
                                label="MAC camera"
                                value={device?.macCam}
                            />

                            <DetailItem
                                label="Hardware key"
                                value={maskValue(device?.hardwareKey)}
                            />

                            <DetailItem
                                label="API key"
                                value="Không hiển thị ở danh sách/chi tiết. API key chỉ được cấp lúc kích hoạt thiết bị."
                            />

                            <DetailItem
                                label="Last seen"
                                value={formatDateTime(device?.lastSeenAt)}
                            />

                            <DetailItem
                                label="Ngày kích hoạt"
                                value={formatDateTime(device?.activatedAt)}
                            />

                            <DetailItem
                                label="Ngày tạo"
                                value={formatDateTime(device?.createdAt)}
                            />

                            <DetailItem
                                label="Cập nhật lần cuối"
                                value={formatDateTime(device?.updatedAt)}
                            />
                        </section>
                    </div>
                )}

                <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
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