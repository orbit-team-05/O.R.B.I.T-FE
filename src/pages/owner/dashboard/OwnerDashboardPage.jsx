import {
  AlertTriangle,
  ChartNoAxesCombined,
  Cpu,
  Package,
  Warehouse,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useOwnerDashboardMarketPrices } from "../../../features/owner/market-prices/hooks/useOwnerMarketPrices";
import {
  formatPrice,
  formatPriceChange,
} from "../../../features/owner/market-prices/utils/marketPriceUtils";

const FALLBACK_FARM_ID = 1;

const stats = [
  {
    title: "Giá trị kho",
    value: "12.500.000đ",
    icon: Warehouse,
    color: "text-emerald-600",
  },
  {
    title: "Sản phẩm",
    value: "24",
    icon: Package,
    color: "text-slate-600",
  },
  {
    title: "Thiết bị Active",
    value: "2",
    icon: Cpu,
    color: "text-blue-600",
  },
  {
    title: "Cảnh báo",
    value: "3",
    icon: AlertTriangle,
    color: "text-red-500",
  },
];

const activities = [
  {
    time: "08:30",
    type: "IOT_SCAN",
    content: "Quét mã QR sản phẩm A",
    device: "Bộ cảm QR khu A",
    status: "success",
  },
  {
    time: "08:15",
    type: "IMPORT",
    content: "Nhập kho lô hàng mới",
    device: "Web Owner",
    status: "success",
  },
  {
    time: "Hôm qua",
    type: "EXPORT",
    content: "Xuất kho thuốc thú y",
    device: "Mobile App",
    status: "success",
  },
  {
    time: "Hôm qua",
    type: "IOT_SCAN",
    content: "Quét mã QR sản phẩm B",
    device: "ESP32-CAM khu A",
    status: "error",
  },
];

const devices = [
  {
    name: "Bộ cảm QR khu A",
    updated: "2 phút trước",
  },
  {
    name: "ESP32-CAM khu A",
    updated: "Vừa xong",
  },
];

const inventoryAlerts = [
  {
    name: "Thuốc xử lý nước ABC",
    batch: "LOT-2023-X",
    quantity: "80ml",
    level: "Cực thấp",
  },
  {
    name: "Men vi sinh Bio Aqua",
    batch: "LOT-2023-Y",
    quantity: "2 gói",
    level: "Thấp",
  },
  {
    name: "Cám CP 902",
    batch: "LOT-2023-Z",
    quantity: "35kg",
    level: "Cần nhập thêm",
  },
];

function StatusBadge({ status }) {
  const styles = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status === "success"
        ? "Hoàn thành"
        : status === "warning"
        ? "Cảnh báo"
        : "Lỗi"}
    </span>
  );
}

function DashboardMarketPriceTable({ prices, loading, error }) {
  if (loading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#006948]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error}
      </div>
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
                  className={`py-3 text-sm font-semibold ${
                    positive ? "text-[#006948]" : "text-red-600"
                  }`}
                >
                  {formatPriceChange(item.priceChangeValue)}
                </td>
              </tr>
            );
          })}

          {prices.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-8 text-center text-sm text-slate-500"
              >
                Chưa có mặt hàng nào trong watchlist.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const farmId = user?.farmId ?? FALLBACK_FARM_ID;
  const {
    prices: watchlistPrices,
    loading: marketPriceLoading,
    error: marketPriceError,
    reload: reloadMarketPrices,
  } = useOwnerDashboardMarketPrices(farmId, 3);

  useEffect(() => {
    reloadMarketPrices();
  }, [reloadMarketPrices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Tổng quan nông trại
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Theo dõi kho, thiết bị IoT, giá thị trường và hoạt động vận hành
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {item.title}
                </span>

                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>

              <h2 className="mt-4 text-3xl font-bold text-slate-800">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Hoạt động gần đây
            </h2>

            <button className="text-sm font-medium text-emerald-600">
              Xem tất cả
            </button>
          </div>

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
                {activities.map((activity, index) => (
                  <tr key={index} className="border-b border-slate-50">
                    <td className="py-3 text-sm">{activity.time}</td>

                    <td className="py-3">
                      <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600">
                        {activity.type}
                      </span>
                    </td>

                    <td className="py-3 text-sm">
                      {activity.content}
                    </td>

                    <td className="py-3 text-sm">
                      {activity.device}
                    </td>

                    <td className="py-3">
                      <StatusBadge status={activity.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Trạng thái thiết bị IoT
          </h2>

          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.name}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">
                      {device.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      Cập nhật {device.updated}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Cảnh báo tồn kho
          </h2>

          <div className="space-y-3">
            {inventoryAlerts.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>

                  <p className="text-xs text-slate-500">
                    Lô: {item.batch}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-orange-600">
                    {item.quantity}
                  </p>

                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                    {item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
            prices={watchlistPrices}
            loading={marketPriceLoading}
            error={marketPriceError}
          />
        </div>
      </div>
    </div>
  );
}
