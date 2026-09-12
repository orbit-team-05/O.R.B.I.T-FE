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
