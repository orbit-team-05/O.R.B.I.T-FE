import { useEffect, useState } from "react";
import { CalendarDays, Image as ImageIcon, MapPin, Ruler, Save, Store, UploadCloud } from "lucide-react";

import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import { FarmStatusBadge } from "../../../components/common/status/FarmStatusBadge";
import { ImagePreviewModal } from "../../../components/ui/ImagePreviewModal";
import { MapPickerModal } from "../../../components/map/MapPickerModal";
import { OwnerPageHeader } from "../common/OwnerPageHeader";
import { useToast } from "../../../components/common/toast/ToastProvider";
import {
    getMyFarm,
    updateMyFarm,
    uploadFarmImage,
} from "../../../features/owner/services/ownerFarmApi";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EMPTY_FORM = {
    farmName: "",
    location: "",
    areaM2: "",
    latitude: null,
    longitude: null,
    imageUrl: "",
    active: true,
    canEdit: false,
    createdAt: null,
    updatedAt: null,
};

function formatDate(value) {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

export function OwnerFarmPage() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        let mounted = true;

        getMyFarm()
            .then((data) => {
                if (!mounted) return;
                setFormData({
                    ...EMPTY_FORM,
                    farmName: data?.farmName || "",
                    location: data?.location || "",
                    areaM2: data?.areaM2 ?? "",
                    latitude: data?.latitude ?? null,
                    longitude: data?.longitude ?? null,
                    imageUrl: data?.imageUrl || "",
                    active: data?.active ?? data?.isActive ?? true,
                    canEdit: data?.canEdit ?? false,
                    createdAt: data?.createdAt || null,
                    updatedAt: data?.updatedAt || null,
                });
            })
            .catch((error) => toast.error(error?.response?.data?.message || "Không thể tải thông tin nông trại."))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [toast]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    }

    function handleLocationChange(event) {
        setFormData((previous) => ({
            ...previous,
            location: event.target.value,
            latitude: null,
            longitude: null,
        }));
    }

    function handleMapConfirm(location) {
        setFormData((previous) => ({
            ...previous,
            location: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
        }));
        setMapOpen(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!formData.canEdit) return;

        if (!formData.farmName.trim()) {
            toast.error("Tên nông trại không được để trống.");
            return;
        }

        if (formData.areaM2 !== "" && Number(formData.areaM2) < 0) {
            toast.error("Diện tích không được là số âm.");
            return;
        }

        if ((formData.latitude === null) !== (formData.longitude === null)) {
            toast.error("Vui lòng chọn lại đầy đủ vị trí trên bản đồ.");
            return;
        }

        try {
            setSaving(true);
            const updated = await updateMyFarm({
                farmName: formData.farmName.trim(),
                location: formData.location.trim() || null,
                areaM2: formData.areaM2 === "" ? null : Number(formData.areaM2),
                latitude: formData.latitude,
                longitude: formData.longitude,
            });
            setFormData((previous) => ({ ...previous, ...updated }));
            toast.success("Cập nhật thông tin nông trại thành công.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    }

    async function handleImageUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !formData.canEdit) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Ảnh chỉ hỗ trợ JPEG, PNG hoặc WebP.");
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Ảnh nông trại không được vượt quá 20MB.");
            return;
        }

        try {
            setUploadingImage(true);
            const updated = await uploadFarmImage(file);
            setFormData((previous) => ({ ...previous, ...updated }));
            toast.success("Tải ảnh nông trại thành công.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể tải ảnh lên.");
        } finally {
            setUploadingImage(false);
        }
    }

    if (loading) return <AdminPageSkeleton variant="settings" />;

    return (
        <section className="w-full space-y-5 animate-fade-in">
            <OwnerPageHeader title="Hồ sơ nông trại" description="Cập nhật thông tin và ảnh đại diện của Farm." />

            {!formData.active && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Farm đang ngừng hoạt động. Bạn chỉ có thể xem thông tin, mọi thao tác chỉnh sửa đang bị khóa.
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)]">
                <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <button
                            type="button"
                            onClick={() => formData.imageUrl && setPreviewOpen(true)}
                            className="group flex h-40 w-full max-w-[260px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                            aria-label="Xem ảnh nông trại"
                        >
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt={formData.farmName || "Ảnh nông trại"} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <ImageIcon className="h-12 w-12 text-slate-300" />
                            )}
                        </button>
                        <div className="mt-4 flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900">{formData.farmName || "Chưa đặt tên"}</h2>
                            <FarmStatusBadge active={formData.active} />
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {formData.location || "Chưa cập nhật địa chỉ"}
                        </p>
                        <label className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${formData.canEdit ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "cursor-not-allowed border-slate-200 text-slate-400"}`}>
                            <UploadCloud className="h-4 w-4" />
                            {uploadingImage ? "Đang tải..." : "Chọn ảnh"}
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={!formData.canEdit || uploadingImage} />
                        </label>
                        <p className="mt-2 text-xs text-slate-400">JPEG, PNG hoặc WebP · tối đa 20MB</p>
                    </div>

                    <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="flex items-center gap-2 text-slate-500"><Ruler className="h-4 w-4" /> Diện tích</dt>
                            <dd className="font-medium text-slate-800">{formData.areaM2 ? `${formData.areaM2} m²` : "Chưa cập nhật"}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" /> Ngày tạo</dt>
                            <dd className="text-right text-slate-700">{formatDate(formData.createdAt)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" /> Cập nhật</dt>
                            <dd className="text-right text-slate-700">{formatDate(formData.updatedAt)}</dd>
                        </div>
                    </dl>
                </aside>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Thông tin Farm</h2>
                            <p className="mt-1 text-xs text-slate-500">Các thay đổi sẽ được ghi nhận vào lịch sử hồ sơ.</p>
                        </div>
                        <Store className="h-5 w-5 text-emerald-700" />
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên nông trại <span className="text-red-500">*</span></label>
                            <input name="farmName" value={formData.farmName} onChange={handleChange} disabled={!formData.canEdit} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:bg-slate-100 disabled:text-slate-500" />
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                                <label className="block text-sm font-medium text-slate-700">Địa chỉ Farm</label>
                                <button type="button" onClick={() => setMapOpen(true)} disabled={!formData.canEdit} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400">Chọn trên bản đồ</button>
                            </div>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input name="location" value={formData.location} onChange={handleLocationChange} disabled={!formData.canEdit} placeholder="Nhập hoặc chọn địa chỉ" className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:bg-slate-100 disabled:text-slate-500" />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500">Bạn có thể tìm kiếm địa chỉ hoặc kéo marker đến vị trí chính xác.</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Diện tích hồ sơ</label>
                            <div className="relative">
                                <Ruler className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input type="number" name="areaM2" min="0" step="0.01" value={formData.areaM2} onChange={handleChange} disabled={!formData.canEdit} placeholder="Ví dụ: 10000" className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:bg-slate-100 disabled:text-slate-500" />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500">Đơn vị: mét vuông (m²)</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
                        <button type="submit" disabled={!formData.canEdit || saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                            <Save className="h-4 w-4" />
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>

            <ImagePreviewModal open={previewOpen} src={formData.imageUrl} onClose={() => setPreviewOpen(false)} />
            <MapPickerModal
                isOpen={mapOpen}
                onClose={() => setMapOpen(false)}
                onConfirm={handleMapConfirm}
                initialAddress={formData.location}
                initialLatitude={formData.latitude}
                initialLongitude={formData.longitude}
            />
        </section>
    );
}
