import { useEffect, useState } from "react";
import { X } from "lucide-react";

const INITIAL_FORM = {
    seasonName: "",
    speciesId: "",
    startDate: "",
    endDate: "",
    expectedYieldKg: "",
    initialCapitalCost: "",
};

function Field({ label, helper, error, children }) {
    return (
        <div className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </span>
            <div className="mt-1">{children}</div>
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
            {helper && !error && (
                <p className="mt-1 text-xs text-slate-500">{helper}</p>
            )}
        </div>
    );
}

function inputClass(hasError = false) {
    return `h-10 w-full rounded-lg border ${
        hasError ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-[#006948] focus:ring-emerald-100"
    } bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2`;
}

export function SeasonCreateDrawer({
                                       open,
                                       speciesList = [],
                                       submitting = false,
                                       actionError = "",
                                       onClose,
                                       onSubmit,
                                   }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setForm(INITIAL_FORM);
            setErrors({});
        }
    }, [open]);

    if (!open) return null;

    function updateField(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    }

    function validate() {
        const tempErrors = {};
        if (!form.seasonName.trim()) tempErrors.seasonName = "Tên mùa vụ không được để trống";
        if (!form.speciesId) tempErrors.speciesId = "Vui lòng chọn loài nuôi trồng";
        if (!form.startDate) tempErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!form.endDate) tempErrors.endDate = "Vui lòng chọn ngày kết thúc dự kiến";

        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (end <= start) {
                tempErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
            }
        }

        if (!form.expectedYieldKg || Number(form.expectedYieldKg) <= 0) {
            tempErrors.expectedYieldKg = "Sản lượng dự kiến phải lớn hơn 0";
        }

        if (form.initialCapitalCost === "" || Number(form.initialCapitalCost) < 0) {
            tempErrors.initialCapitalCost = "Vốn đầu tư ban đầu không được âm";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!validate()) return;

        onSubmit?.({
            seasonName: form.seasonName.trim(),
            speciesId: Number(form.speciesId),
            startDate: form.startDate,
            endDate: form.endDate,
            expectedYieldKg: Number(form.expectedYieldKg),
            initialCapitalCost: Number(form.initialCapitalCost),
        });
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[520px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            Tạo mùa vụ mới
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Thiết lập kế hoạch mùa vụ cho nông trại của bạn.
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

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                        <Field label="Tên mùa vụ" error={errors.seasonName}>
                            <input
                                value={form.seasonName}
                                onChange={(e) => updateField("seasonName", e.target.value)}
                                className={inputClass(!!errors.seasonName)}
                                placeholder="Ví dụ: Mùa Vụ Tôm Thẻ Chân Trắng Xuân Hè 2026"
                            />
                        </Field>

                        <Field label="Loài nuôi trồng" error={errors.speciesId}>
                            <select
                                value={form.speciesId}
                                onChange={(e) => updateField("speciesId", e.target.value)}
                                className={inputClass(!!errors.speciesId)}
                            >
                                <option value="">-- Chọn loài --</option>
                                {speciesList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.categoryGroup})
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Ngày bắt đầu" error={errors.startDate}>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => updateField("startDate", e.target.value)}
                                    className={inputClass(!!errors.startDate)}
                                />
                            </Field>

                            <Field label="Kết thúc dự kiến" error={errors.endDate}>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => updateField("endDate", e.target.value)}
                                    className={inputClass(!!errors.endDate)}
                                />
                            </Field>
                        </div>

                        <Field
                            label="Sản lượng dự kiến (kg)"
                            error={errors.expectedYieldKg}
                            helper="Sản lượng kỳ vọng thu hoạch"
                        >
                            <input
                                type="number"
                                min="0.1"
                                step="any"
                                value={form.expectedYieldKg}
                                onChange={(e) => updateField("expectedYieldKg", e.target.value)}
                                className={inputClass(!!errors.expectedYieldKg)}
                                placeholder="Ví dụ: 5000"
                            />
                        </Field>

                        <Field
                            label="Vốn đầu tư ban đầu (₫)"
                            error={errors.initialCapitalCost}
                            helper="Ví dụ: tiền giống, cải tạo ao, chi phí chuẩn bị ban đầu"
                        >
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={form.initialCapitalCost}
                                onChange={(e) => updateField("initialCapitalCost", e.target.value)}
                                className={inputClass(!!errors.initialCapitalCost)}
                                placeholder="Ví dụ: 25000000"
                            />
                        </Field>

                        {actionError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {actionError}
                            </div>
                        )}
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:opacity-50"
                        >
                            {submitting ? "Đang xử lý..." : "Lên kế hoạch"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}
