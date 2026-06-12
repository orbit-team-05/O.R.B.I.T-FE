import { X } from "lucide-react";
import { useEffect, useState } from "react";

const DEVICE_TYPE_OPTIONS = [
    { label: "Camera ESP32", value: "ESP32_CAM" },
    { label: "Cân ESP32", value: "ESP32_SCALE" },
    { label: "Camera + Cân ESP32", value: "ESP32_CAM_SCALE" },
];

const INITIAL_FORM = {
    deviceName: "",
    deviceType: "ESP32_CAM_SCALE",
    macScale: "",
    macCam: "",
};

export function IotDeviceDrawer({
                                    open,
                                    submitting,
                                    error,
                                    onClose,
                                    onSubmit,
                                }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (!open) return;

        setLocalError("");
        setForm(INITIAL_FORM);
    }, [open]);

    function handleChange(event) {
        const { name, value } = event.target;

        setLocalError("");

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            deviceName: form.deviceName.trim(),
            deviceType: form.deviceType,
            macScale:
                form.deviceType === "ESP32_SCALE" ||
                form.deviceType === "ESP32_CAM_SCALE"
                    ? form.macScale.trim()
                    : "",
            macCam:
                form.deviceType === "ESP32_CAM" ||
                form.deviceType === "ESP32_CAM_SCALE"
                    ? form.macCam.trim()
                    : "",
        };

        if (!payload.deviceName) {
            setLocalError("Tên thiết bị không được để trống.");
            return;
        }

        if (!payload.deviceType) {
            setLocalError("Loại thiết bị không hợp lệ.");
            return;
        }

        if (
            payload.deviceType === "ESP32_SCALE" ||
            payload.deviceType === "ESP32_CAM_SCALE"
        ) {
            if (!payload.macScale) {
                setLocalError("MAC cân không được để trống với thiết bị có cân.");
                return;
            }
        }

        if (
            payload.deviceType === "ESP32_CAM" ||
            payload.deviceType === "ESP32_CAM_SCALE"
        ) {
            if (!payload.macCam) {
                setLocalError("MAC camera không được để trống với thiết bị có camera.");
                return;
            }
        }

        onSubmit(payload);
    }

    if (!open) return null;

    const scaleRequired =
        form.deviceType === "ESP32_SCALE" ||
        form.deviceType === "ESP32_CAM_SCALE";

    const camRequired =
        form.deviceType === "ESP32_CAM" ||
        form.deviceType === "ESP32_CAM_SCALE";

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[420px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 className="text-base font-semibold text-slate-900">
                        Tạo thiết bị IoT
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        {(localError || error) && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {localError || error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Tên thiết bị
                            </label>

                            <input
                                name="deviceName"
                                value={form.deviceName}
                                onChange={handleChange}
                                placeholder="VD: Bộ cân QR khu A"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Loại thiết bị
                            </label>

                            <select
                                name="deviceType"
                                value={form.deviceType}
                                onChange={handleChange}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            >
                                {DEVICE_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                MAC cân
                            </label>

                            <input
                                name="macScale"
                                value={form.macScale}
                                onChange={handleChange}
                                disabled={!scaleRequired}
                                placeholder={
                                    scaleRequired
                                        ? "VD: AA:BB:CC:DD:EE:01"
                                        : "Không dùng cho thiết bị chỉ camera"
                                }
                                className={[
                                    "h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15",
                                    scaleRequired
                                        ? "border-slate-300 bg-white"
                                        : "border-slate-200 bg-slate-100 text-slate-400",
                                ].join(" ")}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                MAC camera
                            </label>

                            <input
                                name="macCam"
                                value={form.macCam}
                                onChange={handleChange}
                                disabled={!camRequired}
                                placeholder={
                                    camRequired
                                        ? "VD: AA:BB:CC:DD:EE:02"
                                        : "Không dùng cho thiết bị chỉ cân"
                                }
                                className={[
                                    "h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15",
                                    camRequired
                                        ? "border-slate-300 bg-white"
                                        : "border-slate-200 bg-slate-100 text-slate-400",
                                ].join(" ")}
                            />
                        </div>
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Đang tạo..." : "Tạo thiết bị"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}