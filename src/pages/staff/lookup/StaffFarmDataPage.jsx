import { useMemo, useState } from "react";
import { Boxes, CalendarDays, Package, RefreshCw, Scale, Warehouse } from "lucide-react";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useStaffFarmData } from "../../../features/staff/farm-data/hooks/useStaffFarmData";
import { OwnerPageHeader } from "../../owner/common/OwnerPageHeader";
import { formatCurrency, formatNumber } from "../../../utils/formatUtils";
import { SortSelect } from "../../../components/common/sort/SortSelect";
import { sortItems } from "../../../utils/listSort";

const SEASON_STATUS = {
    PLANNING: ["Chuẩn bị", "bg-slate-100 text-slate-600"],
    ACTIVE: ["Đang nuôi", "bg-emerald-50 text-emerald-700"],
    HARVESTING: ["Đang thu hoạch", "bg-amber-50 text-amber-700"],
};

function formatDate(value) {
    if (!value) return "Chưa xác định";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function formatKg(value) {
    return `${formatNumber(Number(value || 0) / 1000)} kg`;
}

function getEnumLabel(value) {
    return String(value || "").replaceAll("_", " ") || "Chưa xác định";
}

function EmptySection({ children }) {
    return <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">{children}</div>;
}

function SummaryCard({ label, value, helper, icon: Icon, tone = "text-[#006948]" }) {
    return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">{label}</span>
            <Icon size={19} className={tone} strokeWidth={1.8} />
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-900">{formatNumber(value)}</p>
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>;
}

function SectionTitle({ icon: Icon, title, helper }) {
    return <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#006948]"><Icon size={19} strokeWidth={1.8} /></div>
        <div><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{helper}</p></div>
    </div>;
}

function ProductList({ products }) {
    const [sortKey, setSortKey] = useState("nameAsc");
    const sortedProducts = useMemo(() => sortItems(products, sortKey, {
        nameAsc: { value: (item) => item.productName, direction: "asc" },
        nameDesc: { value: (item) => item.productName, direction: "desc" },
        stock: { value: (item) => Number(item.minimumStockGrams || 0), direction: "desc" },
    }), [products, sortKey]);
    if (!products.length) return <EmptySection>Chưa có sản phẩm ACTIVE để tra cứu.</EmptySection>;
    return <div className="divide-y divide-slate-100">
        <div className="flex justify-end pb-3"><SortSelect value={sortKey} onChange={setSortKey} options={[{ value: "nameAsc", label: "Tên A → Z" }, { value: "nameDesc", label: "Tên Z → A" }, { value: "stock", label: "Tồn tối thiểu giảm dần" }]} /></div>
        {sortedProducts.map((product) => <div key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Package size={19} /></div>}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{product.productName || "Sản phẩm chưa đặt tên"}</p><p className="mt-1 truncate text-xs text-slate-500">{product.productCode || "Chưa có mã"} · {getEnumLabel(product.storageUnit)}</p></div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">ACTIVE</span>
        </div>)}
    </div>;
}

function SeasonList({ seasons }) {
    const [sortKey, setSortKey] = useState("startAsc");
    const sortedSeasons = useMemo(() => sortItems(seasons, sortKey, {
        startAsc: { value: (item) => new Date(item.startDate || 0).getTime(), direction: "asc" },
        nameAsc: { value: (item) => item.seasonName || item.cropName, direction: "asc" },
        status: { value: (item) => item.status, direction: "asc" },
    }), [seasons, sortKey]);
    if (!seasons.length) return <EmptySection>Chưa có mùa vụ đang vận hành.</EmptySection>;
    return <div className="space-y-3">
        <div className="flex justify-end"><SortSelect value={sortKey} onChange={setSortKey} options={[{ value: "startAsc", label: "Bắt đầu sớm nhất" }, { value: "nameAsc", label: "Tên A → Z" }, { value: "status", label: "Theo trạng thái" }]} /></div>
        {sortedSeasons.map((season) => { const [label, className] = SEASON_STATUS[season.status] || [season.status || "Không xác định", "bg-slate-100 text-slate-600"]; return <div key={season.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{season.seasonName || season.cropName || "Mùa vụ"}</p><p className="mt-1 text-xs text-slate-500">{season.seasonCode || "Chưa có mã"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{label}</span></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>Bắt đầu: <b className="font-medium text-slate-700">{formatDate(season.startDate)}</b></span><span>Kết thúc: <b className="font-medium text-slate-700">{formatDate(season.endDate || season.plannedEndDate)}</b></span></div>
        </div>; })}
    </div>;
}

function DeviceList({ devices }) {
    const [sortKey, setSortKey] = useState("nameAsc");
    const sortedDevices = useMemo(() => sortItems(devices, sortKey, {
        nameAsc: { value: (item) => item.deviceName || item.deviceId, direction: "asc" },
        nameDesc: { value: (item) => item.deviceName || item.deviceId, direction: "desc" },
        lastSeen: { value: (item) => new Date(item.lastSeenAt || 0).getTime(), direction: "desc" },
    }), [devices, sortKey]);
    if (!devices.length) return <EmptySection>Chưa có thiết bị cân ACTIVE.</EmptySection>;
    return <div className="divide-y divide-slate-100">
        <div className="flex justify-end pb-3"><SortSelect value={sortKey} onChange={setSortKey} options={[{ value: "nameAsc", label: "Tên A → Z" }, { value: "nameDesc", label: "Tên Z → A" }, { value: "lastSeen", label: "Hoạt động gần đây" }]} /></div>
        {sortedDevices.map((device) => <div key={device.id || device.deviceId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#006948]"><Scale size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{device.deviceName || device.deviceId}</p><p className="mt-1 truncate text-xs text-slate-500">{device.deviceId} · {device.macAddress || "Chưa có MAC"}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">ACTIVE</span></div>)}
    </div>;
}

function StockTable({ stocks }) {
    const [sortKey, setSortKey] = useState("nameAsc");
    const sortedStocks = useMemo(() => sortItems(stocks, sortKey, {
        nameAsc: { value: (item) => item.productName, direction: "asc" },
        quantityDesc: { value: (item) => Number(item.quantityGrams || 0), direction: "desc" },
        projectedDesc: { value: (item) => Number(item.projectedQuantityGrams || 0), direction: "desc" },
        lowStock: { value: (item) => item.lowStock ? 0 : 1, direction: "asc" },
    }), [sortKey, stocks]);
    if (!stocks.length) return <EmptySection>Kho chưa có dữ liệu tồn.</EmptySection>;
    return <div className="space-y-3"><div className="flex justify-end"><SortSelect value={sortKey} onChange={setSortKey} options={[{ value: "nameAsc", label: "Sản phẩm A → Z" }, { value: "quantityDesc", label: "Tồn thực tế giảm dần" }, { value: "projectedDesc", label: "Tồn dự kiến giảm dần" }, { value: "lowStock", label: "Ưu tiên sắp hết" }]} /></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 font-medium">Sản phẩm</th><th className="pb-3 font-medium">Tồn thực tế</th><th className="pb-3 font-medium">Tồn dự kiến</th><th className="pb-3 text-right font-medium">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{sortedStocks.map((stock) => <tr key={stock.stockId || stock.productId}><td className="py-3"><p className="font-medium text-slate-800">{stock.productName || "Sản phẩm"}</p><p className="mt-1 text-xs text-slate-500">{getEnumLabel(stock.storageUnit)}</p></td><td className="py-3 font-medium text-slate-700">{formatKg(stock.quantityGrams)}</td><td className="py-3 font-medium text-[#006948]">{formatKg(stock.projectedQuantityGrams)}</td><td className="py-3 text-right">{stock.lowStock ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Sắp hết</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Ổn định</span>}</td></tr>)}</tbody></table></div></div>;
}

function DataSkeleton() {
    return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div><div className="grid gap-6 xl:grid-cols-2"><div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" /><div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" /></div></div>;
}

export function StaffFarmDataPage() {
    const { user } = useAuth();
    const { data, loading, error, reload } = useStaffFarmData(user?.farmId);
    const [warehouse, setWarehouse] = useState("MATERIAL");
    const stocks = useMemo(() => warehouse === "PRODUCT" ? data?.productStocks || [] : data?.materialStocks || [], [data, warehouse]);
    const summary = warehouse === "PRODUCT" ? data?.productSummary : data?.materialSummary;
    const pendingTransactions = Number(data?.materialSummary?.pendingTransactions || 0) + Number(data?.productSummary?.pendingTransactions || 0);

    if (loading && !data) return <><OwnerPageHeader title="Tra cứu Farm" description="Dữ liệu vận hành chỉ đọc của Farm bạn đang làm việc." /><DataSkeleton /></>;

    return <section className="space-y-6 animate-fade-in">
        <OwnerPageHeader title="Tra cứu Farm" description="Xem nhanh danh mục, mùa vụ, thiết bị cân và tồn kho. Staff chỉ có quyền đọc dữ liệu." actions={<button type="button" onClick={reload} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Làm mới</button>} />
        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Sản phẩm ACTIVE" value={data?.products?.length || 0} helper="Sẵn sàng để chọn khi tạo giao dịch" icon={Package} /><SummaryCard label="Mùa vụ đang chạy" value={data?.seasons?.length || 0} helper="PLANNING, ACTIVE hoặc HARVESTING" icon={CalendarDays} /><SummaryCard label="Thiết bị cân ACTIVE" value={data?.devices?.length || 0} helper="Có thể lấy khối lượng mới nhất" icon={Scale} /><SummaryCard label="Giao dịch chờ duyệt" value={pendingTransactions} helper="Trên cả kho vật tư và kho sản phẩm" icon={Boxes} tone="text-amber-600" /></div>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={Package} title="Danh mục sản phẩm" helper="Chỉ hiển thị sản phẩm đang ACTIVE trong Farm." /><ProductList products={data?.products || []} /></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={CalendarDays} title="Mùa vụ đang vận hành" helper="Dùng để tham chiếu khi tạo giao dịch." /><SeasonList seasons={data?.seasons || []} /></section>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><SectionTitle icon={Warehouse} title="Tồn kho" helper="Tồn thực tế đã duyệt và tồn dự kiến bao gồm giao dịch chờ duyệt." /><div className="flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setWarehouse("MATERIAL")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${warehouse === "MATERIAL" ? "bg-white text-[#006948] shadow-sm" : "text-slate-500"}`}>Kho vật tư</button><button type="button" onClick={() => setWarehouse("PRODUCT")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${warehouse === "PRODUCT" ? "bg-white text-[#006948] shadow-sm" : "text-slate-500"}`}>Kho sản phẩm</button></div></div><div className="mb-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Số mặt hàng</p><p className="mt-1 font-semibold text-slate-800">{formatNumber(summary?.totalProducts || 0)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Sắp hết</p><p className="mt-1 font-semibold text-amber-700">{formatNumber(summary?.lowStockProducts || 0)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Giá trị tồn</p><p className="mt-1 font-semibold text-slate-800">{formatCurrency(summary?.inventoryValue || 0)}</p></div></div><StockTable stocks={stocks} /></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={Scale} title="Thiết bị cân đang hoạt động" helper="Staff chỉ xem trạng thái và thông tin nhận diện thiết bị." /><DeviceList devices={data?.devices || []} /></section>
    </section>;
}
