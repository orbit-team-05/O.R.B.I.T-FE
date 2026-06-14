import { useEffect, useState } from "react";
import { X, Edit2, Check, ArrowLeftRight, Trash2 } from "lucide-react";
import { SeasonStatusBadge } from "./SeasonStatusBadge";
import { ConfirmDialog } from "../../../../components/common/dialog/ConfirmDialog";

function formatDate(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function formatCurrency(value) {
    if (value == null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
}

function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
}

function inputClass(disabled = false) {
    return `h-10 w-full rounded-lg border ${
        disabled ? "border-slate-200 bg-slate-50 text-slate-500" : "border-slate-300 bg-white text-slate-900 focus:border-[#006948] focus:ring-emerald-100"
    } px-3 text-sm outline-none focus:ring-2`;
}

export function SeasonDetailDrawer({
                                       open,
                                       season,
                                       submitting = false,
                                       actionError = "",
                                       onClose,
                                       onUpdateSeason,
                                       onUpdateStatus,
                                       onCancelSeason,
                                   }) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        seasonName: "",
        startDate: "",
        plannedEndDate: "",
        seedCost: "",
        expectedYieldKg: "",
    });

    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: "",
        description: "",
        variant: "success",
        onConfirm: () => {},
    });

    useEffect(() => {
        if (open && season) {
            setForm({
                seasonName: season.seasonName || "",
                startDate: season.startDate || "",
                plannedEndDate: season.plannedEndDate || "",
                seedCost: season.seedCost || "",
                expectedYieldKg: season.expectedYieldKg || "",
            });
            setIsEditing(false);
        }
    }, [open, season]);

    if (!open || !season) return null;

    const isCompleted = season.status === "COMPLETED";
    const isPlanning = season.status === "PLANNING";
    const isActive = season.status === "ACTIVE";
    const isHarvesting = season.status === "HARVESTING";

    const editAllowed = !isCompleted;
    const isFieldDisabled = (fieldName) => {
        if (!isEditing) return true;
        if (isCompleted) return true;
        if (fieldName === "startDate" || fieldName === "seedCost") {
            return !isPlanning; // locked for ACTIVE and HARVESTING
        }
        return false;
    };

    function handleSave() {
        onUpdateSeason?.(season.id, {
            seasonName: form.seasonName.trim(),
            startDate: isFieldDisabled("startDate") ? undefined : form.startDate,
            plannedEndDate: form.plannedEndDate,
            seedCost: isFieldDisabled("seedCost") ? undefined : Number(form.seedCost),
            expectedYieldKg: Number(form.expectedYieldKg),
        }).then((res) => {
            if (res) {
                setIsEditing(false);
            }
        });
    }

    function triggerStatusChange(nextStatus, label) {
        if (nextStatus === "COMPLETED") {
            setConfirmDialog({
                open: true,
                title: "Hoàn thành mùa vụ",
                description: `Bạn có chắc chắn muốn hoàn thành mùa vụ "${season.seasonName}"? Thao tác này sẽ khóa toàn bộ dữ liệu của mùa vụ và không thể hoàn tác.`,
                variant: "success",
                onConfirm: () => {
                    onUpdateStatus?.(season.id, nextStatus);
                    setConfirmDialog((prev) => ({ ...prev, open: false }));
                },
            });
        } else {
            onUpdateStatus?.(season.id, nextStatus);
        }
    }

    function triggerCancel() {
        setConfirmDialog({
            open: true,
            title: "Hủy mùa vụ",
            description: `Bạn có chắc chắn muốn hủy mùa vụ "${season.seasonName}"? Thao tác này sẽ ẩn mùa vụ khỏi danh sách hoạt động và không thể hoàn tác.`,
            variant: "danger",
            onConfirm: () => {
                onCancelSeason?.(season.id);
                setConfirmDialog((prev) => ({ ...prev, open: false }));
            },
        });
    }

    return (
        <>
            <div className="fixed inset-0 z-50">
                <button
                    type="button"
                    aria-label="Đóng chi tiết"
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                />

                <aside className="absolute right-0 top-0 flex h-full w-[580px] flex-col border-l border-slate-200 bg-white shadow-2xl">
                    <header className="flex h-16 items-center justify-between border-b border-slate-200 px-6 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-slate-900">
                                Chi tiết mùa vụ
                            </h2>
                            <SeasonStatusBadge status={season.status} />
                        </div>

                        <div className="flex items-center gap-2">
                            {editAllowed && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSave();
                                        } else {
                                            setIsEditing(true);
                                        }
                                    }}
                                    disabled={submitting}
                                    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition-colors ${
                                        isEditing
                                            ? "border-[#006948] bg-[#006948] text-white hover:bg-[#00583d]"
                                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {isEditing ? (
                                        <>
                                            <Check size={14} />
                                            Lưu thay đổi
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 size={14} />
                                            Chỉnh sửa
                                        </>
                                    )}
                                </button>
                            )}

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setForm({
                                            seasonName: season.seasonName || "",
                                            startDate: season.startDate || "",
                                            plannedEndDate: season.plannedEndDate || "",
                                            seedCost: season.seedCost || "",
                                            expectedYieldKg: season.expectedYieldKg || "",
                                        });
                                    }}
                                    disabled={submitting}
                                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                        {actionError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {actionError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Mã mùa vụ
                                </span>
                                <p className="mt-1 text-sm font-bold text-slate-950">
                                    {season.seasonCode}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Loài nuôi trồng
                                </span>
                                <p className="mt-1 text-sm font-bold text-slate-950">
                                    {season.speciesName}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Thông tin chung
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Tên mùa vụ</label>
                                    <input
                                        value={form.seasonName}
                                        onChange={(e) => setForm({ ...form, seasonName: e.target.value })}
                                        disabled={isFieldDisabled("seasonName")}
                                        className={inputClass(isFieldDisabled("seasonName"))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                            disabled={isFieldDisabled("startDate")}
                                            className={inputClass(isFieldDisabled("startDate"))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500">Ngày kết thúc dự kiến</label>
                                        <input
                                            type="date"
                                            value={form.plannedEndDate}
                                            onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })}
                                            disabled={isFieldDisabled("plannedEndDate")}
                                            className={inputClass(isFieldDisabled("plannedEndDate"))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Chi phí & Sản lượng
                            </h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500">Chi phí giống (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={form.seedCost}
                                            onChange={(e) => setForm({ ...form, seedCost: e.target.value })}
                                            disabled={isFieldDisabled("seedCost")}
                                            className={inputClass(isFieldDisabled("seedCost"))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500">Sản lượng dự kiến (kg)</label>
                                        <input
                                            type="number"
                                            value={form.expectedYieldKg}
                                            onChange={(e) => setForm({ ...form, expectedYieldKg: e.target.value })}
                                            disabled={isFieldDisabled("expectedYieldKg")}
                                            className={inputClass(isFieldDisabled("expectedYieldKg"))}
                                        />
                                    </div>
                                </div>

                                {!isEditing && (
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                                        <div>
                                            <span className="text-xs text-slate-500">Tổng chi phí tích lũy:</span>
                                            <p className="text-sm font-semibold text-red-600 mt-0.5">
                                                {formatCurrency(season.totalCost)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">Sản lượng thực tế:</span>
                                            <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                                                {formatNumber(season.actualYieldKg)} kg
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isEditing && (
                            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Tiến độ mùa vụ ({season.progress ?? 0}%)
                                </span>
                                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-[#006948] rounded-full transition-all duration-300"
                                        style={{ width: `${season.progress ?? 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Bắt đầu: {formatDate(season.startDate)}</span>
                                    <span>
                                        {isCompleted ? "Kết thúc: " : "Dự kiến: "}
                                        {formatDate(season.endDate || season.plannedEndDate)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {!isEditing && editAllowed && (
                            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Thao tác trạng thái
                                </span>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {isPlanning && (
                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange("ACTIVE", "Bắt đầu nuôi")}
                                            disabled={submitting}
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#006948] px-4 text-xs font-semibold text-white hover:bg-[#00583d]"
                                        >
                                            <ArrowLeftRight size={14} />
                                            Bắt đầu nuôi
                                        </button>
                                    )}

                                    {isActive && (
                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange("HARVESTING", "Bắt đầu thu hoạch")}
                                            disabled={submitting}
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700"
                                        >
                                            <ArrowLeftRight size={14} />
                                            Bắt đầu thu hoạch
                                        </button>
                                    )}

                                    {isHarvesting && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => triggerStatusChange("ACTIVE", "Quay lại nuôi")}
                                                disabled={submitting}
                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Quay lại nuôi
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => triggerStatusChange("COMPLETED", "Hoàn thành")}
                                                disabled={submitting}
                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
                                            >
                                                Hoàn thành mùa vụ
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={triggerCancel}
                                        disabled={submitting}
                                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 ml-auto"
                                    >
                                        <Trash2 size={14} />
                                        Hủy mùa vụ
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText="Xác nhận"
                cancelText="Quay lại"
                variant={confirmDialog.variant}
                loading={submitting}
                onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                onConfirm={confirmDialog.onConfirm}
            />
        </>
    );
}
