import { CalendarDays, Camera, Clock3, MapPin, Ruler, UploadCloud, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";

const INITIAL_FORM = {
    farmName: "",
    location: "",
    ownerId: "",
    areaM2: "",
    imageUrl: "",
};

function formatDate(value) {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

function FarmDetailView({ farm, onClose, onUploadImage }) {
    const [previewOpen, setPreviewOpen] = useState(false);

    function handleImageChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) onUploadImage?.(file);
    }

    const initials = (farm?.farmName || "F")
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label="Đóng chi tiết nông trại" className="fixed inset-0 bg-slate-950/25 backdrop-blur-[1px]" onClick={onClose} />
            <aside className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-farm-detail-title">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Hồ sơ nông trại</p>
                        <h2 id="admin-farm-detail-title" className="mt-1 text-xl font-semibold text-slate-900">Chi tiết nông trại</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng"><X size={21} /></button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex shrink-0 flex-col items-center gap-2">
                                <button type="button" disabled={!farm?.imageUrl} onClick={() => setPreviewOpen(true)} className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-xl font-semibold text-[#006948] shadow-sm disabled:cursor-default">
                                    {farm?.imageUrl ? <img src={farm.imageUrl} alt={farm.farmName || "Farm"} className="h-full w-full object-cover" /> : initials}
                                </button>
                                {onUploadImage && (
                                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-[#006948]/30 hover:text-[#006948]" title="Tải ảnh nông trại lên">
                                        <UploadCloud size={14} />
                                        Tải ảnh
                                        <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold text-slate-900">{farm?.farmName || "Chưa cập nhật"}</h3>
                                    <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", farm?.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"].join(" ")}>
                                        <span className={["h-1.5 w-1.5 rounded-full", farm?.isActive ? "bg-emerald-500" : "bg-slate-400"].join(" ")} />
                                        {farm?.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                                    </span>
                                </div>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} />{farm?.location || "Chưa cập nhật địa chỉ"}</p>
                                <p className="mt-2 text-xs text-slate-400">Nhấn vào ảnh để xem bản lớn. JPEG/PNG/WebP, tối đa 20MB</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-7">
                        <h4 className="text-sm font-semibold text-slate-900">Thông tin nông trại</h4>
                        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Chủ sở hữu</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><UserRound size={15} className="text-[#006948]" />{farm?.ownerName || "Chưa cập nhật"}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Diện tích</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><Ruler size={15} className="text-slate-400" />{farm?.areaM2 == null ? "Chưa cập nhật" : `${farm.areaM2} m²`}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email chủ sở hữu</p><p className="mt-1 text-sm text-slate-800">{farm?.ownerEmail || "Chưa cập nhật"}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Số nhân sự</p><p className="mt-1 text-sm text-slate-800">{farm?.staffCount ?? 0} người</p></div>
                        </div>
                    </section>

                    <section className="mt-7 border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-semibold text-slate-900">Thông tin hệ thống</h4>
                        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ngày tạo</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><CalendarDays size={15} className="text-slate-400" />{formatDate(farm?.createdAt)}</p></div>
                            <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cập nhật gần nhất</p><p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-800"><Clock3 size={15} className="text-slate-400" />{formatDate(farm?.updatedAt)}</p></div>
                        </div>
                    </section>
                </div>

                <footer className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl bg-[#006948] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00583d]">Đóng</button>
                </footer>
            </aside>
            <ImagePreviewModal open={previewOpen} src={farm?.imageUrl} onClose={() => setPreviewOpen(false)} />
        </div>
    );
}

export function FarmDrawer({
                               open,
                               mode = "create",
                               farm,
                               ownersList = [],
                               submitting,
                               error,
                               onClose,
                               onSubmit,
                               onUploadImage,
                           }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [validationErrors, setValidationErrors] = useState({});
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

    const isEditMode = mode === "edit";
    const isViewMode = mode === "view";

    useEffect(() => {
        if (!open) return;

        if ((isEditMode || isViewMode) && farm) {
            // Synchronize the panel form with the selected Farm detail.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                farmName: farm.farmName ?? "",
                location: farm.location ?? "",
                ownerId: farm.ownerId != null ? String(farm.ownerId) : "",
                areaM2: farm.areaM2 != null ? String(farm.areaM2) : "",
                imageUrl: farm.imageUrl ?? "",
            });

            setValidationErrors({});
            setImagePreviewOpen(false);
            return;
        }

        setForm(INITIAL_FORM);
        setValidationErrors({});
        setImagePreviewOpen(false);
    }, [open, isEditMode, isViewMode, farm]);

    function handleChange(event) {
        if (isViewMode) return;

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

        if (isViewMode) return;

        if (!validate()) return;

        const payload = {
            farmName: form.farmName.trim(),
            location: form.location.trim(),
            areaM2: form.areaM2 === "" ? null : Number(form.areaM2),
        };

        if (!isEditMode) {
            payload.ownerId = Number(form.ownerId);
        }

        onSubmit(payload);
    }

    if (!open) return null;

    if (isViewMode) {
        return <FarmDetailView farm={farm} onClose={onClose} onUploadImage={onUploadImage} />;
    }

    return (
        <div className="fixed inset-0 z-50" role="presentation">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside
                aria-labelledby="farm-drawer-title"
                aria-modal="true"
                className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl md:w-2/3"
                role="dialog"
            >
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <h2 id="farm-drawer-title" className="text-base font-semibold text-slate-900">
                        {isViewMode ? "Chi tiết Nông trại" : isEditMode ? "Cập nhật Nông trại" : "Thêm Nông trại"}
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

                        {(isViewMode || isEditMode) && (
                            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <button
                                    type="button"
                                    disabled={!form.imageUrl}
                                    onClick={() => setImagePreviewOpen(true)}
                                    className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-sm disabled:cursor-default"
                                    aria-label="Xem ảnh đại diện nông trại"
                                >
                                    {form.imageUrl ? (
                                        <img
                                            src={form.imageUrl}
                                            alt={`Ảnh đại diện của ${form.farmName || "nông trại"}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-500">Chưa có ảnh</span>
                                    )}
                                </button>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Ảnh đại diện nông trại</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Nhấn vào ảnh để xem bản lớn. JPEG/PNG/WebP, tối đa 20MB.
                                    </p>
                                    {!isViewMode && (
                                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-[#006948] hover:bg-emerald-50">
                                            <Camera size={14} />
                                            Tải ảnh lên
                                            <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; onUploadImage?.(file); }} />
                                        </label>
                                    )}
                                </div>
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
                                disabled={isViewMode}
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
                                disabled={isViewMode}
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
                                Diện tích (m²)
                            </label>

                            <input
                                name="areaM2"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.areaM2}
                                onChange={handleChange}
                                disabled={isViewMode}
                                placeholder="Chưa cập nhật"
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Chủ sở hữu nông trại <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="ownerId"
                                value={form.ownerId}
                                onChange={handleChange}
                                disabled={isEditMode || isViewMode}
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

                            {isEditMode && !isViewMode && (
                                <p className="mt-1 text-xs text-slate-500">
                                    Owner không đổi trong thao tác cập nhật Farm.
                                </p>
                            )}

                            {validationErrors.ownerId && (
                                <p className="mt-1 text-xs text-red-500">
                                    {validationErrors.ownerId}
                                </p>
                            )}
                        </div>
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                        {isViewMode ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                            >
                                Đóng
                            </button>
                        ) : (
                            <>
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
                            </>
                        )}
                    </footer>
                </form>
            </aside>

            <ImagePreviewModal
                open={imagePreviewOpen}
                src={form.imageUrl}
                onClose={() => setImagePreviewOpen(false)}
            />
        </div>
    );
}
