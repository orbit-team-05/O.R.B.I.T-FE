import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PRODUCT_CATEGORIES = [
    { value: "FEED", label: "Thức ăn" },
    { value: "MEDICINE", label: "Thuốc" },
    { value: "CHEMICAL", label: "Hóa chất" },
    { value: "MATERIAL", label: "Vật tư" },
    { value: "HARVEST_PRODUCT", label: "Sản phẩm thu hoạch" },
];

const STORAGE_UNITS = [
    { value: "GRAM", label: "Gram (g)" },
    { value: "MILLILITER", label: "Mililit (ml)" },
];

const PACKAGING_TYPES = [
    { value: "LOOSE", label: "Hàng rời" },
    { value: "BAG", label: "Bao" },
    { value: "JAR", label: "Hũ" },
    { value: "BOTTLE", label: "Chai" },
    { value: "CAN", label: "Can" },
    { value: "BOX", label: "Thùng / Hộp" },
    { value: "OTHER", label: "Khác" },
];

const INITIAL_FORM = {
    productName: "",
    category: "CHEMICAL",
    storageUnit: "MILLILITER",
    packagingType: "BOTTLE",
    minimumStockQuantity: "",
};

function Field({ label, helper, children }) {
    return (
        <label className="block">
            <span className="text-xs font-medium uppercase text-slate-500">
                {label}
            </span>

            <div className="mt-1">{children}</div>

            {helper && (
                <p className="mt-1 text-xs text-slate-500">
                    {helper}
                </p>
            )}
        </label>
    );
}

function inputClass() {
    return "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100";
}

export function OwnerProductCreateDrawer({
                                             open,
                                             submitting = false,
                                             actionError = "",
                                             onClose,
                                             onSubmit,
                                         }) {
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (open) {
            setForm(INITIAL_FORM);
        }
    }, [open]);

    if (!open) return null;

    function updateField(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        onSubmit?.({
            productName: form.productName.trim(),
            category: form.category,
            storageUnit: form.storageUnit,
            packagingType: form.packagingType,
            minimumStockQuantity: Number(form.minimumStockQuantity || 0),
        });
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[520px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Tạo sản phẩm mới
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Chỉ tạo danh mục sản phẩm và QR sản phẩm. Nhập lô sẽ làm riêng.
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
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        <Field label="Tên sản phẩm">
                            <input
                                value={form.productName}
                                onChange={(event) => updateField("productName", event.target.value)}
                                className={inputClass()}
                                placeholder="Ví dụ: Thuốc xử lý nước ABC 500ml"
                                required
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Loại sản phẩm">
                                <select
                                    value={form.category}
                                    onChange={(event) => updateField("category", event.target.value)}
                                    className={inputClass()}
                                >
                                    {PRODUCT_CATEGORIES.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Đơn vị lưu kho"
                                helper="Hệ thống lưu theo g hoặc ml. Ví dụ 1kg = 1000g, 1 lít = 1000ml."
                            >
                                <select
                                    value={form.storageUnit}
                                    onChange={(event) => updateField("storageUnit", event.target.value)}
                                    className={inputClass()}
                                >
                                    {STORAGE_UNITS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Dạng đóng gói">
                            <select
                                value={form.packagingType}
                                onChange={(event) => updateField("packagingType", event.target.value)}
                                className={inputClass()}
                            >
                                {PACKAGING_TYPES.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="Tồn kho tối thiểu"
                            helper="Nhập theo đơn vị đã chọn ở trên. GRAM là g, MILLILITER là ml."
                        >
                            <input
                                type="number"
                                min="0"
                                value={form.minimumStockQuantity}
                                onChange={(event) => updateField("minimumStockQuantity", event.target.value)}
                                className={inputClass()}
                                placeholder="Ví dụ: 1000"
                                required
                            />
                        </Field>

                        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            Form này không nhập số lượng lô, giá nhập hay số chai. Các thông tin đó sẽ nằm ở luồng Nhập lô.
                        </div>

                        {actionError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {actionError}
                            </div>
                        )}
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
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
                            {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}