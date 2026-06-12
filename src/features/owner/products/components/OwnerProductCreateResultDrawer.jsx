import { Download, ExternalLink, X } from "lucide-react";

function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
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

function QrCard({ title, code, imageUrl, helper }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        {title}
                    </p>

                    {helper && (
                        <p className="mt-1 text-xs text-slate-500">
                            {helper}
                        </p>
                    )}
                </div>

                {imageUrl && (
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <ExternalLink size={13} />
                        Mở
                    </a>
                )}
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="break-all text-xs text-slate-600">
                    {code || "Chưa có mã QR"}
                </p>
            </div>

            {imageUrl ? (
                <div className="mt-3 flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-44 w-44 object-contain"
                    />

                    <a
                        href={imageUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                    >
                        <Download size={15} />
                        Tải QR
                    </a>
                </div>
            ) : (
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                    Chưa có ảnh QR.
                </div>
            )}
        </div>
    );
}

export function OwnerProductCreateResultDrawer({
                                                   open,
                                                   result,
                                                   onClose,
                                               }) {
    if (!open || !result) return null;

    const packages = result.packages ?? [];

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
                            Tạo sản phẩm thành công
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Lưu lại mã sản phẩm, mã keypad và QR để dán lên lô hàng.
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

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <section className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                        <p className="text-sm font-semibold text-[#006948]">
                            Sản phẩm đã được tạo và nhập kho ban đầu.
                        </p>

                        <p className="mt-1 text-xs text-[#006948]/80">
                            Với chai/hũ/can, hệ thống sẽ sinh thêm QR cho từng package.
                        </p>
                    </section>

                    <section className="grid grid-cols-2 gap-3">
                        <InfoItem label="Product ID" value={result.productId} />
                        <InfoItem label="Mã sản phẩm" value={result.productCode} />
                        <InfoItem label="Tên sản phẩm" value={result.productName} />
                        <InfoItem label="Mã keypad" value={result.keypadCode} />
                        <InfoItem label="Đơn vị lưu kho" value={result.storageUnit} />
                        <InfoItem label="Dạng đóng gói" value={result.packagingType} />
                        <InfoItem label="Kiểu đo" value={result.measureMode} />
                        <InfoItem
                            label="Tồn kho tối thiểu"
                            value={formatNumber(result.minimumStockQuantity)}
                        />
                    </section>

                    <section className="grid grid-cols-2 gap-3">
                        <InfoItem label="Batch ID" value={result.batchId} />
                        <InfoItem label="Mã lô" value={result.batchCode} />
                        <InfoItem
                            label="Tổng số lượng"
                            value={formatNumber(result.totalNetQuantity)}
                        />
                        <InfoItem
                            label="Còn lại"
                            value={formatNumber(result.remainingNetQuantity)}
                        />
                        <InfoItem
                            label="Tổng tiền nhập"
                            value={`${formatNumber(result.totalImportCost)} đ`}
                        />
                        <InfoItem
                            label="Giá vốn / đơn vị"
                            value={`${formatNumber(result.unitCostPerQuantity)} đ`}
                        />
                    </section>

                    <QrCard
                        title="QR lô hàng"
                        code={result.batchQrCodeValue}
                        imageUrl={result.batchQrImageUrl}
                        helper="Dùng cho hàng rời, bao, thùng hoặc QR đại diện cho cả lô."
                    />

                    {packages.length > 0 && (
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    QR từng package
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Dùng cho chai, hũ, can cần cân trước/sau.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {packages.map((pkg) => (
                                    <QrCard
                                        key={pkg.packageId}
                                        title={pkg.packageCode}
                                        code={pkg.qrCodeValue}
                                        imageUrl={pkg.qrImageUrl}
                                        helper={`Dung lượng ban đầu: ${formatNumber(pkg.initialNetQuantity)}`}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {packages.length === 0 && (
                        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                            Sản phẩm này không cần QR từng package. Chỉ dùng QR lô hàng.
                        </section>
                    )}
                </div>

                <footer className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                    >
                        Hoàn tất
                    </button>
                </footer>
            </aside>
        </div>
    );
}