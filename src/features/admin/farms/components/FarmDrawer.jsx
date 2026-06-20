import { X } from "lucide-react";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
    farmName: "",
    location: "",
    ownerId: "",
};

export function FarmDrawer({
                               open,
                               mode = "create",
                               farm,
                               ownersList = [],
                               submitting,
                               error,
                               onClose,
                               onSubmit,
                           }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [validationErrors, setValidationErrors] = useState({});

    const isEditMode = mode === "edit";

    useEffect(() => {
        if (!open) return;

        if (isEditMode && farm) {
            setForm({
                farmName: farm.farmName ?? "",
                location: farm.location ?? "",
                ownerId: farm.ownerId != null ? String(farm.ownerId) : "",
            });

            setValidationErrors({});
            return;
        }

        setForm(INITIAL_FORM);
        setValidationErrors({});
    }, [open, isEditMode, farm]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (validationErrors[name]) {
            setValidationErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    }

    function validate() {
        const errors = {};

        if (!form.farmName.trim()) {
            errors.farmName = "Tên nông trại không được để trống";
        }

        if (!form.location.trim()) {
            errors.location = "Địa chỉ không được để trống";
        }

        if (!form.ownerId || !String(form.ownerId).trim()) {
            errors.ownerId = "Vui lòng chọn chủ sở hữu";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!validate()) return;

        const payload = {
            farmName: form.farmName.trim(),
            location: form.location.trim(),
            ownerId: Number(form.ownerId),
        };

        onSubmit(payload);
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

            <aside className="absolute right-0 top-0 flex h-full w-[360px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 className="text-base font-semibold text-slate-900">
                        {isEditMode ? "Cập nhật Nông trại" : "Thêm Nông trại"}
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
                    <div className="flex-1 space-y-4 px-5 py-5">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Tên nông trại <span className="text-red-500">*</span>
                            </label>

                            <input
                                name="farmName"
                                value={form.farmName}
                                onChange={handleChange}
                                placeholder="Nhập tên nông trại..."
                                className={[
                                    "h-10 w-full rounded-lg border px-3 text-sm outline-none",
                                    "focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15",
                                    validationErrors.farmName
                                        ? "border-red-400"
                                        : "border-slate-300",
                                ].join(" ")}
                            />

                            {validationErrors.farmName && (
                                <p className="mt-1 text-xs text-red-500">
                                    {validationErrors.farmName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>

                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ nông trại..."
                                className={[
                                    "h-10 w-full rounded-lg border px-3 text-sm outline-none",
                                    "focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15",
                                    validationErrors.location
                                        ? "border-red-400"
                                        : "border-slate-300",
                                ].join(" ")}
                            />

                            {validationErrors.location && (
                                <p className="mt-1 text-xs text-red-500">
                                    {validationErrors.location}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Chủ sở hữu nông trại <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="ownerId"
                                value={form.ownerId}
                                onChange={handleChange}
                                className={[
                                    "h-10 w-full rounded-lg border px-3 text-sm outline-none bg-white",
                                    "focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15",
                                    validationErrors.ownerId
                                        ? "border-red-400"
                                        : "border-slate-300",
                                ].join(" ")}
                            >
                                <option value="">-- Chọn chủ sở hữu --</option>
                                {ownersList.map((owner) => (
                                    <option key={owner.id} value={owner.id}>
                                        {owner.fullName} ({owner.username}) {owner.farmName ? `[Đang quản lý ${owner.farmName}]` : ""}
                                    </option>
                                ))}
                            </select>

                            {validationErrors.ownerId && (
                                <p className="mt-1 text-xs text-red-500">
                                    {validationErrors.ownerId}
                                </p>
                            )}
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
                            {submitting ? "Đang lưu..." : "Lưu Nông trại"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}
