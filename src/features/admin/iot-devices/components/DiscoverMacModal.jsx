import { Cpu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function DiscoverMacModal({
    open,
    submitting = false,
    error = "",
    onClose,
    onSubmit,
}) {
    const [mac, setMac] = useState("");
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (!open) return;
        setMac("");
        setLocalError("");
    }, [open]);

    if (!open) return null;

    function handleMacChange(e) {
        const val = e.target.value.toUpperCase();
        setMac(val);
        setLocalError("");
    }

    function handleSubmit(e) {
        e.preventDefault();
        const trimmed = mac.trim();
        if (!trimmed) {
            setLocalError("Vui lòng nhập địa chỉ MAC.");
            return;
        }

        const cleanHex = trimmed.replace(/[^0-9A-F]/gi, "");
        if (cleanHex.length !== 12) {
            setLocalError("Địa chỉ MAC phải gồm 12 ký tự hex (ví dụ: 24:6F:28:1A:BC:50).");
            return;
        }

        onSubmit?.(trimmed);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[2px]">
            <button
                type="button"
                aria-label="Đóng dialog"
                onClick={submitting ? undefined : onClose}
                className="absolute inset-0"
            />

            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <button
                    type="button"
                    disabled={submitting}
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                >
                    <X size={18} />
                </button>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#006948] ring-1 ring-emerald-200">
                    <Cpu size={24} />
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-900">
                        Thêm địa chỉ MAC thiết bị cân
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-600">
                        Nhập địa chỉ MAC phần cứng của cân ESP32 (bấm phím <span className="font-semibold text-[#006948]">A</span> trên bàn phím cân để xem). Sau khi thêm, hệ thống sẽ đưa vào danh sách chờ tạo cân.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {(localError || error) && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                            {localError || error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Địa chỉ MAC <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={mac}
                            onChange={handleMacChange}
                            disabled={submitting}
                            autoFocus
                            placeholder="24:6F:28:1A:BC:50"
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm tracking-wider uppercase text-slate-900 outline-none transition focus:border-[#006948] focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                        />
                        <p className="mt-1.5 text-[11px] text-slate-400">
                            Định dạng: 24:6F:28:1A:BC:50 hoặc 246F281ABC50
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onClose}
                            className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#006948] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Đang xử lý..." : "Khám phá MAC & Tiếp tục"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
