import { X } from "lucide-react";

export function OwnerIotDeviceApiKeyDrawer({
                                               open,
                                               device,
                                               onClose,
                                               onCopy,
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
                            Thiết bị đã kích hoạt
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Lưu API key để cấu hình thiết bị
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
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                        <p className="text-sm font-semibold text-[#006948]">
                            Kích hoạt thành công
                        </p>

                        <p className="mt-1 text-xs text-emerald-700">
                            API key chỉ nên hiển thị sau khi kích hoạt. Hãy copy và cấu hình vào ESP32-CAM.
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Device ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                            {device.deviceId}
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            API key
                        </p>

                        <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-3 font-mono text-xs text-slate-900">
                            {device.apiKey || "Backend không trả apiKey."}
                        </p>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                        Sau khi đóng màn này, Owner không nên xem lại API key từ list/detail để tránh lộ khóa thiết bị.
                    </div>
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
                        disabled={!device.apiKey}
                        onClick={() => onCopy?.(device.apiKey)}
                        className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Copy API key
                    </button>
                </footer>
            </aside>
        </div>
    );
}