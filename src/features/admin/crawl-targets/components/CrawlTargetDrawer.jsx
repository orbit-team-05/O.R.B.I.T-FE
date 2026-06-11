import { X } from "lucide-react";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
    sourceId: "",
    speciesId: "",
    targetName: "",
    targetUrl: "",
    defaultCategoryGroup: "TOM",
    defaultLocation: "Toàn quốc",
    defaultSizeCategory: "",
    defaultPriceUnit: "đ/kg",
    configJson: "",
};

const CATEGORY_GROUP_OPTIONS = [
    { label: "Tôm", value: "TOM" },
    { label: "Cá", value: "CA" },
    { label: "Trái cây", value: "TRAI_CAY" },
    { label: "Lúa gạo", value: "LUA_GAO" },
    { label: "Rau củ", value: "RAU_CU" },
    { label: "Khác", value: "KHAC" },
];

export function CrawlTargetDrawer({
                                      open,
                                      mode = "create",
                                      target,
                                      sourceOptions = [],
                                      speciesOptions = [],
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

        if (isEditMode && target) {
            setForm({
                sourceId: String(target.sourceId ?? ""),
                speciesId: String(target.speciesId ?? ""),
                targetName: target.targetName ?? "",
                targetUrl: target.targetUrl ?? "",
                defaultCategoryGroup: target.defaultCategoryGroup || "TOM",
                defaultLocation: target.defaultLocation || "Toàn quốc",
                defaultSizeCategory: target.defaultSizeCategory ?? "",
                defaultPriceUnit: target.defaultPriceUnit ?? "đ/kg",
                configJson:
                    typeof target.configJson === "string"
                        ? target.configJson
                        : "",
            });

            return;
        }

        setForm(INITIAL_FORM);
    }, [open, isEditMode, target]);

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
            sourceId: Number(form.sourceId),
            speciesId: Number(form.speciesId),
            targetName: form.targetName.trim(),
            targetUrl: form.targetUrl.trim(),
            defaultCategoryGroup: form.defaultCategoryGroup.trim(),
            defaultLocation: form.defaultLocation.trim() || "Toàn quốc",
            defaultSizeCategory: form.defaultSizeCategory.trim(),
            defaultPriceUnit: form.defaultPriceUnit.trim(),
            configJson: form.configJson.trim(),
        };

        if (!payload.sourceId) {
            setLocalError("Source ID không được để trống.");
            return;
        }

        if (!payload.speciesId) {
            setLocalError("Species ID không được để trống.");
            return;
        }

        if (!payload.targetName) {
            setLocalError("Tên target không được để trống.");
            return;
        }

        if (!payload.targetUrl) {
            setLocalError("Target URL không được để trống.");
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

            <aside className="absolute right-0 top-0 flex h-full w-[420px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 className="text-base font-semibold text-slate-900">
                        {isEditMode ? "Cập nhật Cấu hình Crawl" : "Thêm Cấu hình Crawl"}
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Nguồn dữ liệu
                                </label>

                                <select
                                    name="sourceId"
                                    value={form.sourceId}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                >
                                    <option value="">Chọn nguồn</option>

                                    {sourceOptions.map((source) => (
                                        <option key={source.id} value={source.id}>
                                            {source.sourceCode} - {source.sourceName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Species
                                </label>

                                <select
                                    name="speciesId"
                                    value={form.speciesId}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                >
                                    <option value="">Chọn species</option>

                                    {speciesOptions.map((species) => (
                                        <option key={species.id} value={species.id}>
                                            {species.name} ({species.categoryGroup})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Tên target
                            </label>

                            <input
                                name="targetName"
                                value={form.targetName}
                                onChange={handleChange}
                                placeholder="VD: Giá tôm từ Tép Bạc"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Target URL
                            </label>

                            <input
                                name="targetUrl"
                                value={form.targetUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/gia-tom"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Nhóm mặc định
                                </label>

                                <select
                                    name="defaultCategoryGroup"
                                    value={form.defaultCategoryGroup}
                                    onChange={handleChange}
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                >
                                    {CATEGORY_GROUP_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Khu vực mặc định
                                </label>

                                <input
                                    name="defaultLocation"
                                    value={form.defaultLocation}
                                    onChange={handleChange}
                                    placeholder="VD: Toàn quốc"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Size mặc định
                                </label>

                                <input
                                    name="defaultSizeCategory"
                                    value={form.defaultSizeCategory}
                                    onChange={handleChange}
                                    placeholder="VD: 20"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Đơn vị giá
                                </label>

                                <input
                                    name="defaultPriceUnit"
                                    value={form.defaultPriceUnit}
                                    onChange={handleChange}
                                    placeholder="VD: đ/kg"
                                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Config JSON
                            </label>

                            <textarea
                                name="configJson"
                                value={form.configJson}
                                onChange={handleChange}
                                rows={5}
                                placeholder='VD: {"priceSelector": ".price"}'
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
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
                            {submitting ? "Đang lưu..." : "Lưu target"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}