import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { IotDeviceDrawer } from "../../../features/admin/iot-devices/components/IotDeviceDrawer";
import { IotDeviceStats } from "../../../features/admin/iot-devices/components/IotDeviceStats";
import { IotDeviceTable } from "../../../features/admin/iot-devices/components/IotDeviceTable";
import { useAdminIotDevices } from "../../../features/admin/iot-devices/hooks/useAdminIotDevices";

const STATUS_ACTION_LABELS = {
    ACTIVE: "bật lại",
    INACTIVE: "tắt",
};

function AdminIotDevicesHeader({ onCreate }) {
    return (
        <header className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Thiết bị IoT
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý thiết bị cân, camera và trạng thái kết nối trong hệ thống
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
            >
                + Tạo thiết bị
            </button>
        </header>
    );
}

function AdminIotDevicesSkeleton() {
    return (
        <section className="space-y-5">
            <AdminIotDevicesHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[360px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

export function AdminIotDevicesPage() {
    const toast = useToast();

    const {
        devices,
        summary,
        pageInfo,
        loading,
        error,
        setPage,
        reload,

        actionLoading,
        actionError,
        clearActionError,
        createDevice,
        updateStatus,
    } = useAdminIotDevices();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [confirmState, setConfirmState] = useState({
        open: false,
        device: null,
        nextStatus: "",
    });

    function openCreateDrawer() {
        clearActionError();
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        setDrawerOpen(false);
        clearActionError();
    }

    async function handleSubmitDevice(payload) {
        const createdDevice = await createDevice(payload);

        if (!createdDevice) {
            toast.error("Không thể tạo thiết bị IoT.");
            return;
        }

        toast.success(
            createdDevice.activationCode
                ? `Đã tạo thiết bị. Mã kích hoạt: ${createdDevice.activationCode}`
                : "Đã tạo thiết bị IoT.",
        );

        closeDrawer();
    }

    function handleToggleStatus(device, nextStatus) {
        clearActionError();

        setConfirmState({
            open: true,
            device,
            nextStatus,
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            device: null,
            nextStatus: "",
        });

        clearActionError();
    }

    async function confirmUpdateStatus() {
        const { device, nextStatus } = confirmState;

        if (!device || !nextStatus) return;

        const actionText = STATUS_ACTION_LABELS[nextStatus] ?? "cập nhật";

        const success = await updateStatus(device.deviceId, nextStatus);

        if (!success) {
            toast.error(`Không thể ${actionText} thiết bị "${device.deviceId}".`);
            return;
        }

        toast.success(`Đã ${actionText} thiết bị "${device.deviceId}".`);
        closeConfirmDialog();
    }

    async function handleCopyActivationCode(device) {
        if (!device.activationCode) return;

        await navigator.clipboard.writeText(device.activationCode);
        toast.success(`Đã copy mã kích hoạt ${device.activationCode}.`);
    }

    if (loading) {
        return <AdminIotDevicesSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminIotDevicesHeader onCreate={openCreateDrawer} />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">{error}</p>

                    <button
                        type="button"
                        onClick={reload}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    const confirmDevice = confirmState.device;
    const confirmActionText =
        STATUS_ACTION_LABELS[confirmState.nextStatus] ?? "cập nhật";

    return (
        <>
            <section className="space-y-5">
                <AdminIotDevicesHeader onCreate={openCreateDrawer} />

                {actionError && !drawerOpen && !confirmState.open && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <IotDeviceStats summary={summary} />

                <IotDeviceTable
                    devices={devices}
                    pageInfo={pageInfo}
                    onPageChange={setPage}
                    onToggleStatus={handleToggleStatus}
                    onCopyActivationCode={handleCopyActivationCode}
                />
            </section>

            <IotDeviceDrawer
                open={drawerOpen}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleSubmitDevice}
            />

            <ConfirmDialog
                open={confirmState.open}
                title="Cập nhật trạng thái thiết bị"
                description={
                    confirmDevice
                        ? `Bạn có chắc muốn ${confirmActionText} thiết bị "${confirmDevice.deviceId}" không?`
                        : ""
                }
                confirmText="Xác nhận"
                cancelText="Hủy"
                variant={confirmState.nextStatus === "ACTIVE" ? "success" : "danger"}
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmUpdateStatus}
            />
        </>
    );
}