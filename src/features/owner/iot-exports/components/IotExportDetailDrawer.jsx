import { X } from "lucide-react";

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatQuantity(value, storageUnit) {
    const numberValue = Number(value || 0);

    if (storageUnit === "MILLILITER") {
        if (numberValue >= 1000) {
            return `${(numberValue / 1000).toLocaleString("vi-VN")} lít`;
        }

        return `${numberValue.toLocaleString("vi-VN")} ml`;
    }

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getBrowserAudioUrl(audioUrl) {
    if (!audioUrl) return "";

    return audioUrl
        .replace("http://98.86.116.216:8080/api", "/api")
        .replace("https://98.86.116.216:8080/api", "/api");
}

function DetailItem({ label, value, children }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
                {label}
            </p>

            <div className="mt-1 break-all text-sm font-medium text-slate-900">
                {children || value || <span className="text-slate-400">Chưa có</span>}
            </div>
        </div>
    );
}

export function IotExportDetailDrawer({
                                          open,
                                          scan,
                                          loading = false,
                                          onClose,
                                      }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng drawer"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[620px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Chi tiết xuất vật tư
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Ảnh scan, vật tư, mùa vụ, chi phí FIFO và voice phản hồi
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

                {loading ? (
                    <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
                        Đang tải chi tiết xuất vật tư...
                    </div>
                ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Transaction ID
                            </p>

                            <p className="mt-1 text-base font-semibold text-slate-900">
                                #{scan?.transactionId || "Chưa có"}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                Tạo lúc: {formatDateTime(scan?.createdAt)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Xác nhận: {formatDateTime(scan?.approvedAt)}
                            </p>
                        </section>

                        <section className="grid grid-cols-2 gap-3">
                            <DetailItem label="Vật tư" value={scan?.productName} />
                            <DetailItem label="Mã vật tư" value={scan?.productCode} />
                            <DetailItem label="Mùa vụ" value={scan?.seasonName} />
                            <DetailItem label="Season ID" value={scan?.seasonId} />

                            <DetailItem
                                label="Khối lượng"
                                value={formatQuantity(scan?.quantity ?? scan?.quantityGrams, scan?.storageUnit)}
                            />

                            <DetailItem label="Đơn vị lưu kho" value={scan?.storageUnit} />

                            <DetailItem
                                label="Đơn giá FIFO"
                                value={formatMoney(scan?.unitPrice)}
                            />

                            <DetailItem
                                label="Tổng chi phí"
                                value={formatMoney(scan?.totalAmount)}
                            />

                            <DetailItem label="Trạng thái" value={scan?.approvalStatus} />
                            <DetailItem label="AI status" value={scan?.aiStatus} />
                            <DetailItem label="QR type" value={scan?.qrType} />
                            <DetailItem label="QR value" value={scan?.qrCodeValue} />
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Audio message
                            </p>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                {scan?.audioMessage || "Chưa có"}
                            </p>

                            {scan?.audioUrl ? (
                                <audio
                                    controls
                                    src={getBrowserAudioUrl(scan.audioUrl)}
                                    className="mt-3 w-full"
                                />
                            ) : (
                                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                    Chưa có voice cho giao dịch này.
                                </p>
                            )}
                        </section>

                        {scan?.imageUrl && (
                            <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-medium uppercase text-slate-500">
                                        Ảnh scan
                                    </p>

                                    <a
                                        href={scan.imageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        Mở ảnh
                                    </a>
                                </div>

                                <img
                                    src={scan.imageUrl}
                                    alt="Ảnh scan xuất vật tư"
                                    className="mt-3 max-h-[300px] w-full rounded-lg border border-slate-200 object-contain"
                                />
                            </section>
                        )}
                    </div>
                )}

                <footer className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </footer>
            </aside>
        </div>
    );
}