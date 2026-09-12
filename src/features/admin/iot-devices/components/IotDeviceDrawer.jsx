import { ImagePlus, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";

const INITIAL_FORM = {
    deviceName: "",
    imageUrl: "",
};

export function IotDeviceDrawer({
    open,
    macRecord,
    submitting,
    uploadingImage,
    error,
    onClose,
    onUploadImage,
    onSubmit,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [localError, setLocalError] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);

    // Reset the draft whenever a different MAC record is opened.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!open) return;

        setLocalError("");
        setPreviewOpen(false);
        setForm({
            ...INITIAL_FORM,
            deviceName: macRecord?.macAddress ? `Cân ${macRecord.macAddress}` : "",
        });
        setPreviewUrl("");
    }, [open, macRecord]);
    /* eslint-enable react-hooks/set-state-in-effect */

    async function handleImageChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setLocalError("Chỉ chấp nhận file ảnh.");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setLocalError("Ảnh không được vượt quá 20MB.");
            return;
        }

        setLocalError("");
        setPreviewUrl(URL.createObjectURL(file));

        try {
            const imageUrl = await onUploadImage?.(file);
            setForm((current) => ({ ...current, imageUrl: imageUrl || "" }));
        } catch (uploadError) {
            setPreviewUrl("");
            setLocalError(uploadError?.message || "Không thể tải ảnh thiết bị.");
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        const deviceName = form.deviceName.trim();
        if (!deviceName) {
            setLocalError("Tên thiết bị cân không được để trống.");
            return;
        }

        onSubmit?.({
            deviceName,
            imageUrl: form.imageUrl || null,
        });
    }

    if (!open || !macRecord) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button type="button" aria-label="Đóng drawer" onClick={onClose} className="absolute inset-0 bg-slate-900/30" />

            <aside className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-slate-200 bg-white shadow-2xl">
                <header className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#006948]">Thiết bị chưa tạo</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">Tạo thiết bị cân</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        <X size={19} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                        {(localError || error) && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{localError || error}</div>
                        )}

                        <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Địa chỉ MAC đã phát hiện</p>
                            <p className="mt-2 font-mono text-xl font-bold tracking-wider text-[#006948]">{macRecord.macAddress}</p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">Sau khi tạo, thiết bị sẽ chuyển sang nhóm “Chưa gắn Farm” để Owner kích hoạt vào Farm bằng activation code.</p>
                        </section>

                        <label className="block">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Tên thiết bị cân</span>
                            <input value={form.deviceName} onChange={(event) => setForm({ ...form, deviceName: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100" placeholder="Ví dụ: Cân kho nguyên liệu A" />
                        </label>

                        <div>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Ảnh thiết bị cân</span>
                            <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                <div className="relative flex h-44 items-center justify-center">
                                    {previewUrl ? (
                                        <button type="button" onClick={() => setPreviewOpen(true)} className="h-full w-full cursor-zoom-in">
                                            <img src={previewUrl} alt="Xem trước thiết bị cân" className="h-full w-full object-contain" />
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <ImagePlus size={34} strokeWidth={1.4} />
                                            <p className="mt-2 text-xs">Chưa có ảnh thiết bị</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-3">
                                    <p className="text-xs text-slate-500">PNG/JPG/WebP, tối đa 20MB</p>
                                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                        <Upload size={14} />
                                        {uploadingImage ? "Đang tải..." : "Chọn ảnh"}
                                        <input type="file" accept="image/*" disabled={uploadingImage} onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button type="button" onClick={onClose} disabled={submitting || uploadingImage} className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
                        <button type="submit" disabled={submitting || uploadingImage} className="h-10 rounded-xl bg-[#006948] px-5 text-sm font-bold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60">
                            {submitting ? "Đang tạo..." : "Tạo thiết bị cân"}
                        </button>
                    </footer>
                </form>
            </aside>

            <ImagePreviewModal open={previewOpen} src={previewUrl} onClose={() => setPreviewOpen(false)} />
        </div>
    );
}
