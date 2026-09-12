import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const INITIAL_FORM = {
    seasonName: "",
    cropName: "",
    startDate: "",
    endDate: "",
    initialCapitalCost: "",
    expectedYieldKg: "",
    expectedPricePerKg: "",
    imageFile: null,
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

function formatEditableNumber(value) {
    if (value === null || value === undefined || value === "") return "";
    const normalized = String(value).replace(/,/g, ".");
    const [integerPart, decimalPart] = normalized.split(".");
    const formattedInteger = Number(integerPart || 0).toLocaleString("vi-VN");
    return decimalPart !== undefined ? `${formattedInteger},${decimalPart}` : formattedInteger;
}

function parseEditableNumber(value) {
    const normalized = String(value || "").replace(/\./g, "").replace(",", ".");
    return normalized.replace(/[^0-9.]/g, "");
}

function NumberInput({ value, onChange, className, ...props }) {
    return (
        <input
            {...props}
            type="text"
            inputMode="decimal"
            value={formatEditableNumber(value)}
            onChange={(event) => onChange(parseEditableNumber(event.target.value))}
            className={className}
        />
    );
}

export function SeasonCreateDrawer({
                                       open,
                                       submitting = false,
                                       actionError = "",
                                       onClose,
                                       onSubmit,
                                   }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            // Reset the create form when the drawer opens.
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
        if (!form.cropName.trim()) tempErrors.cropName = "Vui lòng nhập đối tượng nuôi trồng";
        if (!form.startDate) tempErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        if (!form.endDate) tempErrors.endDate = "Vui lòng chọn ngày kết thúc dự kiến";

        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (end <= start) {
                tempErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
            }
        }

        if (form.initialCapitalCost !== "" && Number(form.initialCapitalCost) < 0) {
            tempErrors.initialCapitalCost = "Vốn đầu tư ban đầu không được âm";
        }
        if (form.expectedYieldKg !== "" && Number(form.expectedYieldKg) <= 0) {
            tempErrors.expectedYieldKg = "Sản lượng dự kiến phải lớn hơn 0";
        }
        if (form.expectedPricePerKg !== "" && Number(form.expectedPricePerKg) <= 0) {
            tempErrors.expectedPricePerKg = "Giá bán dự kiến phải lớn hơn 0";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!validate()) return;

        onSubmit?.({
            seasonName: form.seasonName.trim(),
            cropName: form.cropName.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            initialCapitalCost: Number(form.initialCapitalCost),
            expectedYieldKg: form.expectedYieldKg === "" ? null : Number(form.expectedYieldKg),
            expectedPricePerKg: form.expectedPricePerKg === "" ? null : Number(form.expectedPricePerKg),
        }, form.imageFile);
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />

            <aside className="absolute right-0 top-0 flex h-full w-full lg:w-2/3 flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300">
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

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Sản lượng mục tiêu (kg) — tùy chọn" error={errors.expectedYieldKg} helper="Có thể bổ sung sau trong quá trình nuôi.">
                                <NumberInput
                                    min="0"
                                    value={form.expectedYieldKg}
                                    onChange={(value) => updateField("expectedYieldKg", value)}
                                    className={inputClass(!!errors.expectedYieldKg)}
                                    placeholder="Ví dụ: 1200"
                                />
                            </Field>
                            <Field label="Giá bán mục tiêu (₫/kg) — tùy chọn" error={errors.expectedPricePerKg} helper="Dùng để ước tính doanh thu/lợi nhuận khi đã có mục tiêu.">
                                <NumberInput
                                    min="0"
                                    value={form.expectedPricePerKg}
                                    onChange={(value) => updateField("expectedPricePerKg", value)}
                                    className={inputClass(!!errors.expectedPricePerKg)}
                                    placeholder="Ví dụ: 85000"
                                />
                            </Field>
                        </div>

                        <div className="block">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Ảnh đại diện mùa vụ
                            </span>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                                    {form.imageFile ? (
                                        <img 
                                            src={URL.createObjectURL(form.imageFile)} 
                                            alt="Preview" 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-slate-300" />
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <Upload size={16} />
                                        Chọn ảnh
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file && file.size > 20 * 1024 * 1024) {
                                                    setErrors((prev) => ({ ...prev, imageFile: "Kích thước ảnh không được vượt quá 20MB" }));
                                                    e.target.value = "";
                                                    return;
                                                }
                                                if (file) {
                                                    updateField("imageFile", file);
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Chấp nhận ảnh PNG, JPG, JPEG, WebP (tối đa 20MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Field label="Đối tượng nuôi trồng" error={errors.cropName} helper="Nhập tên loài hoặc đối tượng sản xuất của mùa vụ.">
                            <input
                                value={form.cropName}
                                onChange={(e) => updateField("cropName", e.target.value)}
                                className={inputClass(!!errors.cropName)}
                                placeholder="Ví dụ: Tôm thẻ chân trắng"
                            />
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
                            label="Vốn đầu tư ban đầu (₫)"
                            error={errors.initialCapitalCost}
                            helper="Ví dụ: tiền giống, cải tạo ao, chi phí chuẩn bị ban đầu"
                        >
                            <NumberInput
                                min="0"
                                value={form.initialCapitalCost}
                                onChange={(value) => updateField("initialCapitalCost", value)}
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
