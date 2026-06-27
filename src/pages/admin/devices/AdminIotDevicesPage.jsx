import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { IotDeviceDetailDrawer } from "../../../features/admin/iot-devices/components/IotDeviceDetailDrawer";
import { IotDeviceDrawer } from "../../../features/admin/iot-devices/components/IotDeviceDrawer";
import { IotDeviceReplaceDrawer } from "../../../features/admin/iot-devices/components/IotDeviceReplaceDrawer";
import { IotDeviceStats } from "../../../features/admin/iot-devices/components/IotDeviceStats";
import { IotDeviceTable } from "../../../features/admin/iot-devices/components/IotDeviceTable";
import { UnassignedIotDeviceTable } from "../../../features/admin/iot-devices/components/UnassignedIotDeviceTable";

import {
    DEVICE_TABLE_VIEW,
    useAdminIotDevices,
} from "../../../features/admin/iot-devices/hooks/useAdminIotDevices";

const STATUS_ACTION_LABELS = {
    ACTIVE: "bật lại",
    INACTIVE: "tắt",
};

function AdminIotDevicesHeader({ onCreate, onReload }) {
    return (
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Thiết bị IoT
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý thiết bị cân, camera và trạng thái kết nối trong hệ thống.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onReload}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    Làm mới
                </button>

                <button
                    type="button"
                    onClick={onCreate}
                    className="h-10 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition hover:bg-[#00583d]"
                >
                    + Tạo thiết bị
                </button>
            </div>
        </header>
    );
}

function AdminIotDevicesSkeleton() {
    return (
        <section className="space-y-5">
            <AdminIotDevicesHeader />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-[96px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[360px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </section>
    );
}

function DeviceTableTabs({ activeView, onChange }) {
    const tabs = [
        {
            label: "Tất cả thiết bị",
            value: DEVICE_TABLE_VIEW.ALL,
        },
        {
            label: "Chưa gắn farm",
            value: DEVICE_TABLE_VIEW.UNASSIGNED,
        },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
                const active = activeView === tab.value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onChange(tab.value)}
                        className={[
                            "h-10 rounded-lg px-4 text-sm font-medium transition-colors",
                            active
                                ? "bg-[#006948] text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

function EmptyState({ onReload }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
                Không có dữ liệu thiết bị để hiển thị.
            </p>

            <button
                type="button"
                onClick={onReload}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#006948] px-4 text-sm font-medium text-white hover:bg-[#00583d]"
            >
                Tải lại dữ liệu
            </button>
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

        createDevice,
        updateStatus,
        replaceComponent,
    } = useAdminIotDevices();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [detailDrawerState, setDetailDrawerState] = useState({
        open: false,
        device: null,
    });

    const [confirmState, setConfirmState] = useState({
        open: false,
        device: null,
        nextStatus: "",
    });

    const [replaceDrawerState, setReplaceDrawerState] = useState({
        open: false,
        device: null,
    });

    function resetOverlayState() {
        setDrawerOpen(false);

        setDetailDrawerState({
            open: false,
            device: null,
        });

        setConfirmState({
            open: false,
            device: null,
            nextStatus: "",
        });

        setReplaceDrawerState({
            open: false,
            device: null,
        });

        clearActionError();
    }

    function handleChangeTableView(nextView) {
        if (actionLoading) return;

        resetOverlayState();
        setActiveView(nextView);
    }

    function openCreateDrawer() {
        clearActionError();
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        setDrawerOpen(false);
        clearActionError();
    }

    function openDetailDrawer(device) {
        clearActionError();

        setDetailDrawerState({
            open: true,
            device,
        });
    }

    function closeDetailDrawer() {
        if (actionLoading) return;

        setDetailDrawerState({
            open: false,
            device: null,
        });

        clearActionError();
    }

    function openReplaceDrawer(device) {
        clearActionError();

        setDetailDrawerState({
            open: false,
            device: null,
        });

        setReplaceDrawerState({
            open: true,
            device,
        });
    }

    function closeReplaceDrawer() {
        if (actionLoading) return;

        setReplaceDrawerState({
            open: false,
            device: null,
        });

        clearActionError();
    }

    async function handleReplaceComponent(device, payload) {
        if (!device?.deviceId) {
            toast.error("Không tìm thấy thiết bị.");
            return;
        }

        const success = await replaceComponent(device.deviceId, payload);

        if (!success) {
            toast.error(`Không thể thay linh kiện thiết bị "${device.deviceId}".`);
            return;
        }

        const componentText =
            payload.componentType === "CAM" ? "camera" : "cân";

        toast.success(
            `Đã thay ${componentText} cho thiết bị "${device.deviceId}".`,
        );

        closeReplaceDrawer();
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

        if (!device || !nextStatus) {
            toast.error("Thiếu dữ liệu cập nhật trạng thái.");
            return;
        }

        const actionText =
            STATUS_ACTION_LABELS[nextStatus] ?? "cập nhật";

        const success = await updateStatus(
            device.deviceId,
            nextStatus,
        );

        if (!success) {
            toast.error(
                `Không thể ${actionText} thiết bị "${device.deviceId}".`,
            );
            return;
        }

        toast.success(
            `Đã ${actionText} thiết bị "${device.deviceId}".`,
        );

        closeConfirmDialog();
    }

    async function handleCopyActivationCode(device) {
        try {
            if (!device?.activationCode) {
                toast.error("Thiết bị chưa có mã kích hoạt.");
                return;
            }

            await navigator.clipboard.writeText(device.activationCode);

            toast.success(
                `Đã copy mã kích hoạt ${device.activationCode}.`,
            );
        } catch (err) {
            toast.error("Không thể copy mã kích hoạt.");
        }
    }

    if (initialLoading) {
        return <AdminIotDevicesSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <AdminIotDevicesHeader
                    onCreate={openCreateDrawer}
                    onReload={reload}
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {error || "Không thể tải dữ liệu thiết bị."}
                    </p>

                    <button
                        type="button"
                        onClick={reload}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            </section>
        );
    }

    if (!devices) {
        return (
            <section className="space-y-5">
                <AdminIotDevicesHeader
                    onCreate={openCreateDrawer}
                    onReload={reload}
                />

                <EmptyState onReload={reload} />
            </section>
        );
    }

    const confirmDevice = confirmState.device;

    const confirmActionText =
        STATUS_ACTION_LABELS[confirmState.nextStatus] ?? "cập nhật";

    return (
        <>
            <section className="space-y-5">
                <AdminIotDevicesHeader
                    onCreate={openCreateDrawer}
                    onReload={reload}
                />

                {actionError &&
                    !drawerOpen &&
                    !confirmState.open &&
                    !detailDrawerState.open &&
                    !replaceDrawerState.open && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}

                <IotDeviceStats summary={summary || {}} />

                <DeviceTableTabs
                    activeView={activeView}
                    onChange={handleChangeTableView}
                />

                {activeView === DEVICE_TABLE_VIEW.ALL && (
                    <IotDeviceTable
                        devices={devices || []}
                        pageInfo={pageInfo || {}}
                        loading={tableLoading}
                        onPageChange={setPage}
                        onToggleStatus={handleToggleStatus}
                        onCopyActivationCode={handleCopyActivationCode}
                        onViewDetail={openDetailDrawer}
                    />
                )}

                {activeView === DEVICE_TABLE_VIEW.UNASSIGNED && (
                    <UnassignedIotDeviceTable
                        devices={devices || []}
                        pageInfo={pageInfo || {}}
                        loading={tableLoading}
                        onPageChange={setPage}
                        onCopyActivationCode={handleCopyActivationCode}
                        onViewDetail={openDetailDrawer}
                    />
                )}
            </section>

            <IotDeviceDrawer
                open={drawerOpen}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleSubmitDevice}
            />

            <IotDeviceDetailDrawer
                open={detailDrawerState.open}
                device={detailDrawerState.device}
                onClose={closeDetailDrawer}
                onReplaceComponent={openReplaceDrawer}
            />

            <IotDeviceReplaceDrawer
                open={replaceDrawerState.open}
                device={replaceDrawerState.device}
                submitting={actionLoading}
                error={actionError}
                onClose={closeReplaceDrawer}
                onSubmit={handleReplaceComponent}
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
                variant={
                    confirmState.nextStatus === "ACTIVE"
                        ? "success"
                        : "danger"
                }
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmUpdateStatus}
            />
        </>
    );
}