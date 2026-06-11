import { X } from "lucide-react";
import { useEffect, useState } from "react";

const SOURCE_GROUP_OPTIONS = [
    { label: "Thủy sản", value: "THUY_SAN" },
    { label: "Nông sản", value: "NONG_SAN" },
    { label: "Trái cây", value: "TRAI_CAY" },
    { label: "Tổng hợp", value: "TONG_HOP" },
    { label: "Khác", value: "KHAC" },
];

const VALID_SOURCE_GROUPS = SOURCE_GROUP_OPTIONS.map((item) => item.value);

const INITIAL_FORM = {
    sourceCode: "",
    sourceName: "",
    baseUrl: "",
    sourceGroup: "THUY_SAN",
};

export function MarketSourceDrawer({
                                       open,
                                       mode = "create",
                                       source,
                                       submitting,
                                       error,
                                       onClose,
                                       onSubmit,
                                   }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [localError, setLocalError] = useState("");

    const isEditMode = mode === "edit";

    useEffect(() => {
        if (!open) return;

        setLocalError("");

        if (isEditMode && source) {
            setForm({
                sourceCode: source.sourceCode ?? "",
                sourceName: source.sourceName ?? "",
                baseUrl: source.baseUrl ?? "",
                sourceGroup: source.sourceGroup ?? "THUY_SAN",
            });

            return;
        }

        setForm(INITIAL_FORM);
    }, [open, isEditMode, source]);

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
            sourceCode: form.sourceCode.trim().toUpperCase(),
            sourceName: form.sourceName.trim(),
            baseUrl: form.baseUrl.trim(),
            sourceGroup: form.sourceGroup,
        };

        if (!payload.sourceCode) {
            setLocalError("Mã nguồn không được để trống.");
            return;
        }

        if (!payload.sourceName) {
            setLocalError("Tên nguồn không được để trống.");
            return;
        }

        if (!VALID_SOURCE_GROUPS.includes(payload.sourceGroup)) {
            setLocalError("Nhóm nguồn không hợp lệ.");
            return;
        }

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

            <aside className="absolute right-0 top-0 flex h-full w-[380px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 className="text-base font-semibold text-slate-900">
                        {isEditMode ? "Cập nhật Nguồn dữ liệu" : "Thêm Nguồn dữ liệu"}
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
                        {(localError || error) && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {localError || error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Mã nguồn
                            </label>

                            <input
                                name="sourceCode"
                                value={form.sourceCode}
                                onChange={handleChange}
                                placeholder="VD: TEPBAC"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm uppercase outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Tên nguồn
                            </label>

                            <input
                                name="sourceName"
                                value={form.sourceName}
                                onChange={handleChange}
                                placeholder="VD: Tép Bạc"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Base URL
                            </label>

                            <input
                                name="baseUrl"
                                value={form.baseUrl}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Nhóm nguồn
                            </label>

                            <select
                                name="sourceGroup"
                                value={form.sourceGroup}
                                onChange={handleChange}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            >
                                {SOURCE_GROUP_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
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
                            {submitting ? "Đang lưu..." : "Lưu nguồn"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}