import { useState } from "react";
import { History, Image, RefreshCw, Save, Upload, X } from "lucide-react";
import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";
import Pagination from "../../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../../components/common/sort/SortSelect";

const STATUS_LABELS = { ACTIVE: "Đang hoạt động", INACTIVE: "Đã tắt", LOST: "Mất kết nối", BROKEN: "Hư hỏng", UNASSIGNED: "Chưa gắn Farm" };
const STATUS_CLASSES = { ACTIVE: "bg-[#006948] text-white", INACTIVE: "bg-slate-200 text-slate-600", LOST: "bg-red-50 text-red-600", BROKEN: "bg-red-100 text-red-700", UNASSIGNED: "bg-amber-50 text-amber-700" };

function formatDateTime(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function DetailItem({ label, value }) {
    return <div className="rounded-lg border border-slate-200 bg-white px-3 py-3"><p className="text-xs font-medium uppercase text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-medium text-slate-900">{value || <span className="text-slate-400">Chưa có</span>}</p></div>;
}

export function OwnerIotDeviceDetailDrawer({ open, device, loading = false, actionLoading = false, actionError = "", canEdit = false, onClose, onRefreshWeight, onLoadAuditLogs, onUpdateProfile, onUploadImage }) {
    const [deviceName, setDeviceName] = useState(device?.deviceName || "");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [auditPage, setAuditPage] = useState(null);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditSortKey, setAuditSortKey] = useState("createdDesc");

    if (!open) return null;

    async function loadAudit(page = 0, nextSortKey = auditSortKey) {
        if (!device?.deviceId || !onLoadAuditLogs) return;
        setAuditLoading(true);
        setAuditPage(await onLoadAuditLogs(device.deviceId, page, nextSortKey));
        setAuditLoading(false);
    }

    function handleAuditSortChange(nextSortKey) {
        setAuditSortKey(nextSortKey);
        void loadAudit(0, nextSortKey);
    }

    async function handleSave() {
        if (deviceName.trim() && onUpdateProfile) await onUpdateProfile(device.deviceId, { deviceName: deviceName.trim() });
    }

    async function handleImageChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file && onUploadImage) await onUploadImage(device.deviceId, file);
    }

    return (
        <div className="fixed inset-0 z-50">
            <button type="button" aria-label="Đóng drawer" onClick={onClose} className="absolute inset-0 bg-slate-900/20" />
            <aside className="absolute right-0 top-0 flex h-full w-[min(520px,100vw)] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5"><div><h2 className="text-base font-semibold text-slate-900">Chi tiết thiết bị cân</h2><p className="mt-0.5 text-xs text-slate-500">Thông tin thiết bị, latest weight và nhật ký</p></div><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button></header>
                {loading ? <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Đang tải chi tiết thiết bị...</div> : <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><button type="button" disabled={!device?.imageUrl} onClick={() => setPreviewOpen(true)} className="group relative flex h-44 w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 disabled:cursor-default">{device?.imageUrl ? <img src={device.imageUrl} alt={device.deviceName || "Thiết bị cân"} className="h-full w-full object-contain" /> : <Image size={42} className="text-white/40" />}{device?.imageUrl && <span className="absolute bottom-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">Bấm để xem ảnh</span>}</button><div className="px-4 py-4"><p className="text-xs font-medium uppercase text-slate-500">Device ID</p><p className="mt-1 break-all text-base font-semibold text-slate-900">{device?.deviceId || "Chưa có"}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600">Cân điện tử</span><span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[device?.status] || "bg-slate-100 text-slate-600"}`}>{STATUS_LABELS[device?.status] || device?.status}</span></div></div></section>
                    {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>}
                    {canEdit && <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-end gap-2"><label className="flex-1"><span className="text-xs font-medium text-slate-600">Tên thiết bị</span><input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} maxLength={160} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#006948] focus:outline-none" /></label><button type="button" disabled={actionLoading || !deviceName.trim()} onClick={handleSave} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006948] px-3 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} />Lưu</button></div><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Upload size={14} />Thay ảnh (tối đa 20MB)<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={actionLoading} onChange={handleImageChange} /></label></section>}
                    <section className="grid grid-cols-1 gap-3"><DetailItem label="Farm" value={device?.farmName} /><DetailItem label="Địa chỉ MAC" value={device?.macAddress} /><DetailItem label="Last seen" value={formatDateTime(device?.lastSeenAt)} /><DetailItem label="Ngày kích hoạt" value={formatDateTime(device?.activatedAt)} /><DetailItem label="Ngày tạo" value={formatDateTime(device?.createdAt)} /><DetailItem label="Cập nhật lần cuối" value={formatDateTime(device?.updatedAt)} /></section>
                    <section className="rounded-xl border border-blue-200 bg-blue-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase text-blue-700">Latest weight</p><p className="mt-1 text-2xl font-bold text-slate-900">{device?.lastWeightGrams == null ? "Chưa có dữ liệu" : `${Number(device.lastWeightGrams).toLocaleString("vi-VN")} g`}</p><p className="mt-1 text-xs text-blue-700">{formatDateTime(device?.lastWeightAt)}</p></div><button type="button" disabled={actionLoading} onClick={() => onRefreshWeight?.(device.deviceId)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 disabled:opacity-50"><RefreshCw size={14} />Làm mới</button></div></section>
                    <section className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><div className="flex items-center gap-2"><History size={16} className="text-[#006948]" /><h3 className="text-sm font-semibold text-slate-900">Nhật ký thiết bị</h3></div>{!auditPage ? <button type="button" onClick={() => void loadAudit()} disabled={auditLoading} className="text-xs font-semibold text-[#006948]">{auditLoading ? "Đang tải..." : "Xem nhật ký"}</button> : <SortSelect value={auditSortKey} onChange={handleAuditSortChange} options={[{ value: "createdDesc", label: "Mới nhất trước" }, { value: "createdAsc", label: "Cũ nhất trước" }, { value: "action", label: "Theo thao tác" }]} />}</div>{auditPage && <><div className="divide-y divide-slate-100">{auditPage.content?.length ? auditPage.content.map((log) => <div key={log.id} className="px-4 py-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-800">{log.action}</p><span className="text-[11px] text-slate-400">{formatDateTime(log.createdAt)}</span></div><p className="mt-1 text-xs text-slate-600">{log.details || "Không có mô tả"}</p><p className="mt-1 text-[11px] text-slate-400">Thực hiện bởi: {log.actorName || "System"}</p></div>) : <p className="px-4 py-5 text-center text-xs text-slate-500">Chưa có nhật ký.</p>}</div><Pagination page={auditPage.number} totalPages={auditPage.totalPages} totalElements={auditPage.totalElements} pageSize={auditPage.size} loading={auditLoading} onPageChange={(page) => void loadAudit(page)} /></>}</section>
                </div>}
                <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4"><button type="button" onClick={onClose} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700">Đóng</button></footer>
            </aside>
            <ImagePreviewModal open={previewOpen} src={device?.imageUrl} onClose={() => setPreviewOpen(false)} />
        </div>
    );
}
