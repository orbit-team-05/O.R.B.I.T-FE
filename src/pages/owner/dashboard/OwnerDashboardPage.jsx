import {
    Activity,
    AlertTriangle,
    ChartNoAxesCombined,
    FileText,
    Package,
    RefreshCw,
    Scale,
    TrendingUp,
    Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useOwnerDashboard } from "../../../features/owner/dashboard/hooks/useOwnerDashboard";
import { OwnerPageHeader } from "../common/OwnerPageHeader";
import { formatCurrency } from "../../../utils/formatUtils";

const STAT_ICON_MAP = {
    initialCapitalCost: {
        icon: Warehouse,
        color: "text-emerald-600",
    },
    totalSeasonCost: {
        icon: Package,
        color: "text-slate-600",
    },
    expectedRevenue: {
        icon: ChartNoAxesCombined,
        color: "text-blue-600",
    },
    estimatedNetProfit: {
        icon: TrendingUp,
        color: "text-red-500",
    },
};


function formatNumber(value) {
    if (value === null || value === undefined) return "-";

    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 2,
    }).format(Number(value));
}

function formatDateTime(value) {
    if (!value) return "Không hiển thị dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatRelativeTime(value) {
    if (!value) return "Không hiển thị dữ liệu";

    const dateValue = new Date(value);
    const diffMs = Date.now() - dateValue.getTime();

    if (Number.isNaN(diffMs)) {
        return "Không hiển thị dữ liệu";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 7) return `${diffDays} ngày trước`;

    return formatDateTime(value);
}

function getDeviceStatusMeta(status) {
    const normalizedStatus = String(status || "").toUpperCase();

    switch (normalizedStatus) {
        case "ACTIVE":
            return {
                label: "Đang hoạt động",
                className: "bg-green-100 text-green-700",
            };
        case "INACTIVE":
            return {
                label: "Tạm dừng",
                className: "bg-slate-100 text-slate-700",
            };
        case "LOST":
            return {
                label: "Mất kết nối",
                className: "bg-red-100 text-red-700",
            };
        case "UNASSIGNED":
            return {
                label: "Chưa kích hoạt",
                className: "bg-amber-100 text-amber-700",
            };
        default:
            return {
                label: "Không hiển thị dữ liệu",
                className: "bg-slate-100 text-slate-500",
            };
    }
}

function SectionEmptyState({
    message = "Không hiển thị dữ liệu",
    minHeight = 140,
}) {
    return (
        <div
            className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500"
            style={{ minHeight }}
        >
            {message}
        </div>
    );
}

function LoadingState({ minHeight = 140 }) {
    return (
        <div
            className="flex items-center justify-center"
            style={{ minHeight }}
        >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#006948]" />
        </div>
    );
}

function DashboardStatCard({ item }) {
    const iconConfig = STAT_ICON_MAP[item.key] ?? STAT_ICON_MAP.totalSeasonCost;
    const Icon = iconConfig.icon;
    const value = formatCurrency(item.value);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{item.title}</span>
                <Icon className={`h-5 w-5 ${iconConfig.color}`} />
            </div>

            {value ? (
                <h2 className="mt-4 text-3xl font-bold text-slate-800">
                    {value}
                </h2>
            ) : (
                <p className="mt-4 text-lg font-semibold leading-7 text-slate-500">
                    Không hiển thị dữ liệu
                </p>
            )}
        </article>
    );
}

function DashboardMetric({ label, value, helper, icon: Icon, tone = "text-[#006948]" }) {
    return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className={`h-5 w-5 ${tone}`} /></div><p className="mt-3 text-2xl font-bold text-slate-800">{value}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></article>;
}

function TransactionTrendChart({ points = [], loading }) {
    if (loading) return <LoadingState minHeight={220} />;
    if (!points.length) return <SectionEmptyState message="Chưa có giao dịch trong khoảng thời gian gần đây." minHeight={220} />;
    const max = Math.max(...points.map((point) => Number(point.transactionCount || 0)), 1);
    return <div className="flex h-[220px] items-end gap-2 border-b border-l border-slate-200 px-3 pb-1 pt-5">{points.map((point) => <div key={point.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-[32px] rounded-t-md bg-[#006948] transition-all" style={{ height: `${Math.max(8, Number(point.transactionCount || 0) / max * 100)}%` }} title={`${point.transactionCount} giao dịch`} /><span className="text-[10px] text-slate-400">{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(`${point.day}T00:00:00`))}</span></div>)}</div>;
}

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const farmId = user?.farmId;
    const [rangeDays, setRangeDays] = useState(30);
    const {
        stats,
        summary,
        stockAlerts,
        recentTransactions,
        transactionTrend,
                devices,
                loading,
        refreshing,
        sectionErrors,
        loadInitial,
        reload,
    } = useOwnerDashboard(farmId, rangeDays);

    const overview = summary?.overview;
    const inventoryOverview = summary?.inventoryOverview;
    const transactionOverview = summary?.transactionOverview;
    const iotOverview = summary?.iotOverview;

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    if (!farmId) {
        return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Tài khoản chưa được gán Farm nên chưa thể hiển thị Dashboard vận hành.</div>;
    }

    return (
        <div className="space-y-6">
            <OwnerPageHeader
                title="Tổng quan nông trại"
                description="Theo dõi mùa vụ, tồn kho, thiết bị cân, giao dịch và các cảnh báo vận hành từ dữ liệu thực tế của Farm."
                actions={<>
                    <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600">
                        <span className="text-xs font-medium uppercase text-slate-500">Khoảng thời gian</span>
                        <select value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))} className="bg-transparent font-semibold text-slate-800 outline-none">
                            <option value={7}>7 ngày</option>
                            <option value={30}>30 ngày</option>
                            <option value={90}>90 ngày</option>
                            <option value={365}>365 ngày</option>
                        </select>
                    </label>
                    <button type="button" onClick={reload} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                        Làm mới dữ liệu
                    </button>
                </>}
            />

            {sectionErrors.summary && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sectionErrors.summary}</div>}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-[128px] animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <DashboardStatCard key={item.key} item={item} />
                    ))}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <DashboardMetric label="Mùa vụ đang vận hành" value={(overview?.activeSeasonCount ?? 0) + (overview?.harvestingSeasonCount ?? 0)} helper={`${overview?.harvestingSeasonCount ?? 0} mùa đang thu hoạch`} icon={Activity} />
                <DashboardMetric label="Tồn kho vật tư thực tế" value={`${formatNumber(inventoryOverview?.actualMaterialStockKg)} kg`} helper={`Dự kiến: ${formatNumber(inventoryOverview?.projectedMaterialStockKg)} kg`} icon={Warehouse} tone="text-blue-600" />
                <DashboardMetric label="Kho sản phẩm thực tế" value={`${formatNumber(inventoryOverview?.actualProductStockKg)} kg`} helper="Sản lượng đã lưu kho" icon={Package} tone="text-amber-600" />
                <DashboardMetric label="Giao dịch chờ duyệt" value={overview?.pendingApprovalCount ?? 0} helper="Cần kiểm tra và xử lý" icon={AlertTriangle} tone="text-orange-500" />
                <DashboardMetric label="Thiết bị cân hoạt động" value={`${iotOverview?.activeDevices ?? 0}/${iotOverview?.totalDevices ?? 0}`} helper={iotOverview?.latestWeightGrams != null ? `Lần cân gần nhất: ${formatNumber(iotOverview.latestWeightGrams)} g` : "Chưa có lần cân gần nhất"} icon={Scale} tone="text-purple-600" />
                <DashboardMetric label="Doanh thu thực tế" value={formatCurrency(transactionOverview?.actualRevenue)} helper="Từ giao dịch đã ghi nhận" icon={TrendingUp} tone="text-emerald-600" />
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Xu hướng giao dịch</h2><p className="mt-1 text-xs text-slate-500">Số giao dịch theo ngày trong {rangeDays} ngày gần nhất</p></div><Activity className="h-5 w-5 text-[#006948]" /></div><TransactionTrendChart points={transactionTrend} loading={loading} /></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">Tiến độ mùa vụ</h2><p className="mt-1 text-xs text-slate-500">Theo ngày dự kiến của từng mùa đang chạy</p></div><TrendingUp className="h-5 w-5 text-blue-600" /></div>{loading ? <LoadingState minHeight={220} /> : summary?.seasonProgress?.length ? <div className="space-y-4">{summary.seasonProgress.map((season) => <div key={season.seasonId}><div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{season.seasonName}</span><span className="text-xs font-semibold text-[#006948]">{Number(season.progressPercentage || 0).toFixed(0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#006948]" style={{ width: `${Math.min(100, Number(season.progressPercentage || 0))}%` }} /></div><p className="mt-1 text-xs text-slate-400">{season.status}</p></div>)}</div> : <SectionEmptyState message="Chưa có mùa vụ đang vận hành." minHeight={220} />}</section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <section className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Trạng thái thiết bị IoT
                    </h2>

                    {loading ? (
                        <LoadingState minHeight={220} />
                    ) : devices.length === 0 ? (
                        <SectionEmptyState
                            message="Không hiển thị dữ liệu thiết bị IoT."
                            minHeight={220}
                        />
                    ) : (
                        <div className="space-y-3">
                            {devices.map((device) => {
                                const statusMeta = getDeviceStatusMeta(device.status);

                                return (
                                    <div
                                        key={device.deviceId}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-slate-700">
                                                    {device.deviceName || device.deviceId}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Cập nhật {formatRelativeTime(device.lastSeenAt)}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                                            >
                                                {statusMeta.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Cảnh báo tồn kho
                    </h2>

                    {loading ? (
                        <LoadingState minHeight={220} />
                    ) : stockAlerts.length === 0 ? (
                        <SectionEmptyState
                            message="Không hiển thị dữ liệu cảnh báo tồn kho."
                            minHeight={220}
                        />
                    ) : (
                        <div className="space-y-3">
                            {stockAlerts.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                                >
                                    <div>
                                        <p className="font-medium">{item.productName}</p>

                                        <p className="text-xs text-slate-500">
                                            Mã sản phẩm: #{item.productId}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-orange-600">
                                            {formatNumber(item.remainingQuantityKg)} kg
                                        </p>

                                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                                            {item.alertLevel === "LOW_STOCK"
                                                ? "Sắp hết hàng"
                                                : item.alertLevel === "OUT_OF_STOCK"
                                                    ? "Hết hàng"
                                                    : "Không hiển thị dữ liệu"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Hoạt động gần đây</h2><Activity size={18} className="text-slate-400" /></div>{loading ? <LoadingState minHeight={220} /> : recentTransactions.length === 0 ? <SectionEmptyState message="Chưa có hoạt động giao dịch." minHeight={220} /> : <div className="space-y-3">{recentTransactions.map((item) => <div key={item.transactionId} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p className="font-medium text-slate-800">{item.itemName}</p><p className="text-xs text-slate-500">{item.transactionType} · {item.deviceName || "MANUAL"}</p></div><div className="text-right"><p className="font-semibold text-slate-800">{formatNumber(item.quantityGrams)} g</p><p className="text-xs text-slate-400">{formatRelativeTime(item.scannedAt)}</p></div></div>)}</div>}</section>
            </div>

            <section className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-[#006948]">Cần xem báo cáo chi tiết?</h2><p className="mt-1 text-sm text-emerald-800/70">Lọc giao dịch theo thời gian và tải báo cáo PDF của Farm.</p></div><Link to="/owner/reports" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"><FileText size={16} />Mở báo cáo</Link></section>
        </div>
    );
}
