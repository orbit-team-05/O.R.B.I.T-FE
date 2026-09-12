import { X, CheckCircle, XCircle, Inbox, PackageOpen, Edit2, Upload, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDateTime } from "../../../../utils/formatUtils";
import { useState, useEffect, useRef } from "react";
import { ImagePreviewModal } from "../../../../components/ui/ImagePreviewModal";
import { uploadInventoryEvidence } from "../services/inventoryEvidenceApi";
import { useToast } from "../../../../components/common/toast/ToastProvider";

function parseLocalizedNumber(value) {
    return Number(String(value ?? "").replace(/\./g, "").replace(",", "."));
}

export function ApproveTransactionDrawer({ transaction, open, onClose, onApprove, onReject }) {
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [approvalNote, setApprovalNote] = useState("");
    
    // Edit state
    const [editData, setEditData] = useState({
        quantityKg: "",
        unitPrice: "",
        evidenceImageUrl: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (transaction && open) {
            // Synchronize the approval form with the selected transaction.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditData({
                quantityKg: transaction.quantityKg || "",
                unitPrice: transaction.unitPrice || "",
                evidenceImageUrl: transaction.evidenceImageUrl || ""
            });
            setImageFile(null);
            setImagePreviewUrl(transaction.evidenceImageUrl || null);
            setIsEditing(false);
            setApprovalNote("");
        }
    }, [transaction, open]);

    if (!transaction) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 20MB");
                return;
            }
            if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
                toast.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP");
                return;
            }
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreviewUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreviewUrl(null);
        setEditData(prev => ({ ...prev, evidenceImageUrl: "" }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAction = async (action) => {
        if (action === "reject" && !approvalNote.trim()) {
            toast.error("Vui lòng nhập lý do từ chối giao dịch.");
            return;
        }
        setSubmitting(true);
        try {
            let success = false;
            if (action === 'approve') {
                if (isEditing) {
                    let uploadedUrl = editData.evidenceImageUrl;
                    if (imageFile) {
                        uploadedUrl = await uploadInventoryEvidence(imageFile);
                    }
                    
                    const quantityKg = parseLocalizedNumber(editData.quantityKg);
                    const unitPrice = editData.unitPrice === "" || editData.unitPrice == null
                        ? null
                        : parseLocalizedNumber(editData.unitPrice);
                    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
                        toast.error("Số lượng phải lớn hơn 0.");
                        return;
                    }
                    if (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice <= 0)) {
                        toast.error("Đơn giá phải lớn hơn 0.");
                        return;
                    }
                    const updates = {
                        quantityGrams: transaction.storageUnit === "PIECE" ? quantityKg : quantityKg * 1000,
                        unitPrice,
                        evidenceImageUrl: uploadedUrl,
                        approvalNote
                    };
                    success = await onApprove(transaction.id, updates);
                } else {
                    success = await onApprove(transaction.id, { approvalNote });
                }
            } else {
                success = await onReject(transaction.id, { approvalNote });
            }
            if (success) onClose();
        } catch (error) {
            toast.error("Có lỗi xảy ra: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case "IMPORT":
                return { label: "Nhập kho", color: "text-blue-700 bg-blue-50 border-blue-200", icon: Inbox };
            case "EXPORT_FEED":
            case "HARVEST_EXPORT":
                return { label: "Xuất kho", color: "text-orange-700 bg-orange-50 border-orange-200", icon: PackageOpen };
            case "PRODUCT_SALE":
                return { label: "Bán từ kho sản phẩm", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: PackageOpen };
            case "HARVEST_IN":
                return { label: "Lưu kho thu hoạch", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: Inbox };
            default:
                return { label: type, color: "text-slate-700 bg-slate-50 border-slate-200", icon: PackageOpen };
        }
    };

    const config = getTypeConfig(transaction.transactionType);
    const Icon = config.icon;

    return (
        <>
            {open && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />}

            <div className={`fixed inset-y-0 right-0 z-50 flex w-full lg:w-2/3 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">Chi tiết giao dịch chờ duyệt</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                                <Edit2 size={16} /> Chỉnh sửa
                            </button>
                        )}
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                Hủy sửa
                            </button>
                        )}
                        <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${config.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">{transaction.productName}</h3>
                                <p className="text-sm text-slate-500">{config.label}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Số lượng</p>
                            {isEditing ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <input 
                                        type="text"
                                        inputMode="decimal"
                                        className="w-24 text-right rounded-lg border-slate-200 text-lg font-bold text-slate-900 focus:border-blue-500 focus:ring-blue-500" 
                                        value={editData.quantityKg} 
                                        onChange={e => setEditData({...editData, quantityKg: e.target.value})}
                                    />
                                    <span className="font-bold text-slate-900">{transaction.storageUnit === "PIECE" ? "cái" : "kg"}</span>
                                </div>
                            ) : (
                                <p className="text-xl font-bold text-slate-900">{Number(transaction.quantityKg || 0).toLocaleString("vi-VN")} {transaction.storageUnit === "PIECE" ? "cái" : transaction.storageUnit === "MILLILITER" ? "ml" : "kg"}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs font-medium text-slate-500">Danh mục</p>
                            <p className="mt-1 font-semibold text-slate-900">{transaction.productCategory}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs font-medium text-slate-500">Đơn giá</p>
                            {isEditing ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <input 
                                        type="text" 
                                        className="w-full rounded-lg border-slate-200 font-semibold text-slate-900 focus:border-blue-500 focus:ring-blue-500" 
                                        value={editData.unitPrice} 
                                        onChange={e => setEditData({...editData, unitPrice: e.target.value})}
                                    />
                                    <span className="text-slate-500">/{transaction.storageUnit === "PIECE" ? "cái" : "kg"}</span>
                                </div>
                            ) : (
                                <p className="mt-1 font-semibold text-slate-900">{formatCurrency(transaction.unitPrice)}/{transaction.storageUnit === "PIECE" ? "cái" : transaction.storageUnit === "MILLILITER" ? "ml" : "kg"}</p>
                            )}
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs font-medium text-slate-500">Người yêu cầu</p>
                            <p className="mt-1 font-semibold text-slate-900">{transaction.requestedBy}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-xs font-medium text-slate-500">Thời gian tạo</p>
                            <p className="mt-1 font-semibold text-slate-900">{formatDateTime(transaction.createdAt)}</p>
                        </div>
                    </div>

                    {(transaction.farmName || transaction.seasonName || transaction.deviceId || transaction.macAddress) && (
                        <div className="grid grid-cols-2 gap-4">
                            {transaction.farmName && <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">Trang trại</p><p className="mt-1 font-semibold text-slate-900">{transaction.farmName}</p></div>}
                            {transaction.seasonName && <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">Mùa vụ</p><p className="mt-1 font-semibold text-slate-900">{transaction.seasonName}</p></div>}
                            {transaction.deviceId && <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">Thiết bị cân</p><p className="mt-1 font-semibold text-slate-900">{transaction.deviceName || transaction.deviceId}</p><p className="mt-1 text-xs text-slate-500">{transaction.deviceId}{transaction.macAddress ? ` · ${transaction.macAddress}` : ""}</p></div>}
                            {transaction.requestedRole && <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">Vai trò người tạo</p><p className="mt-1 font-semibold text-slate-900">{transaction.requestedRole}</p></div>}
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="font-medium text-slate-900">Hình ảnh minh chứng</h4>
                        {isEditing ? (
                            <div className="space-y-4">
                                {imagePreviewUrl ? (
                                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                        <img 
                                            src={imagePreviewUrl} 
                                            alt="Minh chứng" 
                                            className="h-auto w-full object-contain max-h-[300px]"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-red-600 shadow-sm hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 hover:bg-slate-100 hover:border-slate-400 transition-colors"
                                    >
                                        <Upload className="mb-2 text-slate-400" size={24} />
                                        <p className="text-sm font-medium text-slate-600">Nhấn để tải ảnh lên</p>
                                        <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP (Tối đa 20MB)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                        ) : (
                            transaction.evidenceImageUrl ? (
                                <button 
                                    onClick={() => setPreviewImage(transaction.evidenceImageUrl)}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 w-full"
                                >
                                    <img 
                                        src={transaction.evidenceImageUrl} 
                                        alt="Minh chứng" 
                                        className="h-auto w-full object-contain max-h-[300px]"
                                    />
                                </button>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Không có hình ảnh</p>
                            )
                        )}
                    </div>

                    {transaction.certificateImageUrls?.length > 0 && (
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-slate-900">Ảnh chứng chỉ sản phẩm</h4>
                                <p className="mt-1 text-xs text-slate-500">{transaction.certificateImageUrls.length} ảnh được gửi kèm giao dịch lưu kho.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {transaction.certificateImageUrls.map((imageUrl, index) => (
                                    <button
                                        key={`${imageUrl}-${index}`}
                                        type="button"
                                        onClick={() => setPreviewImage(imageUrl)}
                                        className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-colors hover:border-[#006948]"
                                    >
                                        <img src={imageUrl} alt={`Chứng chỉ sản phẩm ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Ghi chú xử lý</label>
                        <textarea
                            value={approvalNote}
                            onChange={(event) => setApprovalNote(event.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="Ghi lý do duyệt, từ chối hoặc điều chỉnh giao dịch..."
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 bg-white p-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleAction('reject')}
                            disabled={submitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                            <XCircle size={20} />
                            Từ chối
                        </button>
                        <button
                            onClick={() => handleAction('approve')}
                            disabled={submitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006948] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#00583d] hover:shadow disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                            {isEditing ? "Cập nhật & Phê duyệt" : "Phê duyệt"}
                        </button>
                    </div>
                </div>
            </div>
            
            <ImagePreviewModal 
                open={!!previewImage} 
                src={previewImage} 
                onClose={() => setPreviewImage(null)} 
            />
        </>
    );
}
