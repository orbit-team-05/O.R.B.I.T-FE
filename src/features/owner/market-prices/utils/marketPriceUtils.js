const SOURCE_LABELS = [
    { keyword: "tepbac", label: "TEPBAC" },
    { keyword: "tonghop", label: "TONGHOP" },
    { keyword: "fruit", label: "FRUITVN" },
];

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

export function getSourceLabel(item = {}) {
    if (item.sourceCode) return String(item.sourceCode).toUpperCase();

    const rawSource = item.sourceName || item.sourceUrl || "";
    const normalizedSource = String(rawSource).toLowerCase();
    const matchedSource = SOURCE_LABELS.find(({ keyword }) =>
        normalizedSource.includes(keyword),
    );

    if (matchedSource) return matchedSource.label;

    try {
        const host = new URL(rawSource).hostname.replace(/^www\./, "");
        return host.split(".")[0]?.toUpperCase() || "NGUON";
    } catch {
        return rawSource ? String(rawSource).toUpperCase() : "NGUON";
    }
}

export function enrichMarketPrice(item = {}) {
    return {
        ...item,
        sourceLabel: getSourceLabel(item),
        priceChangeValue: getPriceChangeValue(item.priceChange),
    };
}
