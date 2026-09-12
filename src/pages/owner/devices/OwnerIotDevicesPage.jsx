import { useState, useEffect } from "react";

import { useToast } from "../../../components/common/toast/ToastProvider";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { OwnerIotDeviceActivateCard } from "../../../features/owner/iot-devices/components/OwnerIotDeviceActivateCard";
import { OwnerIotDeviceApiKeyDrawer } from "../../../features/owner/iot-devices/components/OwnerIotDeviceApiKeyDrawer";
import { OwnerIotDeviceDetailDrawer } from "../../../features/owner/iot-devices/components/OwnerIotDeviceDetailDrawer";
import { OwnerIotDeviceStats } from "../../../features/owner/iot-devices/components/OwnerIotDeviceStats";
import { OwnerIotDeviceCardList } from "../../../features/owner/iot-devices/components/OwnerIotDeviceCardList";

import { useOwnerIotDevices } from "../../../features/owner/iot-devices/hooks/useOwnerIotDevices";
import { OwnerPageHeader } from "../common/OwnerPageHeader";


function OwnerIotDevicesSkeleton() {
    return (
        <section className="space-y-5">
            <OwnerPageHeader title="Thiết bị cân" description="Kích hoạt và theo dõi thiết bị cân trong các giao dịch của Farm." />

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

export function OwnerIotDevicesPage() {
    const toast = useToast();

    const { user } = useAuth();

    const farmId = user?.farmId;

    const {
        devices,
        selectedDevice,
        setSelectedDevice,

        summary,
        pageInfo,

        initialLoading,
        tableLoading,
        detailLoading,

        error,
        reload,
        setPage,

        actionLoading,
        actionError,
        clearActionError,

        activateDevice,
        loadDeviceDetail,
        refreshLatestWeight,
        loadAuditLogs,
        updateDeviceProfile,
        uploadDeviceImage,
    } = useOwnerIotDevices(farmId);

    const [detailDrawerOpen, setDetailDrawerOpen] =
        useState(false);

    const [apiKeyDevice, setApiKeyDevice] =
        useState(null);    /**
     * Toast only for page load errors.
     * Remove inline red error UI.
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu thiết bị IoT"
            );
        }
    }, [error, toast]);

    /**
     * Toast for missing farmId.
     */
    useEffect(() => {
        if (!farmId) {
            toast.error(
                "Tài khoản chưa được gán Farm"
            );
        }
    }, [farmId, toast]);



    useEffect(() => {
        reload();

            }, [
        reload
    ]);

    async function handleActivateDevice(
        payload,
    ) {
        const activatedDevice =
            await activateDevice(payload);

        if (!activatedDevice) {
            toast.error(
                "Không thể kích hoạt thiết bị.",
            );

            return false;
        }

        toast.success(
            `Đã kích hoạt thiết bị "${activatedDevice.deviceName}".`,
        );

        if (activatedDevice.apiKey) {
            setApiKeyDevice(
                activatedDevice,
            );
        }

        return true;
    }


    async function openDetailDrawer(
        device,
    ) {
        clearActionError();

        setDetailDrawerOpen(true);

        setSelectedDevice(device);

        await loadDeviceDetail(
            device.deviceId,
        );
    }

    function closeDetailDrawer() {
        setDetailDrawerOpen(false);

        setSelectedDevice(null);

        clearActionError();
    }

    async function handleCopyApiKey(
        apiKey,
    ) {
        if (!apiKey) {
            return;
        }

        await navigator.clipboard.writeText(
            apiKey,
        );

        toast.success(
            "Đã copy API key.",
        );
    }

    if (initialLoading) {
        return (
            <OwnerIotDevicesSkeleton />
        );
    }

    return (
        <>
            <section className="space-y-5">
            <OwnerPageHeader title="Thiết bị cân" description="Kích hoạt và theo dõi thiết bị cân trong các giao dịch của Farm." />

                <OwnerIotDeviceStats
                    summary={summary}
                />

                <OwnerIotDeviceActivateCard
                    submitting={actionLoading}
                    onSubmit={
                        handleActivateDevice
                    }
                />

                <OwnerIotDeviceCardList
                    devices={devices}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    actionLoading={actionLoading}
                    onPageChange={setPage}
                    onViewDetail={
                        openDetailDrawer
                    }
                />
            </section>

            <OwnerIotDeviceDetailDrawer
                key={selectedDevice?.deviceId || "owner-iot-detail"}
                open={detailDrawerOpen}
                device={selectedDevice}
                loading={detailLoading}
                actionLoading={actionLoading}
                actionError={actionError}
                canEdit={user?.role === "OWNER" || user?.roles?.includes("OWNER")}
                onClose={closeDetailDrawer}
                onRefreshWeight={refreshLatestWeight}
                onLoadAuditLogs={loadAuditLogs}
                onUpdateProfile={updateDeviceProfile}
                onUploadImage={uploadDeviceImage}
            />

            <OwnerIotDeviceApiKeyDrawer
                open={Boolean(apiKeyDevice)}
                device={apiKeyDevice}
                onClose={() =>
                    setApiKeyDevice(null)
                }
                onCopy={handleCopyApiKey}
            />
        </>
    );
}

export default OwnerIotDevicesPage;
