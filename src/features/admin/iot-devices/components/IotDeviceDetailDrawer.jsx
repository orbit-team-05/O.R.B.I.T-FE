import {
    Check,
    Clock3,
    Copy,
    Eye,
    EyeOff,
    FileText,
    KeyRound,
    RefreshCw,
    Scale,
    ShieldCheck,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { regenerateActivationCode, regenerateApiKey } from "../services/iotDeviceApi";
import { useToast } from "../../../../components/common/toast/ToastProvider";

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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function IotDeviceDetailDrawer({ open, device: initialDevice, onClose, onRefreshList }) {
    const toast = useToast();
    const [device, setDevice] = useState(initialDevice);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [regeneratingCode, setRegeneratingCode] = useState(false);
    const [regeneratingKey, setRegeneratingKey] = useState(false);

    useEffect(() => {
        setDevice(initialDevice);
        setCopiedCode(false);
        setCopiedKey(false);
        setShowKey(false);
    }, [initialDevice]);

    if (!open || !device) return null;

    async function handleCopy(text, type) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            if (type === "code") {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } else {
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
            }
            toast.success("Đã sao chép vào bộ nhớ tạm!");
        } catch {
            toast.error("Không thể sao chép tự động.");
        }
    }

    async function handleRegenerateCode() {
        if (!device.deviceId) return;
        setRegeneratingCode(true);
        try {
            const updated = await regenerateActivationCode(device.deviceId);
            setDevice(updated);
            onRefreshList?.();
            toast.success(`Đã cấp lại Mã kích hoạt: ${updated.activationCode}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể cấp lại mã kích hoạt.");
        } finally {
            setRegeneratingCode(false);
        }
    }

    async function handleRegenerateKey() {
        if (!device.deviceId) return;
        setRegeneratingKey(true);
        try {
            const updated = await regenerateApiKey(device.deviceId);
            setDevice(updated);
            onRefreshList?.();
            setShowKey(true);
            toast.success("Đã cấp lại Scale API Key mới thành công!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể cấp lại API key.");
        } finally {
            setRegeneratingKey(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/30"
            />
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-[580px] flex-col border-l border-slate-200 bg-white shadow-2xl">
                <header className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#006948]">
                            Scale device (Admin)
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">
                            Chi tiết & nhật ký thiết bị
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={19} />
                    </button>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                    {/* Device Header */}
                    <section className="flex gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-emerald-100">
                            {device.imageUrl ? (
                                <img
                                    src={device.imageUrl}
                                    alt={device.deviceName || "Thiết bị cân"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Scale className="text-[#006948]/60" size={38} strokeWidth={1.4} />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-base font-bold text-slate-900">
                                    {device.deviceName || "Thiết bị cân"}
                                </h3>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#006948] ring-1 ring-emerald-200">
                                    {STATUS_LABELS[device.status] || device.status}
                                </span>
                            </div>
                            <p className="mt-2 font-mono text-xs font-semibold tracking-wide text-[#006948]">
                                MAC: {device.macAddress}
                            </p>
                            <p className="mt-1 font-mono text-xs font-semibold text-slate-700">
                                Mã cân (Device ID): <span className="text-[#006948]">{device.deviceId || "Chưa có Device ID"}</span>
                            </p>
                        </div>
                    </section>

                    {/* Admin Credentials Section (Activation Code & API Key) */}
                    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
                        <div className="flex items-center gap-2 text-[#006948]">
                            <ShieldCheck size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                Thông tin xác thực & cài đặt cân (Admin)
                            </h3>
                        </div>

                        {/* Mã kích hoạt (Activation Code) */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                    Mã kích hoạt (Activation Code)
                                </span>
                                {device.status === "UNASSIGNED" && (
                                    <button
                                        type="button"
                                        disabled={regeneratingCode}
                                        onClick={handleRegenerateCode}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006948] hover:underline disabled:opacity-50"
                                    >
                                        <RefreshCw size={11} className={regeneratingCode ? "animate-spin" : ""} />
                                        Cấp lại mã
                                    </button>
                                )}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
                                <span className="font-mono text-base font-bold tracking-wider text-slate-900">
                                    {device.activationCode || (device.status === "ACTIVE" ? "Đã được kích hoạt" : "Chưa có mã")}
                                </span>
                                {device.activationCode && (
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(device.activationCode, "code")}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                        {copiedCode ? "Đã chép" : "Sao chép"}
                                    </button>
                                )}
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-500">
                                {device.status === "UNASSIGNED"
                                    ? "Gửi mã này cho Chủ Farm (Owner) để họ nhập vào App Mobile Orbit và gắn cân vào Farm."
                                    : "Thiết bị này đã được kích hoạt thành công vào Nông trại."}
                            </p>
                        </div>

                        {/* Scale API Key */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <KeyRound size={13} className="text-[#006948]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                        Scale API Key (Khóa gửi dữ liệu)
                                    </span>
                                </div>
                                {device.status === "ACTIVE" && (
                                    <button
                                        type="button"
                                        disabled={regeneratingKey}
                                        onClick={handleRegenerateKey}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline disabled:opacity-50"
                                    >
                                        <RefreshCw size={11} className={regeneratingKey ? "animate-spin" : ""} />
                                        Cấp lại Key
                                    </button>
                                )}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
                                <span className="font-mono text-xs font-medium text-slate-800 break-all select-all">
                                    {device.apiKey
                                        ? (showKey ? device.apiKey : "••••••••••••••••••••••••••••••••")
                                        : "Chưa cấp (Hiện khi cân được kích hoạt vào Farm)"}
                                </span>
                                {device.apiKey && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(!showKey)}
                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 transition"
                                            title={showKey ? "Ẩn API Key" : "Hiện API Key"}
                                        >
                                            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(device.apiKey, "key")}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
                                        >
                                            {copiedKey ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                            {copiedKey ? "Đã chép" : "Sao chép"}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-500">
                                Dùng để điền vào ô <strong>Scale API Key</strong> trên trang cấu hình cân WiFi (<code>192.168.4.1</code>).
                            </p>
                        </div>
                    </section>

                    {/* Meta info grid */}
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
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </section>

                    {/* Audit Logs */}
                    <section className="rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                            <FileText size={16} className="text-[#006948]" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Nhật ký thiết bị</h3>
                                <p className="text-[11px] text-slate-500">Các thay đổi quan trọng của thiết bị</p>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {device.auditLogs?.length ? (
                                device.auditLogs.map((log) => (
                                    <div key={log.id} className="flex gap-3 px-4 py-3">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#006948]">
                                            <Clock3 size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800">{log.action}</p>
                                            <p className="mt-0.5 text-xs leading-5 text-slate-600">{log.details}</p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                {log.actorName} · {formatDateTime(log.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="px-4 py-6 text-center text-xs text-slate-400">
                                    Chưa có nhật ký.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </footer>
            </aside>
        </div>
    );
}
