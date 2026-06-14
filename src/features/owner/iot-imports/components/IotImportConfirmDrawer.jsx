import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

function formatWeight(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg/ml`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g/ml`;
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function InfoItem({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
                {label}
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                {value || "Chưa có"}
            </p>
        </div>
    );
}

export function IotImportConfirmDrawer({
                                           open,
                                           scan,
                                           submitting = false,
                                           actionError = "",
                                           onClose,
                                           onConfirm,
                                       }) {
    const [unitImportPrice, setUnitImportPrice] = useState("");
    const [packageCount, setPackageCount] = useState("1");

    useEffect(() => {
        if (open) {
            setUnitImportPrice("");
            setPackageCount("1");
        }
    }, [open, scan?.transactionId]);

    const totalImportCost = useMemo(() => {
        return Number(unitImportPrice || 0) * Number(packageCount || 0);
    }, [unitImportPrice, packageCount]);

    const totalWeight = useMemo(() => {
        return Number(scan?.weightGrams || 0) * Number(packageCount || 0);
    }, [scan?.weightGrams, packageCount]);

    if (!open || !scan) return null;

    const canConfirm =
        Boolean(scan.productId) &&
        Number(unitImportPrice) >= 0 &&
        Number(packageCount) > 0;

    function handleSubmit(event) {
        event.preventDefault();

        if (!canConfirm) return;

        // BE hiện tại đang nhận totalImportCost.
        // packageCount hiện dùng để tự tính tổng tiền trên FE.
        onConfirm?.(scan.transactionId, totalImportCost);
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[640px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Xác nhận lô nhập kho
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Nhập giá tiền để chuyển scan IoT thành lô tồn kho chính thức.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        {scan.imageUrl && (
                            <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Ảnh scan từ camera
                                </p>

                                <img
                                    src={scan.imageUrl}
                                    alt="Ảnh scan nhập kho"
                                    className="mt-3 max-h-[260px] w-full rounded-lg border border-slate-200 object-contain"
                                />
                            </section>
                        )}

                        <section className="grid grid-cols-2 gap-3">
                            <InfoItem label="Transaction" value={`#${scan.transactionId}`} />
                            <InfoItem label="Thời gian" value={formatDateTime(scan.scannedAt)} />
                            <InfoItem label="Thiết bị" value={scan.deviceName || scan.deviceId} />
                            <InfoItem label="Khối lượng cân" value={formatWeight(scan.weightGrams)} />
                            <InfoItem label="Mã sản phẩm" value={scan.productCode} />
                            <InfoItem label="Tên sản phẩm" value={scan.productName} />
                            <InfoItem label="Loại QR" value={scan.qrType} />
                            <InfoItem label="Mã QR" value={scan.qrCodeValue} />
                        </section>

                        {!scan.productId && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                Không nhận diện được sản phẩm. Thiết bị cần nhập keypadCode hoặc quét lại QR.
                            </div>
                        )}

                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <div className="grid grid-cols-2 gap-3">
                                <label>
                                    <span className="text-xs font-medium uppercase text-slate-500">
                                        Giá nhập / sản phẩm
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={unitImportPrice}
                                        onChange={(event) => setUnitImportPrice(event.target.value)}
                                        placeholder="Ví dụ: 120000"
                                        className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                                        required
                                    />
                                </label>

                                <label>
                                    <span className="text-xs font-medium uppercase text-slate-500">
                                        Số lượng cùng loại
                                    </span>

                                    <input
                                        type="number"
                                        min="1"
                                        value={packageCount}
                                        onChange={(event) => setPackageCount(event.target.value)}
                                        placeholder="Ví dụ: 10"
                                        className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                                        required
                                    />
                                </label>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-medium uppercase text-slate-500">
                                        Khối lượng tạm tính
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">
                                        {formatWeight(totalWeight)}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-emerald-50 px-4 py-3">
                                    <p className="text-xs font-medium uppercase text-slate-500">
                                        Tổng tiền nhập
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-[#006948]">
                                        {formatMoney(totalImportCost)}đ
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-amber-600">
                                Lưu ý: BE hiện tại mới nhận totalImportCost. Nếu muốn tồn kho cũng nhân theo số lượng,
                                cần sửa confirm API để nhận thêm packageCount.
                            </p>
                        </section>

                        {actionError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {actionError}
                            </div>
                        )}
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={!canConfirm || submitting}
                            className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Đang xác nhận..." : "Xác nhận nhập kho"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}