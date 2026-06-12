import { X } from "lucide-react";
import QRCode from "react-qr-code";

const CATEGORY_LABELS = {
    FEED: "Thức ăn",
    MEDICINE: "Thuốc",
    CHEMICAL: "Hóa chất",
    MATERIAL: "Vật tư",
    HARVEST_PRODUCT: "Sản phẩm thu hoạch",
};

const STORAGE_UNIT_LABELS = {
    GRAM: "Gram (g)",
    MILLILITER: "Mililit (ml)",
};

const PACKAGING_TYPE_LABELS = {
    LOOSE: "Hàng rời",
    BAG: "Bao",
    JAR: "Hũ",
    BOTTLE: "Chai",
    CAN: "Can",
    BOX: "Thùng / Hộp",
    OTHER: "Khác",
};

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

export function OwnerProductDetailDrawer({
                                             open,
                                             product,
                                             onClose,
                                         }) {
    if (!open || !product) return null;

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
                            Chi tiết sản phẩm
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Thông tin danh mục, mã keypad và QR sản phẩm.
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
                            {product.productName}
                        </p>

                        <p className="mt-1 break-all text-xs text-[#006948]/80">
                            {product.productCode}
                        </p>
                    </section>

                    <section className="grid grid-cols-2 gap-3">
                        <InfoItem label="Product ID" value={product.id} />
                        <InfoItem label="Mã sản phẩm" value={product.productCode} />
                        <InfoItem label="Mã keypad" value={product.keypadCode} />
                        <InfoItem label="AI label" value={product.aiLabel} />
                        <InfoItem
                            label="Loại"
                            value={CATEGORY_LABELS[product.category] ?? product.category}
                        />
                        <InfoItem
                            label="Đơn vị"
                            value={STORAGE_UNIT_LABELS[product.storageUnit] ?? product.storageUnit}
                        />
                        <InfoItem
                            label="Đóng gói"
                            value={PACKAGING_TYPE_LABELS[product.packagingType] ?? product.packagingType}
                        />
                        <InfoItem label="Kiểu đo" value={product.measureMode} />
                        <InfoItem
                            label="Tồn tối thiểu"
                            value={formatNumber(product.minimumStockQuantity ?? product.minimumStockGrams)}
                        />
                        <InfoItem label="Ngày tạo" value={formatDateTime(product.createdAt)} />
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            QR sản phẩm
                        </p>

                        {product.productQrCodeValue ? (
                            <>
                                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                    <p className="break-all text-xs text-slate-600">
                                        {product.productQrCodeValue}
                                    </p>
                                </div>

                                <div className="mt-4 flex justify-center rounded-xl border border-slate-200 bg-white p-4">
                                    <QRCode value={product.productQrCodeValue} size={190} />
                                </div>

                                <p className="mt-3 text-xs text-slate-500">
                                    In QR này để dán lên kệ hoặc mẫu sản phẩm. QR này chỉ định danh sản phẩm, không tăng tồn kho.
                                </p>
                            </>
                        ) : (
                            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">
                                Sản phẩm này chưa có QR.
                            </div>
                        )}
                    </section>
                </div>

                <footer className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                    >
                        Đóng
                    </button>
                </footer>
            </aside>
        </div>
    );
}