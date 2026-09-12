import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { IotDeviceDetailDrawer } from "../../../features/admin/iot-devices/components/IotDeviceDetailDrawer";
import { IotDeviceDrawer } from "../../../features/admin/iot-devices/components/IotDeviceDrawer";
import { IotDeviceStats } from "../../../features/admin/iot-devices/components/IotDeviceStats";
import { ScaleDeviceCardGrid } from "../../../features/admin/iot-devices/components/ScaleDeviceCardGrid";
import {
    DEVICE_TABLE_VIEW,
    useAdminIotDevices,
} from "../../../features/admin/iot-devices/hooks/useAdminIotDevices";
import { getIotDeviceDetail, uploadIotDeviceImage } from "../../../features/admin/iot-devices/services/iotDeviceApi";

function Header({ onReload }) {
    return (
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Thiết bị cân</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">Quản lý thiết bị cân và theo dõi khối lượng gửi lên trong các giao dịch của Farm.</p>
            </div>
            <button type="button" onClick={onReload} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={15} /> Làm mới</button>
        </header>
    );
}

function Tabs({ activeView, onChange, summary }) {
    const tabs = [
        [DEVICE_TABLE_VIEW.ALL, "Thiết bị cân", summary.totalDevices],
        [DEVICE_TABLE_VIEW.UNCREATED, "Thiết bị chưa tạo", summary.uncreatedDevices],
        [DEVICE_TABLE_VIEW.UNASSIGNED, "Chưa gắn Farm", summary.unassignedDevices],
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {tabs.map(([value, label, count]) => (
                <button key={value} type="button" onClick={() => onChange(value)} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${activeView === value ? "bg-[#006948] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {label}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeView === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count ?? 0}</span>
                </button>
            ))}
        </div>
    );
}

export function AdminIotDevicesPage() {
    const toast = useToast();
    const {
        activeView,
        setActiveView,
        devices,
        summary,
        pageInfo,
        initialLoading,
        tableLoading,
        error,
        setPage,
        reload,
        actionLoading,
        actionError,
        clearActionError,
        createFromMac,
        updateStatus,
    } = useAdminIotDevices();

    const [createRecord, setCreateRecord] = useState(null);
    const [detailDevice, setDetailDevice] = useState(null);
    const [confirmState, setConfirmState] = useState({ open: false, device: null, nextStatus: "" });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    async function handleUploadImage(file) {
        setUploadingImage(true);
        try {
            return await uploadIotDeviceImage(file);
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleCreate(payload) {
        const created = await createFromMac(createRecord.id, payload);
        if (!created) {
            toast.error(actionError || "Không thể tạo thiết bị cân.");
            return;
        }

        toast.success(created.activationCode ? `Đã tạo thiết bị. Activation code: ${created.activationCode}` : "Đã tạo thiết bị cân.");
        setCreateRecord(null);
    }

    async function openDetail(device) {
        if (!device?.deviceId) return;
        setDetailDevice(device);
        setDetailLoading(true);
        try {
            const detail = await getIotDeviceDetail(device.deviceId);
            setDetailDevice(detail);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể tải nhật ký thiết bị.");
        } finally {
            setDetailLoading(false);
        }
    }

    function handleToggleStatus(device, nextStatus) {
        clearActionError();
        setConfirmState({ open: true, device, nextStatus });
    }

    async function confirmStatus() {
        const { device, nextStatus } = confirmState;
        const updated = await updateStatus(device.deviceId, nextStatus);
        if (!updated) {
            toast.error(actionError || "Không thể cập nhật trạng thái thiết bị.");
            return;
        }
        toast.success(nextStatus === "ACTIVE" ? "Đã bật lại thiết bị cân." : "Đã tắt thiết bị cân.");
        setConfirmState({ open: false, device: null, nextStatus: "" });
    }

    if (initialLoading) {
        return <AdminPageSkeleton variant="devices" />;
    }

    return (
        <>
            <section className="space-y-5">
                <Header onReload={reload} />
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
                <IotDeviceStats summary={summary} />
                <Tabs activeView={activeView} onChange={setActiveView} summary={summary} />
                <ScaleDeviceCardGrid
                    view={activeView}
                    devices={devices}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onCreate={setCreateRecord}
                    onViewDetail={openDetail}
                    onToggleStatus={handleToggleStatus}
                />
            </section>

            <IotDeviceDrawer
                open={Boolean(createRecord)}
                macRecord={createRecord}
                submitting={actionLoading}
                uploadingImage={uploadingImage}
                error={actionError}
                onClose={() => { if (!actionLoading) setCreateRecord(null); }}
                onUploadImage={handleUploadImage}
                onSubmit={handleCreate}
            />

            <IotDeviceDetailDrawer open={Boolean(detailDevice)} device={detailDevice} loading={detailLoading} onClose={() => setDetailDevice(null)} />

            <ConfirmDialog
                open={confirmState.open}
                title="Cập nhật trạng thái thiết bị"
                description={`Bạn có chắc muốn ${confirmState.nextStatus === "ACTIVE" ? "bật lại" : "tắt"} thiết bị cân này không? Thay đổi sẽ được ghi vào nhật ký thiết bị.`}
                confirmText="Xác nhận"
                cancelText="Hủy"
                variant={confirmState.nextStatus === "ACTIVE" ? "success" : "danger"}
                loading={actionLoading}
                onCancel={() => setConfirmState({ open: false, device: null, nextStatus: "" })}
                onConfirm={confirmStatus}
            />
        </>
    );
}
