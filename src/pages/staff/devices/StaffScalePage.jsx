import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, Scale, WifiOff } from "lucide-react";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useStaffScale } from "../../../features/staff/iot-weighing/hooks/useStaffScale";
import { OwnerPageHeader } from "../../owner/common/OwnerPageHeader";
import { formatNumber } from "../../../utils/formatUtils";
import { SortSelect } from "../../../components/common/sort/SortSelect";
import { sortItems } from "../../../utils/listSort";

const STALE_AFTER_MS = 5 * 60 * 1000;

function formatDateTime(value) {
    if (!value) return "Chưa nhận dữ liệu";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Chưa nhận dữ liệu" : date.toLocaleString("vi-VN");
}

function getWeightGrams(weight) {
    return weight?.weightGrams ?? null;
}

function isStale(value) {
    if (!value) return true;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) || Date.now() - timestamp > STALE_AFTER_MS;
}

function DeviceSkeleton() {
    return <div className="space-y-6"><div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" /><div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]"><div className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-white" /><div className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-white" /></div></div>;
}

export function StaffScalePage() {
    const { user } = useAuth();
    const { devices, selectedDevice, selectedDeviceId, selectDevice, latestWeight, loading, weightLoading, error, weightError, reload, refreshWeight } = useStaffScale(user?.farmId);
    const deviceWeight = selectedDevice ? { weightGrams: selectedDevice.lastWeightGrams, capturedAt: selectedDevice.lastWeightAt } : null;
    const displayedWeight = latestWeight || deviceWeight;
    const [sortKey, setSortKey] = useState("nameAsc");
    const sortedDevices = useMemo(() => sortItems(devices, sortKey, {
        nameAsc: { value: (item) => item.deviceName || item.deviceId, direction: "asc" },
        nameDesc: { value: (item) => item.deviceName || item.deviceId, direction: "desc" },
        lastSeen: { value: (item) => new Date(item.lastSeenAt || 0).getTime(), direction: "desc" },
    }), [devices, sortKey]);
    const weightGrams = getWeightGrams(displayedWeight);
    const stale = isStale(displayedWeight?.capturedAt);
    const statusText = useMemo(() => {
        if (!displayedWeight?.capturedAt) return "Chưa có dữ liệu";
        return stale ? "Dữ liệu đã cũ" : "Dữ liệu mới";
    }, [displayedWeight?.capturedAt, stale]);

    if (loading && !devices.length) return <><OwnerPageHeader title="Thiết bị cân" description="Lấy khối lượng mới nhất từ cân IoT của Farm." /><DeviceSkeleton /></>;

    return <section className="space-y-6 animate-fade-in">
        <OwnerPageHeader title="Thiết bị cân" description="Chọn cân ACTIVE để xem khối lượng mới nhất và dùng cho giao dịch vận hành." actions={<button type="button" onClick={reload} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Làm mới</button>} />
        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Cân ACTIVE</p><p className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(devices.length)}</p><p className="mt-1 text-xs text-slate-500">Có thể lấy dữ liệu cân</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Cân đang chọn</p><p className="mt-2 truncate text-lg font-bold text-slate-900">{selectedDevice?.deviceName || selectedDevice?.deviceId || "Chưa chọn"}</p><p className="mt-1 text-xs text-slate-500">{selectedDevice?.deviceId || "Chọn một thiết bị bên dưới"}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Trạng thái dữ liệu</p><p className={`mt-2 text-lg font-bold ${stale ? "text-amber-700" : "text-emerald-700"}`}>{statusText}</p><p className="mt-1 text-xs text-slate-500">Ngưỡng cảnh báo: 5 phút</p></div></div>
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#006948]"><Scale size={19} /></div><div><h2 className="font-semibold text-slate-900">Cân của Farm</h2><p className="mt-1 text-xs text-slate-500">Chỉ hiển thị thiết bị ACTIVE.</p></div></div><SortSelect value={sortKey} onChange={setSortKey} options={[{ value: "nameAsc", label: "Tên A → Z" }, { value: "nameDesc", label: "Tên Z → A" }, { value: "lastSeen", label: "Hoạt động gần đây" }]} /></div>{devices.length ? <div className="space-y-2">{sortedDevices.map((device) => <button type="button" key={device.deviceId} onClick={() => selectDevice(device.deviceId)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selectedDeviceId === device.deviceId ? "border-emerald-300 bg-emerald-50" : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50"}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedDeviceId === device.deviceId ? "bg-[#006948] text-white" : "bg-slate-100 text-slate-500"}`}><Scale size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{device.deviceName || device.deviceId}</p><p className="mt-1 truncate text-xs text-slate-500">{device.deviceId} · {device.macAddress || "Chưa có MAC"}</p></div><CheckCircle2 size={17} className={selectedDeviceId === device.deviceId ? "text-[#006948]" : "text-transparent"} /></button>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500"><WifiOff size={24} className="mx-auto mb-3 text-slate-400" />Farm chưa có thiết bị cân ACTIVE.</div>}</section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Khối lượng mới nhất</h2><p className="mt-1 text-xs text-slate-500">{selectedDevice?.deviceName || selectedDevice?.deviceId || "Chưa chọn thiết bị"}</p></div><button type="button" onClick={() => refreshWeight()} disabled={!selectedDevice || weightLoading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={14} className={weightLoading ? "animate-spin" : ""} />Lấy dữ liệu mới</button></div>{weightError && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{weightError}</div>}{selectedDevice ? <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center"><div className="flex items-center justify-center gap-2 text-sm text-slate-500"><Clock3 size={16} />{displayedWeight?.capturedAt ? `Nhận lúc ${formatDateTime(displayedWeight.capturedAt)}` : "Chưa nhận được dữ liệu từ cân"}</div><p className="mt-5 text-5xl font-bold tracking-tight text-[#006948]">{weightGrams == null ? "—" : `${formatNumber(Number(weightGrams) / 1000)} kg`}</p><p className="mt-2 text-xs text-slate-500">{weightGrams == null ? "Cân chưa gửi khối lượng" : `${formatNumber(weightGrams)} gram`}</p>{displayedWeight?.capturedAt && <div className={`mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${stale ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{stale ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}{stale ? "Cần lấy lại dữ liệu trước khi tạo giao dịch" : "Dữ liệu đủ mới để tham chiếu"}</div>}</div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-500">Chọn một cân ACTIVE để xem khối lượng.</div>}<div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">Cân IoT chỉ gửi khối lượng, không sử dụng camera. Nếu cân không phản hồi, màn hình tạo giao dịch sẽ cho phép nhập tay và yêu cầu ghi rõ nguồn dữ liệu.</div></section>
        </div>
    </section>;
}
