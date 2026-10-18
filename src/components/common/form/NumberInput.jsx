import { useEffect, useRef, useState } from "react";

export function formatNumberWithCommas(value) {
    if (value === null || value === undefined || value === "") return "";
    const str = String(value).replace(/,/g, "");
    if (str === "") return "";

    const parts = str.split(".");
    const integerPart = parts[0].replace(/\D/g, "");
    const formattedInteger = integerPart ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (parts.length > 1 ? "0" : "");

    if (parts.length > 1) {
        const decimalPart = parts[1].replace(/\D/g, "");
        return `${formattedInteger}.${decimalPart}`;
    }
    return formattedInteger;
}

export function parseRawNumber(value) {
    if (value === null || value === undefined || value === "") return "";
    const str = String(value).replace(/,/g, "");
    const parts = str.split(".");
    const integerPart = parts[0].replace(/\D/g, "");
    if (parts.length > 1) {
        const decimalPart = parts[1].replace(/\D/g, "");
        return `${integerPart}.${decimalPart}`;
    }
    return integerPart;
}

export function NumberInput({ value, onChange, className = "", placeholder = "", disabled = false, required = false, min, max, ...props }) {
    const inputRef = useRef(null);
    const [displayValue, setDisplayValue] = useState(() => formatNumberWithCommas(value));

    useEffect(() => {
        setDisplayValue(formatNumberWithCommas(value));
    }, [value]);

    const handleChange = (e) => {
        const input = e.target;
        const rawCursorPos = input.selectionStart || 0;
        const valBeforeCursor = input.value.slice(0, rawCursorPos);
        const digitsBeforeCursor = (valBeforeCursor.match(/[0-9.]/g) || []).length;

        const raw = parseRawNumber(input.value);
        const formatted = formatNumberWithCommas(input.value);
        setDisplayValue(formatted);
        onChange?.(raw);

        requestAnimationFrame(() => {
            if (!inputRef.current) return;
            let newCursorPos = 0;
            let count = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (/[0-9.]/.test(formatted[i])) {
                    count++;
                }
                if (count === digitsBeforeCursor) {
                    newCursorPos = i + 1;
                    break;
                }
            }
            if (digitsBeforeCursor === 0) newCursorPos = 0;
            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Backspace") {
            const input = e.target;
            const pos = input.selectionStart || 0;
            if (pos > 0 && input.selectionEnd === pos && input.value[pos - 1] === ",") {
                e.preventDefault();
                const newVal = input.value.slice(0, pos - 2) + input.value.slice(pos);
                const raw = parseRawNumber(newVal);
                const formatted = formatNumberWithCommas(newVal);
                setDisplayValue(formatted);
                onChange?.(raw);

                requestAnimationFrame(() => {
                    if (!inputRef.current) return;
                    const nextPos = Math.max(0, pos - 2);
                    inputRef.current.setSelectionRange(nextPos, nextPos);
                });
            }
        }
    };

    return (
        <input
            {...props}
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={className}
        />
    );
}
