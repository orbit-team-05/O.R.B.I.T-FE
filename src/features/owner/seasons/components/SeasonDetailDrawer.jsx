import { useEffect, useState } from "react";
import { X, Edit2, Check, ArrowLeftRight, Trash2 } from "lucide-react";
import { SeasonStatusBadge } from "./SeasonStatusBadge";
import { ConfirmDialog } from "../../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../../components/common/toast/ToastProvider";

function formatDate(value) {
    if (!value) return "Chưa có";
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    } catch {
        return String(value);
    }
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

function formatQuantity(value, storageUnit) {
    const numberValue = Number(value || 0);

    if (storageUnit === "MILLILITER") {
        if (numberValue >= 1000) {
            return `${(numberValue / 1000).toLocaleString("vi-VN")} l`;
        }

        return `${numberValue.toLocaleString("vi-VN")} ml`;
    }

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

function inputClass(disabled = false) {
    return `h-10 w-full rounded-lg border ${disabled ? "border-slate-200 bg-slate-50 text-slate-500" : "border-slate-300 bg-white text-slate-900 focus:border-[#006948] focus:ring-emerald-100"
        } px-3 text-sm outline-none focus:ring-2`;
}

function SeasonHarvestHistory({
                                  harvests = [],
                                  pageInfo,
                                  loading = false,
                                  onPageChange,
                              }) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    const totalHarvestKg = harvests.reduce(
        (sum, item) => sum + Number(item.quantityKg || 0),
        0,
    );

    return (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Lịch sử thu hoạch
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Dữ liệu lấy từ các lần cân IoT thu hoạch của riêng mùa vụ này.
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-500">Tổng trong trang</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-700">
                        {formatNumber(totalHarvestKg)} kg
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Đang tải lịch sử thu hoạch...
                </div>
            ) : harvests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có giao dịch thu hoạch nào trong mùa vụ này.
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <div className="max-h-[280px] overflow-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Giao dịch</th>
                                    <th className="px-3 py-2">Khối lượng</th>
                                    <th className="px-3 py-2">Đơn giá</th>
                                    <th className="px-3 py-2">Doanh thu</th>
                                    <th className="px-3 py-2">Thiết bị</th>
                                    <th className="px-3 py-2">Ngày thu</th>
                                    <th className="px-3 py-2">Ảnh</th>
                                </tr>
                                </thead>

                                <tbody>
                                {harvests.map((item) => (
                                    <tr
                                        key={item.transactionId}
                                        className="border-t border-slate-100 text-slate-700"
                                    >
                                        <td className="px-3 py-3">
                                            <div className="font-semibold text-slate-900">
                                                Thu hoạch #{item.transactionId}
                                            </div>
                                            <div className="mt-0.5 text-xs text-slate-500">
                                                IoT Harvest Scan
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 font-medium text-emerald-700">
                                            {formatNumber(item.quantityKg)} kg
                                            <div className="mt-0.5 text-xs text-slate-400">
                                                {formatNumber(item.quantityGrams)} g
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            {formatCurrency(item.unitPrice)}
                                        </td>

                                        <td className="px-3 py-3 font-semibold text-emerald-700">
                                            {formatCurrency(item.totalAmount)}
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="font-medium text-slate-800">
                                                {item.deviceName || "Thiết bị IoT"}
                                            </div>
                                            <div className="mt-0.5 text-xs text-slate-500">
                                                {item.deviceId || "Không có mã"}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 text-xs text-slate-500">
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td className="px-3 py-3">
                                            {item.imageUrl ? (
                                                <a
                                                    href={item.imageUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    Mở ảnh
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                        Không có
                                                    </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo?.totalElements ?? harvests.length} giao dịch
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (!isFirstPage) onPageChange?.(currentPage - 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang {currentPage + 1} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (!isLastPage) onPageChange?.(currentPage + 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function SeasonMaterialUsageHistory({
    usages = [],
    pageInfo,
    loading = false,
    onPageChange,
    consumedMaterialCost,
}) {
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Vật tư đã xuất vào mùa vụ
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Dữ liệu lấy từ API lịch sử xuất vật tư theo riêng mùa vụ này.
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-500">Tổng chi phí vật tư</p>
                    <p className="mt-0.5 text-sm font-bold text-red-600">
                        {formatCurrency(consumedMaterialCost)}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Đang tải lịch sử vật tư...
                </div>
            ) : usages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có vật tư nào được xuất vào mùa vụ này.
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <div className="max-h-[280px] overflow-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">Vật tư</th>
                                        <th className="px-3 py-2">Khối lượng</th>
                                        <th className="px-3 py-2">Đơn giá</th>
                                        <th className="px-3 py-2">Thành tiền</th>
                                        <th className="px-3 py-2">Ngày xuất</th>
                                        <th className="px-3 py-2">Ảnh</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {usages.map((item) => (
                                        <tr
                                            key={item.transactionId}
                                            className="border-t border-slate-100 text-slate-700"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {item.productName || "Chưa có tên"}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500">
                                                    #{item.transactionId} · {item.productCode || "Không có mã"}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 font-medium">
                                                {formatQuantity(item.quantity, item.storageUnit)}
                                            </td>

                                            <td className="px-3 py-3">
                                                {formatCurrency(item.unitPrice)}
                                            </td>

                                            <td className="px-3 py-3 font-semibold text-red-600">
                                                {formatCurrency(item.totalAmount)}
                                            </td>

                                            <td className="px-3 py-3 text-xs text-slate-500">
                                                {formatDate(item.approvedAt || item.createdAt)}
                                            </td>

                                            <td className="px-3 py-3">
                                                {item.imageUrl ? (
                                                    <a
                                                        href={item.imageUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-semibold text-blue-600 hover:underline"
                                                    >
                                                        Mở ảnh
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Không có
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo?.totalElements ?? usages.length} giao dịch
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (!isFirstPage) onPageChange?.(currentPage - 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang {currentPage + 1} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (!isLastPage) onPageChange?.(currentPage + 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function SeasonDetailDrawer({
       open,
       season,
       materialUsages = [],
       materialUsagePageInfo,
       materialUsageLoading = false,
       onMaterialUsagePageChange,
       harvests = [],
       harvestPageInfo,
       harvestLoading = false,
       onHarvestPageChange,
    submitting = false,
    actionError = "",
    onClose,
    onUpdateSeason,
    onUpdateStatus,
    onCancelSeason,
    speciesSizes = [],
    loadSpeciesSizes,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        seasonName: "",
        startDate: "",
        plannedEndDate: "",
        expectedYieldKg: "",
        initialCapitalCost: "",
        actualYieldKg: "",
        sizeCategory: "",
    });

    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: "",
        description: "",
        variant: "success",
        onConfirm: () => { },
    });

    const [harvestPriceDialog, setHarvestPriceDialog] = useState({
        open: false,
        value: "",
        error: "",
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const toast = useToast();

    useEffect(() => {
        if (open && season) {
            setForm({
                seasonName: season.seasonName || "",
                startDate: season.startDate || "",
                plannedEndDate: season.plannedEndDate || "",
                expectedYieldKg: season.expectedYieldKg || "",
                initialCapitalCost: season.initialCapitalCost != null ? String(season.initialCapitalCost) : "",
                actualYieldKg: season.actualYieldKg != null ? String(season.actualYieldKg) : "",
                sizeCategory: season.sizeCategory || "",
            });
            setHarvestPriceDialog({
                open: false,
                value: "",
                error: "",
            });
            setIsEditing(false);
            setFieldErrors({});

            if (season.speciesId && loadSpeciesSizes) {
                loadSpeciesSizes(season.speciesId);
            }
        }
    }, [open, season, loadSpeciesSizes]);

    if (!open || !season) return null;

    const isCompleted = season.status === "COMPLETED";
    const isPlanning = season.status === "PLANNING";
    const isActive = season.status === "ACTIVE";
    const isHarvesting = season.status === "HARVESTING";

    const editAllowed = !isCompleted;
    const isFieldDisabled = (fieldName) => {
        if (!isEditing) return true;
        if (isCompleted) return true;
        if (fieldName === "startDate") {
            return !isPlanning; // locked for ACTIVE and HARVESTING
        }
        if (fieldName === "actualYieldKg") {
            return true; // actualYieldKg is read-only, calculated from IoT scale scans
        }
        return false;
    };

    function validate() {
        const errors = {};

        if (!form.seasonName.trim()) {
            errors.seasonName = "Tên mùa vụ không được để trống.";
        }

        if (form.plannedEndDate && form.startDate && form.plannedEndDate < form.startDate) {
            errors.plannedEndDate = "Ngày kết thúc dự kiến phải sau ngày bắt đầu.";
        }

        if (form.expectedYieldKg === "" || Number(form.expectedYieldKg) <= 0) {
            errors.expectedYieldKg = "Sản lượng dự kiến phải lớn hơn 0.";
        }

        if (form.initialCapitalCost === "" || Number(form.initialCapitalCost) < 0) {
            errors.initialCapitalCost = "Vốn đầu tư ban đầu không được âm.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleSave() {
        if (!validate()) return;
        onUpdateSeason?.(season.id, {
            seasonName: form.seasonName.trim(),
            startDate: isFieldDisabled("startDate") ? undefined : form.startDate,
            plannedEndDate: form.plannedEndDate,
            expectedYieldKg: Number(form.expectedYieldKg),
            initialCapitalCost: Number(form.initialCapitalCost),
            sizeCategory: form.sizeCategory.trim(),
        }).then((res) => {
            if (res) {
                setIsEditing(false);
            }
        });
    }

    const STATUS_CONFIRM_MAP = {
        ACTIVE: {
            title: "Bắt đầu nuôi",
            description: `Bạn có chắc chắn muốn chuyển mùa vụ "${season.seasonName}" sang trạng thái đang nuôi?`,
            variant: "success",
        },
        HARVESTING: {
            title: "Bắt đầu thu hoạch",
            description: `Bạn có chắc chắn muốn chuyển mùa vụ "${season.seasonName}" sang giai đoạn thu hoạch?`,
            variant: "success",
        },
        COMPLETED: {
            title: "Hoàn thành mùa vụ",
            description: `Bạn có chắc chắn muốn hoàn thành mùa vụ "${season.seasonName}"? Thao tác này sẽ khóa toàn bộ dữ liệu của mùa vụ và không thể hoàn tác.`,
            variant: "danger",
        },
    };

    function triggerStatusChange(nextStatus, label) {
        if (nextStatus === "COMPLETED") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(season.startDate);
            startDate.setHours(0, 0, 0, 0);

            if (startDate > today) {
                toast.error("Không thể hoàn thành mùa vụ trước ngày bắt đầu, vui lòng kiểm tra lại");
                return;
            }

            if (!season.consumedMaterialCost || Number(season.consumedMaterialCost) <= 0) {
                toast.error("Không thể hoàn thành mùa vụ khi chưa xuất vật tư nào (chi phí vật tư bằng 0).");
                return;
            }
        }

        if (nextStatus === "HARVESTING" && season.status === "ACTIVE") {
            setHarvestPriceDialog({
                open: true,
                value: "",
                error: "",
            });
            return;
        }
        const config = STATUS_CONFIRM_MAP[nextStatus] || {
            title: label,
            description: `Bạn có chắc chắn muốn thực hiện thao tác "${label}" cho mùa vụ "${season.seasonName}"?`,
            variant: "success",
        };
        setConfirmDialog({
            open: true,
            title: config.title,
            description: config.description,
            variant: config.variant,
            onConfirm: () => {
                onUpdateStatus?.(season.id, nextStatus);
                setConfirmDialog((prev) => ({ ...prev, open: false }));
            },
        });
    }

    function handleConfirmHarvestPrice() {
        const price = Number(harvestPriceDialog.value);

        if (!price || price <= 0) {
            setHarvestPriceDialog((prev) => ({
                ...prev,
                error: "Giá bán thực tế phải lớn hơn 0.",
            }));
            return;
        }

        onUpdateStatus?.(season.id, "HARVESTING", {
            harvestPricePerKg: price,
        })?.then((success) => {
            if (success) {
                setHarvestPriceDialog({
                    open: false,
                    value: "",
                    error: "",
                });
            }
        });
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
                                            setFieldErrors({});
                                            setIsEditing(true);
                                        }
                                    }}
                                    disabled={submitting}
                                    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition-colors ${isEditing
                                            ? "border-[#006948] bg-[#006948] text-white hover:bg-[#00583d]"
                                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    {isEditing ? (
                                        <>
                                            {submitting ? (
                                                <>
                                                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={14} />
                                                    Lưu thay đổi
                                                </>
                                            )}
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
                                        setFieldErrors({});
                                        setForm({
                                            seasonName: season.seasonName || "",
                                            startDate: season.startDate || "",
                                            plannedEndDate: season.plannedEndDate || "",
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
                                        className={`${inputClass(isFieldDisabled("seasonName"))} ${fieldErrors.seasonName ? "!border-red-400 !ring-red-100" : ""}`}
                                    />
                                    {fieldErrors.seasonName && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.seasonName}</p>
                                    )}
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
                                            className={`${inputClass(isFieldDisabled("plannedEndDate"))} ${fieldErrors.plannedEndDate ? "!border-red-400 !ring-red-100" : ""}`}
                                        />
                                        {fieldErrors.plannedEndDate && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.plannedEndDate}</p>
                                        )}
                                    </div>
                                    {season.endDate && (
                                        <div className="col-span-2">
                                            <label className="text-xs font-semibold text-slate-500">Ngày kết thúc thực tế</label>
                                            <input
                                                type="date"
                                                value={season.endDate}
                                                disabled={true}
                                                className={inputClass(true)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Chi phí & Sản lượng
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Sản lượng dự kiến (kg)</label>
                                    <input
                                        type="number"
                                        value={form.expectedYieldKg}
                                        onChange={(e) => setForm({ ...form, expectedYieldKg: e.target.value })}
                                        disabled={isFieldDisabled("expectedYieldKg")}
                                        className={`${inputClass(isFieldDisabled("expectedYieldKg"))} ${fieldErrors.expectedYieldKg ? "!border-red-400 !ring-red-100" : ""}`}
                                    />
                                    {fieldErrors.expectedYieldKg && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.expectedYieldKg}</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500">Vốn đầu tư ban đầu (₫)</label>
                                            <input
                                                type="number"
                                                value={form.initialCapitalCost}
                                                onChange={(e) => setForm({ ...form, initialCapitalCost: e.target.value })}
                                                disabled={isFieldDisabled("initialCapitalCost")}
                                                className={`${inputClass(isFieldDisabled("initialCapitalCost"))} ${fieldErrors.initialCapitalCost ? "!border-red-400 !ring-red-100" : ""}`}
                                            />
                                            {fieldErrors.initialCapitalCost && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors.initialCapitalCost}</p>
                                            )}
                                        </div>

                                        {isHarvesting && (
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500">Sản lượng thực tế (kg)</label>
                                                <input
                                                    type="number"
                                                    value={form.actualYieldKg}
                                                    onChange={(e) => setForm({ ...form, actualYieldKg: e.target.value })}
                                                    disabled={isFieldDisabled("actualYieldKg")}
                                                    className={`${inputClass(isFieldDisabled("actualYieldKg"))} ${fieldErrors.actualYieldKg ? "!border-red-400 !ring-red-100" : ""}`}
                                                />
                                                <p className="mt-1 text-[10px] text-slate-400 italic">Cập nhật tự động từ cân IoT</p>
                                                {fieldErrors.actualYieldKg && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.actualYieldKg}</p>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-xs font-semibold text-slate-500">Size (phân hạng)</label>
                                            <input
                                                list="size-suggestions"
                                                value={form.sizeCategory}
                                                onChange={(e) => setForm({ ...form, sizeCategory: e.target.value })}
                                                disabled={isFieldDisabled("sizeCategory")}
                                                placeholder="Ví dụ: 30 con/kg"
                                                className={inputClass(isFieldDisabled("sizeCategory"))}
                                            />
                                            <datalist id="size-suggestions">
                                                {speciesSizes.map(size => (
                                                    <option key={size} value={size} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                )}

                                {!isEditing && (
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                                        <div>
                                            <span className="text-xs text-slate-500">Vốn ban đầu:</span>
                                            <p className="mt-0.5 text-sm font-semibold text-orange-600">
                                                {formatCurrency(season.initialCapitalCost)}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs text-slate-500">Tổng đầu tư:</span>
                                            <p className="mt-0.5 text-sm font-semibold text-red-600">
                                                {formatCurrency(season.totalCost)}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs text-slate-500">Sản lượng thực tế:</span>
                                            <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                                                {formatNumber(season.actualYieldKg)} kg
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs text-slate-500">Giá bán thu hoạch:</span>
                                            <p className="mt-0.5 text-sm font-semibold text-blue-700">
                                                {season.harvestPricePerKg != null
                                                    ? `${formatCurrency(season.harvestPricePerKg)} / kg`
                                                    : "Chưa có"}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs text-slate-500">Size (phân hạng):</span>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                                {season.sizeCategory || "Chưa có"}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs text-slate-500">Giá thị trường (size):</span>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                                {season.marketPriceOfSize != null
                                                    ? `${formatCurrency(season.marketPriceOfSize)} / kg`
                                                    : "Chưa có"}
                                            </p>
                                        </div>

                                        <div className="col-span-2 border-t border-slate-100 pt-3">
                                            <span className="text-xs text-slate-500 font-semibold">Doanh thu dự kiến ({isHarvesting || isCompleted ? "sản lượng thực tế" : "sản lượng dự kiến"} * giá thị trường):</span>
                                            <p className="mt-0.5 text-base font-bold text-rose-600 animate-pulse">
                                                {season.estimatedRevenueOfCurrentYield != null
                                                    ? formatCurrency(season.estimatedRevenueOfCurrentYield)
                                                    : "Chưa đủ dữ liệu tính toán"}
                                            </p>
                                        </div>

                                        {season.estimatedHarvestRevenue != null && (
                                            <div className="col-span-2 border-t border-slate-100 pt-2">
                                                <span className="text-xs text-slate-500">Doanh thu ước tính theo giá thu hoạch:</span>
                                                <p className="mt-0.5 text-sm font-semibold text-rose-600">
                                                    {formatCurrency(season.estimatedHarvestRevenue)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isEditing && (
                            <SeasonHarvestHistory
                                harvests={harvests}
                                pageInfo={harvestPageInfo}
                                loading={harvestLoading}
                                onPageChange={onHarvestPageChange}
                            />
                        )}

                        {!isEditing && (
                            <SeasonMaterialUsageHistory
                                usages={materialUsages}
                                pageInfo={materialUsagePageInfo}
                                loading={materialUsageLoading}
                                onPageChange={onMaterialUsagePageChange}
                                consumedMaterialCost={season.consumedMaterialCost}
                            />
                        )}
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
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#006948] px-4 text-xs font-semibold text-white hover:bg-[#00583d] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? "Đang xử lý..." : (<><ArrowLeftRight size={14} /> Bắt đầu nuôi</>)}
                                        </button>
                                    )}

                                    {isActive && (
                                        <button
                                            type="button"
                                            onClick={() => triggerStatusChange("HARVESTING", "Bắt đầu thu hoạch")}
                                            disabled={submitting}
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? "Đang xử lý..." : (<><ArrowLeftRight size={14} /> Bắt đầu thu hoạch</>)}
                                        </button>
                                    )}

                                    {isHarvesting && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => triggerStatusChange("ACTIVE", "Quay lại nuôi")}
                                                disabled={submitting}
                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? "Đang xử lý..." : "Quay lại nuôi"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => triggerStatusChange("COMPLETED", "Hoàn thành")}
                                                disabled={submitting}
                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? "Đang xử lý..." : "Hoàn thành mùa vụ"}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={triggerCancel}
                                        disabled={submitting}
                                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Đang xử lý..." : (<><Trash2 size={14} /> Hủy mùa vụ</>)}
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

            {harvestPriceDialog.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <h3 className="text-base font-bold text-slate-900">
                            Nhập giá bán thực tế
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Giá này sẽ được dùng để tính doanh thu ước tính khi mùa vụ bước vào giai đoạn thu hoạch.
                        </p>

                        <div className="mt-4">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Giá bán thực tế (₫/kg)
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="any"
                                value={harvestPriceDialog.value}
                                onChange={(event) =>
                                    setHarvestPriceDialog((prev) => ({
                                        ...prev,
                                        value: event.target.value,
                                        error: "",
                                    }))
                                }
                                className={`mt-1 h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 ${harvestPriceDialog.error
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                        : "border-slate-300 focus:border-[#006948] focus:ring-emerald-100"
                                    }`}
                                placeholder="Ví dụ: 150000"
                            />

                            {harvestPriceDialog.error && (
                                <p className="mt-1 text-xs font-medium text-red-600">
                                    {harvestPriceDialog.error}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() =>
                                    setHarvestPriceDialog({
                                        open: false,
                                        value: "",
                                        error: "",
                                    })
                                }
                                className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleConfirmHarvestPrice}
                                className="h-9 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                                {submitting ? "Đang xử lý..." : "Bắt đầu thu hoạch"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
