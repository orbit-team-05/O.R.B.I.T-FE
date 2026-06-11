import { X } from "lucide-react";
import { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
    { label: "Tôm", value: "TOM" },
    { label: "Cá", value: "CA" },
    { label: "Trái cây", value: "TRAI_CAY" },
    { label: "Lúa gạo", value: "LUA_GAO" },
    { label: "Rau củ", value: "RAU_CU" },
    { label: "Khác", value: "KHAC" },
];

const INITIAL_FORM = {
    name: "",
    categoryGroup: "TOM",
    marketUnit: "kg",
};

export function SpeciesDrawer({
                                  open,
                                  mode = "create",
                                  species,
                                  submitting,
                                  error,
                                  onClose,
                                  onSubmit,
                              }) {
    const [form, setForm] = useState(INITIAL_FORM);

    const isEditMode = mode === "edit";

    useEffect(() => {
        if (!open) return;

        if (isEditMode && species) {
            setForm({
                name: species.name ?? "",
                categoryGroup: species.categoryGroup ?? "TOM",
                marketUnit: species.marketUnit ?? "kg",
            });

            return;
        }

        setForm(INITIAL_FORM);
    }, [open, isEditMode, species]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            name: form.name.trim(),
            categoryGroup: form.categoryGroup,
            marketUnit: form.marketUnit.trim(),
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
                        {isEditMode ? "Cập nhật Species" : "Thêm Species"}
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
                                Tên species
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nhập tên species..."
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Nhóm species
                            </label>

                            <select
                                name="categoryGroup"
                                value={form.categoryGroup}
                                onChange={handleChange}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Đơn vị thị trường
                            </label>

                            <input
                                name="marketUnit"
                                value={form.marketUnit}
                                onChange={handleChange}
                                placeholder="VD: kg, tấn, con..."
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
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
                            {submitting ? "Đang lưu..." : "Lưu Species"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}