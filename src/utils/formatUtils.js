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
