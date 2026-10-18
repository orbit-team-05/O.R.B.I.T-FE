/**
 * Format helper for currency (VND) consistent with Vietnamese locale format.
 * Outputs: e.g. "150.000 ₫"
 */
export function formatCurrency(value) {
    if (value == null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
}

/**
 * Format helper for numbers (e.g. quantity, size) consistent with Vietnamese locale.
 * Outputs: e.g. "1.500"
 */
export function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
}

/**
 * Format helper for datetime consistent with Vietnamese locale.
 * Outputs: e.g. "14:30 12/05/2023"
 */
export function formatDateTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export const CATEGORY_LABELS = {
    FEED: "Thức ăn",
    MEDICINE: "Thuốc thú y",
    CHEMICAL: "Hóa chất",
    MATERIAL: "Vật tư khác",
    HARVEST_PRODUCT: "Sản phẩm thu hoạch",
};

export function formatCategory(category) {
    if (!category) return "—";
    return CATEGORY_LABELS[category] || category;
}

export const ROLE_LABELS = {
    OWNER: "Chủ trang trại",
    FARM_MANAGER: "Quản lý trang trại",
    STAFF: "Nhân viên",
    ADMIN: "Quản trị viên",
    TECHNICIAN: "Kỹ thuật viên",
    SYSTEM: "Hệ thống",
};

export function formatRole(role) {
    if (!role) return "—";
    return ROLE_LABELS[role] || role;
}

export const TRANSACTION_TYPE_LABELS = {
    IMPORT: "Nhập kho (Mua mới)",
    EXPORT_FEED: "Xuất kho sử dụng",
    HARVEST_EXPORT: "Bán khi thu hoạch",
    HARVEST_IN: "Lưu kho thu hoạch",
    RETURN_OUT: "Xuất trả NCC",
    RETURN_IN: "Hoàn trả vào kho",
    PRODUCT_SALE: "Bán từ kho sản phẩm",
    LEND: "Cho mượn",
    BORROW: "Vay mượn",
    IOT_SCAN: "Dữ liệu cân IoT",
};

export function formatTransactionType(type) {
    if (!type) return "—";
    return TRANSACTION_TYPE_LABELS[type] || type;
}

export const PACKAGING_TYPE_LABELS = {
    BAG: "bao",
    JAR: "hũ",
    BOTTLE: "chai",
    CAN: "can",
    BOX: "hộp",
    LOOSE: "cái",
    OTHER: "cái",
};

export const STORAGE_UNIT_LABELS = {
    KILOGRAM: "kg",
    GRAM: "g",
    MILLILITER: "ml",
    PIECE: "cái",
};

export function formatUnit(storageUnit, packagingType) {
    if (storageUnit === "PIECE") {
        return PACKAGING_TYPE_LABELS[packagingType] || "cái";
    }
    return STORAGE_UNIT_LABELS[storageUnit] || storageUnit?.toLowerCase() || "kg";
}

export const APPROVAL_STATUS_LABELS = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    AUTO_APPROVED: "Tự động duyệt",
    REJECTED: "Từ chối",
    CANCELLED: "Đã hủy",
};

export function formatApprovalStatus(status) {
    if (!status) return "—";
    return APPROVAL_STATUS_LABELS[status] || status;
}
