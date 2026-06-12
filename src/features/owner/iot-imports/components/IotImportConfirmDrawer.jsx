import { useEffect, useState } from "react";
import { X } from "lucide-react";

function formatWeight(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg/ml`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g/ml`;
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
    const [totalImportCost, setTotalImportCost] = useState("");

    useEffect(() => {
        if (open) {
            setTotalImportCost("");
        }
    }, [open, scan?.transactionId]);

    if (!open || !scan) return null;

    const canConfirm = Boolean(scan.productId) && Number(totalImportCost) >= 0;

    function handleSubmit(event) {
        event.preventDefault();

        if (!canConfirm) return;

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

            <aside className="absolute right-0 top-0 flex h-full w-[600px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Xác nhận nhập kho
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Nhập giá lô hàng để tạo batch và tăng tồn kho.
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
                                    Ảnh scan
                                </p>

                                <img
                                    src={scan.imageUrl}
                                    alt="Ảnh scan nhập kho"
                                    className="mt-3 max-h-[280px] w-full rounded-lg border border-slate-200 object-contain"
                                />
                            </section>
                        )}

                        <section className="grid grid-cols-2 gap-3">
                            <InfoItem label="Transaction" value={`#${scan.transactionId}`} />
                            <InfoItem label="Thời gian" value={formatDateTime(scan.scannedAt)} />
                            <InfoItem label="Thiết bị" value={scan.deviceName || scan.deviceId} />
                            <InfoItem label="Khối lượng" value={formatWeight(scan.weightGrams)} />
                            <InfoItem label="Mã QR" value={scan.qrCodeValue} />
                            <InfoItem label="Loại QR" value={scan.qrType} />
                            <InfoItem label="Mã sản phẩm" value={scan.productCode} />
                            <InfoItem label="Tên sản phẩm" value={scan.productName} />
                        </section>

                        {!scan.productId && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                Không nhận diện được sản phẩm. Cần quét lại QR sản phẩm hoặc xử lý hậu kiểm.
                            </div>
                        )}

                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <label className="text-xs font-medium uppercase text-slate-500">
                                Tổng tiền nhập lô
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={totalImportCost}
                                onChange={(event) => setTotalImportCost(event.target.value)}
                                placeholder="Ví dụ: 1500000"
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Hệ thống sẽ lấy tổng tiền nhập chia cho khối lượng cân để tính giá vốn cho batch.
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