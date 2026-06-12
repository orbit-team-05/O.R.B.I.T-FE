import { useState } from "react";

export function OwnerIotDeviceActivateCard({
                                               submitting = false,
                                               error = "",
                                               onSubmit,
                                           }) {
    const [form, setForm] = useState({
        activationCode: "",
        deviceName: "",
    });

    const [localError, setLocalError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            activationCode: form.activationCode.trim(),
            deviceName: form.deviceName.trim(),
        };

        if (!payload.activationCode) {
            setLocalError("Mã kích hoạt không được để trống.");
            return;
        }

        if (!payload.deviceName) {
            setLocalError("Tên thiết bị không được để trống.");
            return;
        }

        setLocalError("");

        const success = await onSubmit?.(payload);

        if (success) {
            setForm({
                activationCode: "",
                deviceName: "",
            });
        }
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Kích hoạt thiết bị mới
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Nhập mã kích hoạt hiển thị trên thiết bị để gắn thiết bị vào farm
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                {(localError || error) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {localError || error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Activation code
                        </label>

                        <input
                            name="activationCode"
                            value={form.activationCode}
                            onChange={handleChange}
                            placeholder="VD: ACT-123456"
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Tên thiết bị
                        </label>

                        <input
                            name="deviceName"
                            value={form.deviceName}
                            onChange={handleChange}
                            placeholder="VD: Bộ cân QR khu A"
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="h-10 rounded-lg bg-[#006948] px-5 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Đang kích hoạt..." : "Kích hoạt thiết bị"}
                    </button>
                </div>
            </form>
        </section>
    );
}