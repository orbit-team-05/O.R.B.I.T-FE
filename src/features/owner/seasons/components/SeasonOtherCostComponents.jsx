import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, Edit2, Plus, X } from "lucide-react";
import { formatCurrency } from "../../../../utils/formatUtils";
import Pagination from "../../../../components/common/pagination/Pagination";

function formatDate(value) {
    if (!value) return "Chưa có";
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return String(value);
    }
}

export function SeasonOtherCostHistory({
    otherCosts = [],
    pageInfo,
    loading = false,
    onPageChange,
    totalOtherCost,
    onAdd,
    onEdit,
    onDelete,
    isCompleted = false
}) {
    const [fullImage, setFullImage] = useState(null);

    return (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Chi phí phát sinh
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Dữ liệu về các khoản chi phí khác phát sinh ngoài vật tư.
                    </p>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                    <div>
                        <p className="text-xs text-slate-500">Tổng chi phí phát sinh</p>
                        <p className="mt-0.5 text-sm font-bold text-red-600">
                            {formatCurrency(totalOtherCost)}
                        </p>
                    </div>
                    {!isCompleted && (
                        <button
                            type="button"
                            onClick={onAdd}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#006948] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#005c3f]"
                        >
                            <Plus size={14} /> Thêm chi phí
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Đang tải lịch sử chi phí phát sinh...
                </div>
            ) : otherCosts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có chi phí phát sinh nào trong mùa vụ này.
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <div className="max-h-[280px] overflow-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">Chi phí</th>
                                        <th className="px-3 py-2">Người thêm</th>
                                        <th className="px-3 py-2">Ngày thêm</th>
                                        <th className="px-3 py-2">Số tiền</th>
                                        <th className="px-3 py-2">Ảnh chứng từ</th>
                                        <th className="px-3 py-2 text-right">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {otherCosts.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-100 text-slate-700"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-slate-900 line-clamp-2 max-w-[200px]">
                                                    {item.description || "Không có mô tả"}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 text-xs">
                                                {item.createdByName || "Hệ thống"}
                                            </td>

                                            <td className="px-3 py-3 text-xs text-slate-500">
                                                {formatDate(item.createdAt)}
                                            </td>

                                            <td className="px-3 py-3 font-semibold text-red-600">
                                                {formatCurrency(item.amount)}
                                            </td>

                                            <td className="px-3 py-3">
                                                {item.receiptUrl ? (
                                                    <div 
                                                        className="h-10 w-10 cursor-pointer overflow-hidden rounded border border-slate-200 hover:border-[#006948]"
                                                        onClick={() => setFullImage(item.receiptUrl)}
                                                    >
                                                        <img src={item.receiptUrl} alt="Receipt" className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Không có</span>
                                                )}
                                            </td>

                                            <td className="px-3 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isCompleted && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => onEdit(item)}
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onDelete(item)}
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        page={pageInfo?.number}
                        totalPages={pageInfo?.totalPages}
                        totalElements={pageInfo?.totalElements ?? otherCosts.length}
                        loading={loading}
                        onPageChange={onPageChange}
                    />
                </>
            )}

            {fullImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setFullImage(null)}>
                    <div className="relative max-h-full max-w-4xl" onClick={e => e.stopPropagation()}>
                        <button 
                            className="absolute -right-10 -top-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
                            onClick={() => setFullImage(null)}
                        >
                            <X size={24} />
                        </button>
                        <img src={fullImage} alt="Full Receipt" className="max-h-[90vh] rounded-lg object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}

export function SeasonOtherCostModal({ open, onClose, onSave, submitting, initialData }) {
    const isEdit = !!initialData;
    const [form, setForm] = useState({
        cost: "",
        description: "",
        receiptFile: null
    });
    const [error, setError] = useState("");
    
    // For CurrencyInput
    const [displayCost, setDisplayCost] = useState("");

    useEffect(() => {
        if (open) {
            if (initialData) {
                // Synchronize the form with the cost being edited.
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setForm({
                    cost: String(initialData.cost),
                    description: initialData.description || "",
                    receiptFile: null
                });
                setDisplayCost(Number(initialData.cost).toLocaleString("vi-VN"));
            } else {
                setForm({ cost: "", description: "", receiptFile: null });
                setDisplayCost("");
            }
            setError("");
        }
    }, [open, initialData]);

    const handleCostChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setDisplayCost(rawValue ? Number(rawValue).toLocaleString("vi-VN") : "");
        setForm({ ...form, cost: rawValue });
    };

    const handleSave = () => {
        setError("");
        if (!form.cost || Number(form.cost) <= 0) {
            setError("Số tiền phải lớn hơn 0");
            return;
        }
        if (!form.description.trim()) {
            setError("Vui lòng nhập mô tả chi phí");
            return;
        }
        onSave({ amount: Number(form.cost), description: form.description }, form.receiptFile);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">
                    {isEdit ? "Cập nhật chi phí phát sinh" : "Thêm chi phí phát sinh"}
                </h3>

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500">Số tiền (₫) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={displayCost}
                            onChange={handleCostChange}
                            disabled={submitting}
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                            placeholder="Nhập số tiền..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500">Mô tả chi phí <span className="text-red-500">*</span></label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            disabled={submitting}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                            placeholder="Ghi chú về khoản chi phí phát sinh này..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500">Ảnh chứng từ (Tùy chọn)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                                {form.receiptFile ? (
                                    <img 
                                        src={URL.createObjectURL(form.receiptFile)} 
                                        alt="Preview" 
                                        className="h-full w-full object-cover"
                                    />
                                ) : (initialData?.receiptUrl ? (
                                    <img 
                                        src={initialData.receiptUrl} 
                                        alt="Current" 
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="h-6 w-6 text-slate-300" />
                                ))}
                            </div>
                            
                            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Upload className="h-4 w-4 text-slate-400" />
                                <span>Tải ảnh lên</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    disabled={submitting}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setForm({ ...form, receiptFile: e.target.files[0] });
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-red-600">{error}</p>
                    )}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSave}
                        className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#005c3f] disabled:opacity-50"
                    >
                        {submitting ? "Đang xử lý..." : "Lưu chi phí"}
                    </button>
                </div>
            </div>
        </div>
    );
}
