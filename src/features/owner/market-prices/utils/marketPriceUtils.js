export function formatPrice(value) {
    if (value === null || value === undefined || value === "") return "-";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) return String(value);

    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
    }).format(numberValue);
}

export function formatPriceWithUnit(value, unit = "") {
    const formattedPrice = formatPrice(value);

    if (formattedPrice === "-") return formattedPrice;

    if (!unit) return formattedPrice;

    return `${formattedPrice} ${unit}`;
}

export function getPriceChangeValue(value) {
    if (value === null || value === undefined || value === "") return null;

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? null : numberValue;
}

export function formatPriceChange(value) {
    const numberValue = getPriceChangeValue(value);

    if (numberValue === null) return "-";

    return `${numberValue > 0 ? "+" : ""}${numberValue.toFixed(2)}%`;
}

export function enrichMarketPrice(item = {}) {
    return {
        ...item,
        priceChangeValue: getPriceChangeValue(item.priceChange),
    };
}
