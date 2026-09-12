import { useEffect, useState } from "react";
import { Image, Pencil, Upload, X } from "lucide-react";

const CATEGORY_LABELS = { FEED: "Thức ăn", MEDICINE: "Thuốc", CHEMICAL: "Hóa chất", MATERIAL: "Vật tư", HARVEST_PRODUCT: "Sản phẩm thu hoạch" };
const STORAGE_UNIT_LABELS = { GRAM: "Gram (g)", MILLILITER: "Mililit (ml)", PIECE: "Cái / Bao / Chai / Lọ" };
const PACKAGING_LABELS = { LOOSE: "Hàng rời", BAG: "Bao", JAR: "Hũ", BOTTLE: "Chai", CAN: "Can", BOX: "Thùng / Hộp", OTHER: "Khác" };
const INITIAL_FORM = { productName: "", category: "CHEMICAL", storageUnit: "MILLILITER", packagingType: "BOTTLE", minimumStockQuantity: "" };

function formatDateTime(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
function formatNumber(value) { return value == null ? "0" : Number(value).toLocaleString("vi-VN"); }
function InfoItem({ label, value }) {
    return <div className="rounded-lg border border-slate-200 bg-white px-3 py-3"><p className="text-xs font-medium uppercase text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold text-slate-900">{value || "Chưa có"}</p></div>;
}
function inputClass() { return "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"; }

export function OwnerProductDetailDrawer({ open, product, onClose, onSave, onStatusChange, onUploadImage, submitting = false }) {
    const [editing, setEditing] = useState(false);
    const [imageOpen, setImageOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (product) {
            // Synchronize the edit form with the selected product detail.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({ productName: product.productName || "", category: product.category || "CHEMICAL", storageUnit: product.storageUnit || "MILLILITER", packagingType: product.packagingType || "OTHER", minimumStockQuantity: product.minimumStockQuantity ?? product.minimumStockGrams ?? "" });
            setEditing(false);
            setImageFile(null);
        }
    }, [product]);

    if (!open || !product) return null;

    async function handleSave(event) {
        event.preventDefault();
        const saved = await onSave?.(product.id, { ...form, productName: form.productName.trim(), minimumStockQuantity: Number(form.minimumStockQuantity || 0) });
        if (saved) setEditing(false);
    }
    async function handleImageChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) return window.alert("Ảnh sản phẩm không được vượt quá 20MB.");
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return window.alert("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.");
        setImageFile(file);
        const uploaded = await onUploadImage?.(product.id, file);
        if (uploaded) setImageFile(null);
    }

    return <div className="fixed inset-0 z-50">
        <button type="button" aria-label="Đóng drawer" onClick={onClose} className="absolute inset-0 bg-slate-900/20" />
        <aside className="absolute right-0 top-0 flex h-full w-full lg:max-w-[66.666667vw] flex-col border-l border-slate-200 bg-white shadow-xl">
            <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5"><div><p className="text-xs font-medium uppercase tracking-wide text-[#006948]">Danh mục sản phẩm</p><h2 className="mt-1 text-base font-semibold text-slate-900">{product.productName}</h2></div><div className="flex items-center gap-2"><button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Pencil size={15} />{editing ? "Xem chi tiết" : "Chỉnh sửa"}</button><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div></header>
            {editing ? <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-hidden"><div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <label className="block"><span className="text-xs font-medium uppercase text-slate-500">Tên sản phẩm</span><input required className={`${inputClass()} mt-1`} value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></label>
                <div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-xs font-medium uppercase text-slate-500">Loại</span><select className={`${inputClass()} mt-1`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block"><span className="text-xs font-medium uppercase text-slate-500">Đơn vị lưu kho</span><select className={`${inputClass()} mt-1`} value={form.storageUnit} onChange={(e) => setForm({ ...form, storageUnit: e.target.value })}>{Object.entries(STORAGE_UNIT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
                <div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-xs font-medium uppercase text-slate-500">Quy cách</span><select className={`${inputClass()} mt-1`} value={form.packagingType} onChange={(e) => setForm({ ...form, packagingType: e.target.value })}>{Object.entries(PACKAGING_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block"><span className="text-xs font-medium uppercase text-slate-500">Tồn tối thiểu</span><input required min="0" type="number" className={`${inputClass()} mt-1`} value={form.minimumStockQuantity} onChange={(e) => setForm({ ...form, minimumStockQuantity: e.target.value })} /></label></div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">Mã sản phẩm, keypad, QR và nhãn AI được hệ thống sinh tự động nên không chỉnh sửa tại đây.</div>
            </div><footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4"><button type="button" onClick={() => setEditing(false)} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm">Hủy</button><button disabled={submitting} className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Đang lưu..." : "Lưu thay đổi"}</button></footer></form> : <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <section className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === "INACTIVE" ? "bg-slate-200 text-slate-600" : "bg-emerald-600 text-white"}`}>{product.status === "INACTIVE" ? "Ngừng sử dụng" : "Đang sử dụng"}</span><span className="text-sm text-slate-600">{CATEGORY_LABELS[product.category] ?? product.category}</span></section>
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">{product.imageUrl ? <button type="button" onClick={() => setImageOpen(true)} className="block w-full cursor-zoom-in"><img src={product.imageUrl} alt={product.productName} className="max-h-64 w-full rounded-lg object-contain" /></button> : <div className="flex h-40 flex-col items-center justify-center text-slate-400"><Image size={34} /><span className="mt-2 text-sm">Chưa có ảnh sản phẩm</span></div>}<label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Upload size={15} />Thay ảnh (tối đa 20MB)<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} /></label>{imageFile && <span className="ml-2 text-xs text-slate-500">Đang tải...</span>}</section>
                <section className="grid grid-cols-2 gap-3"><InfoItem label="Mã sản phẩm" value={product.productCode} /><InfoItem label="Keypad" value={product.keypadCode} /><InfoItem label="Nhãn AI" value={product.aiLabel} /><InfoItem label="QR sản phẩm" value={product.productQrCodeValue} /><InfoItem label="Đơn vị" value={STORAGE_UNIT_LABELS[product.storageUnit] ?? product.storageUnit} /><InfoItem label="Quy cách" value={PACKAGING_LABELS[product.packagingType] ?? product.packagingType} /><InfoItem label="Tồn tối thiểu" value={formatNumber(product.minimumStockQuantity ?? product.minimumStockGrams)} /><InfoItem label="Ngày tạo" value={formatDateTime(product.createdAt)} /><InfoItem label="Cập nhật lần cuối" value={formatDateTime(product.updatedAt)} /></section>
                <button type="button" disabled={submitting} onClick={() => onStatusChange?.(product.id, product.status === "INACTIVE" ? "ACTIVE" : "INACTIVE")} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{product.status === "INACTIVE" ? "Kích hoạt lại sản phẩm" : "Ngừng sử dụng sản phẩm"}</button>
            </div>}
        </aside>
        {imageOpen && product.imageUrl && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-6" onClick={() => setImageOpen(false)}><button type="button" className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white" onClick={() => setImageOpen(false)}><X size={22} /></button><img src={product.imageUrl} alt={product.productName} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} /></div>}
    </div>;
}
