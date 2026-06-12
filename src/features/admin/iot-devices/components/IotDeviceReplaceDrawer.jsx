import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const COMPONENT_OPTIONS = [
    { label: "Camera", value: "CAM" },
    { label: "Cân", value: "SCALE" },
];

const INITIAL_FORM = {
    componentType: "CAM",
    newMacAddress: "",
};

function getCurrentMac(device, componentType) {
    if (!device) return "";

    return componentType === "CAM"
        ? device.macCam || ""
        : device.macScale || "";
}

function canReplaceComponent(device, componentType) {
    if (!device) return false;

    if (componentType === "CAM") {
        return device.deviceType !== "ESP32_SCALE";
    }

    if (componentType === "SCALE") {
        return device.deviceType !== "ESP32_CAM";
    }

    return false;
}

export function IotDeviceReplaceDrawer({
                                           open,
                                           device,
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
    }, [open, device]);

    const currentMac = useMemo(
        () => getCurrentMac(device, form.componentType),
        [device, form.componentType],
    );

    const componentAvailable = useMemo(
        () => canReplaceComponent(device, form.componentType),
        [device, form.componentType],
    );

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

        if (!device) {
            setLocalError("Không tìm thấy thiết bị cần thay linh kiện.");
            return;
        }

        const payload = {
            componentType: form.componentType,
            newMacAddress: form.newMacAddress.trim(),
        };

        if (!componentAvailable) {
            setLocalError("Loại thiết bị này không có linh kiện đã chọn.");
            return;
        }

        if (!payload.newMacAddress) {
            setLocalError("MAC mới không được để trống.");
            return;
        }

        if (
            currentMac &&
            payload.newMacAddress.trim().toUpperCase() === currentMac.trim().toUpperCase()
        ) {
            setLocalError("MAC mới đang trùng với MAC hiện tại.");
            return;
        }

        onSubmit(device, payload);
    }

    if (!open) return null;

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
                        Thay linh kiện thiết bị
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

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Thiết bị
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                                {device?.deviceId}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                {device?.deviceName || "Chưa đặt tên"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Loại: {device?.deviceType}
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Linh kiện cần thay
                            </label>

                            <select
                                name="componentType"
                                value={form.componentType}
                                onChange={handleChange}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            >
                                {COMPONENT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                MAC hiện tại
                            </label>

                            <input
                                value={currentMac || "Không có"}
                                disabled
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                MAC mới
                            </label>

                            <input
                                name="newMacAddress"
                                value={form.newMacAddress}
                                onChange={handleChange}
                                placeholder="VD: AA:BB:CC:DD:EE:FF"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                            Sau khi thay linh kiện, thiết bị cũ với MAC cũ sẽ không gửi dữ liệu hợp lệ được nữa.
                            Thiết bị vẫn giữ nguyên Device ID và API Key.
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
                            {submitting ? "Đang thay..." : "Thay linh kiện"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}