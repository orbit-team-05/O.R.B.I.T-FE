import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

function formatWeight(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

function DetailItem({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
                {label}
            </p>

            <p className="mt-1 break-all text-sm font-medium text-slate-900">
                {value || <span className="text-slate-400">Chưa có</span>}
            </p>
        </div>
    );
}

export function OwnerAiReviewDrawer({
                                        open,
                                        review,
                                        products,
                                        productsLoading = false,
                                        submitting = false,
                                        actionError = "",
                                        onClose,
                                        onSubmit,
                                    }) {
    const [selectedProductId, setSelectedProductId] = useState("");

    useEffect(() => {
        if (open) {
            setSelectedProductId("");
        }
    }, [open, review?.transactionId]);

    if (!open) return null;

    function handleSubmit(event) {
        event.preventDefault();

        if (!selectedProductId) return;

        onSubmit?.(selectedProductId);
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[560px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Duyệt kết quả AI
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Chọn sản phẩm đúng cho giao dịch scan.
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

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Transaction ID
                            </p>

                            <p className="mt-1 text-base font-semibold text-slate-900">
                                #{review?.transactionId || "Chưa có"}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                {formatDateTime(review?.scannedAt)}
                            </p>
                        </section>

                        {review?.imageUrl && (
                            <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-medium uppercase text-slate-500">
                                        Ảnh scan
                                    </p>

                                    <a
                                        href={review.imageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        Mở ảnh
                                    </a>
                                </div>

                                <img
                                    src={review.imageUrl}
                                    alt="Ảnh scan cần duyệt"
                                    className="mt-3 max-h-[280px] w-full rounded-lg border border-slate-200 object-contain"
                                />
                            </section>
                        )}

                        <section className="grid grid-cols-1 gap-3">
                            <DetailItem
                                label="Thiết bị"
                                value={review?.deviceName || review?.deviceId}
                            />

                            <DetailItem
                                label="AI dự đoán"
                                value={review?.aiPredictedName}
                            />

                            <DetailItem
                                label="Trạng thái AI"
                                value={review?.aiStatus}
                            />

                            <DetailItem
                                label="Khối lượng"
                                value={formatWeight(review?.weightGrams)}
                            />
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <label className="text-xs font-medium uppercase text-slate-500">
                                Sản phẩm đúng
                            </label>

                            <select
                                value={selectedProductId}
                                onChange={(event) => setSelectedProductId(event.target.value)}
                                disabled={productsLoading || submitting}
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">
                                    {productsLoading
                                        ? "Đang tải sản phẩm..."
                                        : "Chọn sản phẩm"}
                                </option>

                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.productName}
                                        {product.keypadCode ? ` - Keypad ${product.keypadCode}` : ""}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-2 text-xs text-slate-500">
                                Sau khi duyệt, giao dịch sẽ được gán sản phẩm đúng và đánh dấu đã review.
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
                            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={!selectedProductId || submitting}
                            className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Đang duyệt..." : "Xác nhận duyệt"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}