import {
    ChartNoAxesCombined,
    Package,
    RefreshCw,
    TrendingUp,
    Warehouse,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useOwnerDashboard } from "../../../features/owner/dashboard/hooks/useOwnerDashboard";
import {
    formatPrice,
    formatPriceChange,
} from "../../../features/owner/market-prices/utils/marketPriceUtils";

const FALLBACK_FARM_ID = 1;

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

function formatCurrency(value) {
    if (value === null || value === undefined) {
        return null;
    }

    return `${formatPrice(value)}đ`;
}

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

function getScanTypeMeta(status) {
    const normalizedStatus =
        String(status || "").toUpperCase();

    switch (normalizedStatus) {
        case "SUCCESS":
            return {
                label: "Nhận diện QR",
                className:
                    "bg-emerald-50 text-[#006948]",
            };

        case "CORRECTED":
            return {
                label:
                    "Đã nhập mã thủ công",
                className:
                    "bg-blue-50 text-blue-700",
            };

        case "UNRECOGNIZED":
            return {
                label:
                    "Không nhận diện",
                className:
                    "bg-amber-50 text-amber-700",
            };

        case "PENDING":
            return {
                label: "Đang xử lý",
                className:
                    "bg-slate-100 text-slate-700",
            };

        default:
            return {
                label:
                    "Không hiển thị dữ liệu",
                className:
                    "bg-slate-100 text-slate-600",
            };
    }
}
function getReviewMeta(reviewed) {
    if (reviewed === true) {
        return {
            label: "Đã duyệt",
            className: "bg-emerald-100 text-[#006948]",
        };
    }

    if (reviewed === false) {
        return {
            label: "Chưa duyệt",
            className: "bg-amber-100 text-amber-700",
        };
    }

    return {
        label: "Không hiển thị dữ liệu",
        className: "bg-slate-100 text-slate-500",
    };
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

function DashboardMarketPriceTable({ prices, loading }) {
    if (loading) {
        return <LoadingState minHeight={160} />;
    }

    if (prices.length === 0) {
        return (
            <SectionEmptyState
                message="Không hiển thị dữ liệu giá thị trường."
                minHeight={160}
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
                <thead>
                    <tr className="text-left text-xs uppercase text-slate-500">
                        <th className="pb-3">Mặt hàng</th>
                        <th className="pb-3">Size</th>
                        <th className="pb-3">Giá</th>
                        <th className="pb-3">Thay đổi</th>
                    </tr>
                </thead>

                <tbody>
                    {prices.map((item) => {
                        const positive = Number(item.priceChangeValue) >= 0;

                        return (
                            <tr
                                key={item.marketCode}
                                className="border-t border-slate-100"
                            >
                                <td className="max-w-[220px] py-3 pr-3 text-sm font-medium text-slate-800">
                                    <div className="line-clamp-2">
                                        {item.speciesName || item.marketName || "-"}
                                    </div>
                                </td>

                                <td className="py-3 pr-3 text-sm text-slate-600">
                                    {item.sizeCategory || "DEFAULT"}
                                </td>

                                <td className="py-3 pr-3 text-sm font-semibold text-slate-900">
                                    {formatPrice(item.price)}
                                    {item.priceUnit?.startsWith("đ") ? "đ" : ""}
                                </td>

                                <td
                                    className={`py-3 text-sm font-semibold ${positive ? "text-[#006948]" : "text-red-600"
                                        }`}
                                >
                                    {formatPriceChange(item.priceChangeValue)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const farmId = user?.farmId ?? FALLBACK_FARM_ID;
    const {
        stats,
        stockAlerts,
        recentScans,
        devices,
        marketPrices,
        loading,
        refreshing,
        loadInitial,
        reload,
    } = useOwnerDashboard(farmId);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Tổng quan nông trại
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Theo dõi vận hành, cảnh báo tồn kho, thiết bị IoT và giá
                        thị trường từ dữ liệu thực tế của farm.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={reload}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Làm mới dữ liệu
                </button>
            </div>

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

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>

                        <Link
                            to="/owner/iot-scans"
                            className="text-sm font-medium text-emerald-600 hover:underline"
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    {loading ? (
                        <LoadingState minHeight={220} />
                    ) : recentScans.length === 0 ? (
                        <SectionEmptyState
                            message="Không hiển thị dữ liệu hoạt động gần đây."
                            minHeight={220}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                                        <th className="pb-3">Thời gian</th>
                                        <th className="pb-3">Loại</th>
                                        <th className="pb-3">Nội dung</th>
                                        <th className="pb-3">Thiết bị</th>
                                        <th className="pb-3">Trạng thái</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentScans.map((activity) => {
                                        const typeMeta = getScanTypeMeta(activity.aiStatus);
                                        const reviewMeta = getReviewMeta(activity.reviewed);

                                        return (
                                            <tr
                                                key={activity.transactionId}
                                                className="border-b border-slate-50"
                                            >
                                                <td className="py-3 text-sm">
                                                    {formatRelativeTime(activity.scannedAt)}
                                                </td>

                                                <td className="py-3">
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${typeMeta.className}`}
                                                    >
                                                        {typeMeta.label}
                                                    </span>
                                                </td>

                                                <td className="py-3 text-sm">
                                                    {activity.itemName || "Chưa nhận diện AI"}
                                                </td>

                                                <td className="py-3 text-sm">
                                                    {activity.deviceName ||
                                                        "Không hiển thị dữ liệu"}
                                                </td>

                                                <td className="py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${reviewMeta.className}`}
                                                    >
                                                        {reviewMeta.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
                            <ChartNoAxesCombined size={19} className="text-[#006948]" />
                            Giá thị trường theo Watchlist
                        </h2>

                        <Link
                            to="/owner/market-prices"
                            className="text-sm font-semibold text-[#006948] hover:underline"
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    <DashboardMarketPriceTable
                        prices={marketPrices}
                        loading={loading}
                    />
                </section>
            </div>
        </div>
    );
}
