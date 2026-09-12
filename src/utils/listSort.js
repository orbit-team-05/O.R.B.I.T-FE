export const SORT_DIRECTION = {
    ASC: "asc",
    DESC: "desc",
};

export function sortItems(items, sortKey, definitions = {}) {
    const definition = definitions[sortKey];
    if (!definition) return items;

    const direction = definition.direction === SORT_DIRECTION.DESC ? -1 : 1;
    return [...items].sort((left, right) => {
        const leftValue = definition.value(left);
        const rightValue = definition.value(right);

        if (leftValue == null && rightValue == null) return 0;
        if (leftValue == null) return 1;
        if (rightValue == null) return -1;
        if (typeof leftValue === "number" && typeof rightValue === "number") {
            return (leftValue - rightValue) * direction;
        }
        return String(leftValue).localeCompare(String(rightValue), "vi", {
            numeric: true,
            sensitivity: "base",
        }) * direction;
    });
}
