import { Clock3, FileText, Scale, X } from "lucide-react";

const STATUS_LABELS = {
    UNASSIGNED: "Chưa gắn Farm",
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đã tắt",
    LOST: "Mất kết nối",
    BROKEN: "Hư hỏng",
};

function formatDateTime(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(value));
}

export function IotDeviceDetailDrawer({ open, device, onClose }) {
    if (!open || !device) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button type="button" aria-label="Đóng drawer" onClick={onClose} className="absolute inset-0 bg-slate-900/30" />
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-slate-200 bg-white shadow-2xl">
                <header className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#006948]">Scale device</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">Chi tiết & nhật ký thiết bị</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                    <section className="flex gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-emerald-100">
                            {device.imageUrl ? <img src={device.imageUrl} alt={device.deviceName || "Thiết bị cân"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Scale className="text-[#006948]/60" size={38} strokeWidth={1.4} /></div>}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-bold text-slate-900">{device.deviceName || "Thiết bị cân"}</h3>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#006948] ring-1 ring-emerald-200">{STATUS_LABELS[device.status] || device.status}</span>
                            </div>
                            <p className="mt-2 font-mono text-xs font-semibold tracking-wide text-[#006948]">{device.macAddress}</p>
                            <p className="mt-1 text-xs text-slate-500">{device.deviceId || "Chưa có Device ID"}</p>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-3">
                        {[
                            ["Farm", device.farmName || "Chưa gắn Farm"],
                            ["Khối lượng cuối", device.lastWeightGrams == null ? "Chưa có" : `${device.lastWeightGrams} g`],
                            ["Lần thấy cuối", formatDateTime(device.lastSeenAt)],
                            ["Kích hoạt", formatDateTime(device.activatedAt)],
                            ["Ngày tạo", formatDateTime(device.createdAt)],
                            ["Cập nhật", formatDateTime(device.updatedAt)],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                            <FileText size={16} className="text-[#006948]" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Nhật ký thiết bị</h3>
                                <p className="text-[11px] text-slate-500">Các thay đổi quan trọng của thiết bị</p>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {device.auditLogs?.length ? device.auditLogs.map((log) => (
                                <div key={log.id} className="flex gap-3 px-4 py-3">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#006948]"><Clock3 size={14} /></div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800">{log.action}</p>
                                        <p className="mt-0.5 text-xs leading-5 text-slate-600">{log.details}</p>
                                        <p className="mt-1 text-[11px] text-slate-400">{log.actorName} · {formatDateTime(log.createdAt)}</p>
                                    </div>
                                </div>
                            )) : <p className="px-4 py-6 text-center text-xs text-slate-400">Chưa có nhật ký.</p>}
                        </div>
                    </section>
                </div>

                <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Đóng</button>
                </footer>
            </aside>
        </div>
    );
}
