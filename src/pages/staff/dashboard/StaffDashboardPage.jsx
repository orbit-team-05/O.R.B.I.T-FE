import { ClipboardCheck, Clock3, RefreshCw, Scale, ShieldAlert, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { OwnerPageHeader } from "../../owner/common/OwnerPageHeader";
import { useStaffDashboard } from "../../../features/staff/dashboard/hooks/useStaffDashboard";
import { formatNumber } from "../../../utils/formatUtils";

function formatDateTime(value) {
    if (!value) return "Chưa có dữ liệu";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Chưa có dữ liệu" : date.toLocaleString("vi-VN");
}

function formatTransactionType(value) {
    return { IMPORT: "Nhập kho", EXPORT_FEED: "Xuất vật tư", HARVEST_EXPORT: "Bán thu hoạch", HARVEST_IN: "Lưu kho thu hoạch" }[value] || value || "Giao dịch";
}

function statusMeta(value) {
    return { PENDING: ["Chờ duyệt", "bg-amber-50 text-amber-700"], APPROVED: ["Đã duyệt", "bg-emerald-50 text-emerald-700"], AUTO_APPROVED: ["Đã duyệt", "bg-emerald-50 text-emerald-700"], REJECTED: ["Từ chối", "bg-red-50 text-red-700"] }[value] || ["Không xác định", "bg-slate-100 text-slate-600"];
}

function StatCard({ label, value, helper, icon: Icon, tone }) {
    return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={20} className={tone} /></div><p className="mt-3 text-3xl font-bold text-slate-900">{formatNumber(value)}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></article>;
}

function DashboardSkeleton() {
    return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div><div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" /></div>;
}

export function StaffDashboardPage() {
    const { data, loading, error, reload } = useStaffDashboard();

    if (loading && !data) return <><OwnerPageHeader title="Tổng quan Staff" description="Theo dõi nhanh các công việc vận hành của bạn trong Farm." /><DashboardSkeleton /></>;

    return <section className="space-y-6 animate-fade-in">
        <OwnerPageHeader title="Tổng quan Staff" description={data?.farmName ? `Farm: ${data.farmName}. Theo dõi giao dịch, thiết bị cân và mùa vụ đang vận hành.` : "Theo dõi nhanh các công việc vận hành của bạn trong Farm."} actions={<button type="button" onClick={reload} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Làm mới</button>} />
        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Giao dịch hôm nay" value={data?.todayTransactionCount ?? 0} helper="Do bạn tạo trong ngày" icon={ClipboardCheck} tone="text-[#006948]" />
            <StatCard label="Đang chờ duyệt" value={data?.pendingTransactionCount ?? 0} helper="Chưa cập nhật tồn thực tế" icon={Clock3} tone="text-amber-600" />
            <StatCard label="Đã được duyệt" value={data?.approvedTransactionCount ?? 0} helper="Tổng giao dịch của bạn" icon={ClipboardCheck} tone="text-emerald-600" />
            <StatCard label="Bị từ chối" value={data?.rejectedTransactionCount ?? 0} helper="Cần kiểm tra lý do" icon={ShieldAlert} tone="text-red-500" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Giao dịch gần đây</h2><p className="mt-1 text-xs text-slate-500">Chỉ hiển thị giao dịch do tài khoản của bạn tạo.</p></div><Link to="/staff/transactions" className="text-sm font-medium text-[#006948] hover:underline">Mở giao dịch</Link></div>{data?.recentTransactions?.length ? <div className="divide-y divide-slate-100">{data.recentTransactions.map((item) => { const [statusLabel, statusClass] = statusMeta(item.approvalStatus); return <div key={item.transactionId} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="font-medium text-slate-800">{formatTransactionType(item.transactionType)} · {item.productName || "Chưa có sản phẩm"}</p><p className="mt-1 text-xs text-slate-500">{item.seasonName || "Không gắn mùa vụ"} · {formatDateTime(item.createdAt)}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold text-slate-700">{formatNumber(Number(item.quantityGrams || 0) / 1000)} kg</span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{statusLabel}</span></div></div>; })}</div> : <div className="px-5 py-14 text-center text-sm text-slate-500">Chưa có giao dịch nào.</div>}</section>
            <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#006948]"><Scale size={20} /></div><div><h2 className="font-semibold text-slate-900">Cân gần nhất</h2><p className="text-xs text-slate-500">{data?.latestDeviceName || "Chưa có thiết bị"}</p></div></div><p className="mt-5 text-3xl font-bold text-slate-900">{data?.latestWeightGrams != null ? `${formatNumber(Number(data.latestWeightGrams) / 1000)} kg` : "Chưa có dữ liệu"}</p><p className="mt-1 text-xs text-slate-500">{data?.latestWeightAt ? `Cập nhật ${formatDateTime(data.latestWeightAt)}` : "Chưa nhận được khối lượng từ cân"}</p><Link to="/staff/devices" className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">Mở thiết bị cân</Link></section><section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="flex items-center gap-3"><Sprout size={20} className="text-[#006948]" /><h2 className="font-semibold text-[#006948]">Mùa vụ đang vận hành</h2></div><p className="mt-4 text-3xl font-bold text-[#006948]">{formatNumber(data?.activeSeasonCount ?? 0)}</p><p className="mt-1 text-xs text-emerald-800/70">ACTIVE hoặc HARVESTING trong Farm</p><Link to="/staff/lookup" className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#006948] px-3 text-xs font-semibold text-white hover:bg-[#00583d]">Tra cứu dữ liệu Farm</Link></section></div>
        </div>
    </section>;
}
