export function SortSelect({ value, onChange, options, label = "Sắp xếp" }) {
    return (
        <label className="inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="whitespace-nowrap">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>
    );
}
