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

function formatConfidence(value) {
    if (value === null || value === undefined || value === "") {
        return "Chưa có";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return "Chưa có";
    }

    if (numberValue <= 1) {
        return `${Math.round(numberValue * 100)}%`;
    }

    return `${Math.round(numberValue)}%`;
}

function isHarvestScan(scan) {
    return (
        scan?.requestedAction === "HARVEST" ||
        scan?.transactionType === "HARVEST_EXPORT"
    );
}

function getScanItemLabel(scan) {
    return isHarvestScan(scan) ? "Mùa vụ thu hoạch" : "Sản phẩm nhận diện";
}

function getScanItemName(scan) {
    if (isHarvestScan(scan)) {
        return scan?.seasonName || scan?.aiPredictedName || "Mùa vụ thu hoạch";
    }

    return scan?.aiPredictedName || scan?.productName || "Chưa nhận diện";
}

function getScanStatusLabel(scan) {
    if (!scan) return "Chưa có";

    if (isHarvestScan(scan)) {
        return "Đã ghi nhận thu hoạch";
    }

    if (scan.aiStatus === "CORRECTED") {
        return "Không nhận diện QR - đã nhập mã thủ công";
    }

    if (scan.needKeypadInput) {
        return "Không nhận diện QR - cần nhập mã keypad";
    }

    if (scan.aiStatus === "SUCCESS") {
        return "Nhận diện QR thành công";
    }

    if (scan.aiStatus === "UNRECOGNIZED") {
        return "Không nhận diện được QR";
    }

    if (scan.aiStatus === "LOW_CONFIDENCE") {
        return "Độ tin cậy thấp";
    }

    return scan.aiStatus || "Chưa có";
}

function getNextActionLabel(value) {
    const labels = {
        ENTER_KEYPAD_CODE: "Thiết bị cần nhập mã keypad",
        WAIT_OWNER_CONFIRM: "Chờ owner nhập giá tiền lô hàng",
        DONE: "Đã hoàn tất",
    };

    return labels[value] || value || "Chưa có";
}

function getKeypadLabel(scan) {
    if (!scan) return "Chưa có";

    if (isHarvestScan(scan)) {
        return "Không cần";
    }

    if (scan.aiStatus === "CORRECTED") {
        return "Đã nhập mã keypad";
    }

    return scan.needKeypadInput ? "Có" : "Không";
}

function formatWeight(value) {
    const numberValue = Number(value || 0);

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
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

function getBrowserAudioUrl(audioUrl) {
    if (!audioUrl) return "";

    return audioUrl
        .replace("http://98.86.116.216:8080/api", "/api")
        .replace("https://98.86.116.216:8080/api", "/api");
}

export function OwnerIotScanDetailDrawer({
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

            <aside className="absolute right-0 top-0 flex h-full w-[520px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Chi tiết scan IoT
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Ảnh scan, kết quả nhận diện và audio phản hồi
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
                        Đang tải chi tiết scan...
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
                                {formatDateTime(scan?.scannedAt)}
                            </p>
                        </section>

                        <section className="grid grid-cols-1 gap-3">
                            <DetailItem
                                label="Thiết bị"
                                value={scan?.deviceName || scan?.deviceId}
                            />

                            <DetailItem
                                label="Device ID"
                                value={scan?.deviceId}
                            />

                            <DetailItem
                                label={getScanItemLabel(scan)}
                                value={getScanItemName(scan)}
                            />

                            <DetailItem
                                label="Khối lượng"
                                value={formatWeight(scan?.weightGrams)}
                            />

                            <DetailItem
                                label="Trạng thái nhận diện"
                                value={getScanStatusLabel(scan)}
                            />

                            <DetailItem
                                label="Độ tin cậy"
                                value={formatConfidence(scan?.aiConfidence)}
                            />

                            <DetailItem
                                label="Keypad"
                                value={getKeypadLabel(scan)}
                            />

                            <DetailItem
                                label="Hành động tiếp theo"
                                value={getNextActionLabel(scan?.nextAction)}
                            />

                            <DetailItem label="Audio message">
                                <p className="whitespace-pre-line text-sm font-normal leading-6 text-slate-700">
                                    {scan?.audioMessage || "Chưa có"}
                                </p>
                            </DetailItem>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Voice phản hồi
                            </p>

                            {scan?.audioUrl ? (
                                <audio
                                    controls
                                    src={getBrowserAudioUrl(scan.audioUrl)}
                                    className="mt-3 w-full"
                                />
                            ) : (
                                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                    Chưa có file voice cho giao dịch này.
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
                                    alt="Ảnh scan IoT"
                                    className="mt-3 max-h-[260px] w-full rounded-lg border border-slate-200 object-contain"
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