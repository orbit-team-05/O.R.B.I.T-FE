import { Filter, RotateCcw, Search } from "lucide-react";

const ACTION_OPTIONS = [
    ["IMPORT", "Nhập kho"],
    ["EXPORT_FEED", "Xuất thức ăn"],
    ["HARVEST", "Thu hoạch"],
];

const STATUS_OPTIONS = [
    ["PENDING", "Chờ duyệt"],
    ["APPROVED", "Đã duyệt"],
    ["AUTO_APPROVED", "Tự động duyệt"],
    ["REJECTED", "Từ chối"],
];

function Field({ label, children }) {
    return (
        <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">{label}</span>
            {children}
        </label>
    );
}

const inputClassName = "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/10";

export function AdminReportFilters({ filters, farms, loading, onChange, onSubmit, onReset }) {
    function update(name, value) {
        onChange((current) => ({ ...current, [name]: value }));
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="flex items-center gap-2">
                <Filter size={17} className="text-[#006948]" />
                <h2 className="text-base font-semibold text-slate-900">Bộ lọc báo cáo</h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Từ ngày">
                    <input className={inputClassName} type="date" value={filters.from} onChange={(event) => update("from", event.target.value)} required />
                </Field>
                <Field label="Đến ngày">
                    <input className={inputClassName} type="date" value={filters.to} onChange={(event) => update("to", event.target.value)} required />
                </Field>
                <Field label="Nông trại">
                    <select className={inputClassName} value={filters.farmId} onChange={(event) => update("farmId", event.target.value)}>
                        <option value="">Tất cả nông trại</option>
                        {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmName}</option>)}
                    </select>
                </Field>
                <Field label="Thiết bị cân">
                    <input className={inputClassName} value={filters.deviceId} onChange={(event) => update("deviceId", event.target.value)} placeholder="Ví dụ: SCALE-..." />
                </Field>
                <Field label="Loại giao dịch">
                    <select className={inputClassName} value={filters.requestedAction} onChange={(event) => update("requestedAction", event.target.value)}>
                        <option value="">Tất cả loại giao dịch</option>
                        {ACTION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </Field>
                <Field label="Trạng thái">
                    <select className={inputClassName} value={filters.approvalStatus} onChange={(event) => update("approvalStatus", event.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </Field>
                <Field label="Từ khóa">
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                        <input className={`${inputClassName} w-full pl-9`} value={filters.keyword} onChange={(event) => update("keyword", event.target.value)} placeholder="Farm, sản phẩm, người tạo, MAC..." />
                    </div>
                </Field>
                <div className="flex items-end gap-2">
                    <button type="submit" disabled={loading} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60">
                        <Search size={16} />
                        Lọc báo cáo
                    </button>
                    <button type="button" onClick={onReset} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50" title="Đặt lại bộ lọc">
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>
        </form>
    );
}
