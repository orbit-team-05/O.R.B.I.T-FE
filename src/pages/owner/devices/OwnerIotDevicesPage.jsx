import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "../../../components/common/toast/ToastProvider";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { OwnerIotDeviceActivateCard } from "../../../features/owner/iot-devices/components/OwnerIotDeviceActivateCard";
import { OwnerIotDeviceApiKeyDrawer } from "../../../features/owner/iot-devices/components/OwnerIotDeviceApiKeyDrawer";
import { OwnerIotDeviceDetailDrawer } from "../../../features/owner/iot-devices/components/OwnerIotDeviceDetailDrawer";
import { OwnerIotDeviceStats } from "../../../features/owner/iot-devices/components/OwnerIotDeviceStats";
import { OwnerIotDeviceTable } from "../../../features/owner/iot-devices/components/OwnerIotDeviceTable";

import { IotExportSeasonSelectDrawer } from "../../../features/owner/iot-devices/components/IotExportSeasonSelectDrawer";

import { useOwnerIotDevices } from "../../../features/owner/iot-devices/hooks/useOwnerIotDevices";

import { getSeasonCards } from "../../../features/owner/seasons/services/ownerSeasonApi";

function OwnerIotDevicesHeader() {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Thiết bị IoT
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Thiết bị IoT
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Kích hoạt, theo dõi và điều khiển chế độ làm việc
                    của thiết bị cân-camera
                </p>
            </div>
        </header>
    );
}

function OwnerIotDevicesSkeleton() {
    return (
        <section className="space-y-5">
            <OwnerIotDevicesHeader />

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
        clearActionError,

        activateDevice,
        updateWorkMode,
        cancelPendingCommand,
        loadDeviceDetail,
    } = useOwnerIotDevices(farmId);

    const [detailDrawerOpen, setDetailDrawerOpen] =
        useState(false);

    const [apiKeyDevice, setApiKeyDevice] =
        useState(null);

    const [exportDevice, setExportDevice] =
        useState(null);

    const [harvestDevice, setHarvestDevice] =
        useState(null);

    const [seasons, setSeasons] = useState([]);

    const [seasonLoading, setSeasonLoading] =
        useState(false);

    /**
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
                "Tài khoản OWNER chưa có farm"
            );
        }
    }, [farmId, toast]);

    const exportableSeasons = useMemo(() => {
        return seasons.filter(
            (season) =>
                season.status === "ACTIVE" ||
                season.status === "HARVESTING",
        );
    }, [seasons]);

    const harvestableSeasons = useMemo(() => {
        return seasons.filter(
            (season) =>
                season.status === "HARVESTING",
        );
    }, [seasons]);

    const loadSeasonsForIotMode =
        useCallback(async () => {
            try {
                setSeasonLoading(true);

                const data =
                    await getSeasonCards(
                        0,
                        100,
                    );

                setSeasons(
                    data?.content ?? [],
                );
            } catch (err) {
                console.error(
                    "Không thể tải danh sách mùa vụ cho IoT:",
                    err,
                );

                setSeasons([]);

                toast.error(
                    "Không thể tải danh sách mùa vụ"
                );
            } finally {
                setSeasonLoading(false);
            }
        }, [toast]);

    useEffect(() => {
        reload();

        void loadSeasonsForIotMode();
    }, [
        reload,
        loadSeasonsForIotMode,
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

    async function handleStartImportMode(
        device,
    ) {
        if (!device?.deviceId) {
            return;
        }

        clearActionError();

        const result =
            await updateWorkMode(
                device.deviceId,
                "IMPORT",
                null,
            );

        if (!result) {
            toast.error(
                "Không thể gửi lệnh bật chế độ nhập kho.",
            );

            return;
        }

        toast.success(
            `Đã gửi lệnh bật nhập kho cho "${result.deviceName || result.deviceId}". Chờ thiết bị xác nhận.`,
        );
    }

    async function handleStartExportMode(
        device,
    ) {
        if (!device?.deviceId) {
            return;
        }

        clearActionError();

        if (
            exportableSeasons.length === 0
        ) {
            toast.error(
                "Chưa có mùa vụ đang hoạt động để xuất vật tư.",
            );

            await loadSeasonsForIotMode();

            return;
        }

        setExportDevice(device);
    }

    async function handleConfirmExportMode(
        seasonId,
    ) {
        if (
            !exportDevice?.deviceId ||
            !seasonId
        ) {
            return;
        }

        clearActionError();

        const result =
            await updateWorkMode(
                exportDevice.deviceId,
                "EXPORT",
                seasonId,
            );

        if (!result) {
            toast.error(
                "Không thể gửi lệnh bật chế độ xuất vật tư.",
            );

            return;
        }

        toast.success(
            `Đã gửi lệnh xuất vật tư cho "${result.deviceName || result.deviceId}". Chờ thiết bị xác nhận.`,
        );

        setExportDevice(null);
    }

    async function handleStartHarvestMode(
        device,
    ) {
        if (!device?.deviceId) {
            return;
        }

        clearActionError();

        if (
            harvestableSeasons.length === 0
        ) {
            toast.error(
                "Chưa có mùa vụ HARVESTING để thu hoạch.",
            );

            await loadSeasonsForIotMode();

            return;
        }

        setHarvestDevice(device);
    }

    async function handleConfirmHarvestMode(
        seasonId,
    ) {
        if (
            !harvestDevice?.deviceId ||
            !seasonId
        ) {
            return;
        }

        clearActionError();

        const result =
            await updateWorkMode(
                harvestDevice.deviceId,
                "HARVEST",
                seasonId,
            );

        if (!result) {
            toast.error(
                "Không thể gửi lệnh bật chế độ thu hoạch.",
            );

            return;
        }

        toast.success(
            `Đã gửi lệnh thu hoạch cho "${result.deviceName || result.deviceId}". Chờ thiết bị xác nhận.`,
        );

        setHarvestDevice(null);
    }

    async function handleStopDeviceMode(
        device,
    ) {
        if (!device?.deviceId) {
            return;
        }

        clearActionError();

        const result =
            await updateWorkMode(
                device.deviceId,
                "IDLE",
                null,
            );

        if (!result) {
            toast.error(
                "Không thể gửi lệnh dừng thiết bị.",
            );

            return;
        }

        toast.success(
            `Đã gửi lệnh dừng cho "${result.deviceName || result.deviceId}". Chờ thiết bị xác nhận.`,
        );
    }

    async function handleCancelPendingCommand(
        device,
    ) {
        if (!device?.deviceId) {
            return;
        }

        clearActionError();

        const result =
            await cancelPendingCommand(
                device.deviceId,
            );

        if (!result) {
            toast.error(
                "Không thể hủy lệnh chờ của thiết bị.",
            );

            return;
        }

        toast.success(
            `Đã hủy lệnh chờ của "${result.deviceName || result.deviceId}".`,
        );
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
                <OwnerIotDevicesHeader />

                <OwnerIotDeviceStats
                    summary={summary}
                />

                <OwnerIotDeviceActivateCard
                    submitting={actionLoading}
                    onSubmit={
                        handleActivateDevice
                    }
                />

                <OwnerIotDeviceTable
                    devices={devices}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    actionLoading={actionLoading}
                    onPageChange={setPage}
                    onViewDetail={
                        openDetailDrawer
                    }
                    onStartImportMode={
                        handleStartImportMode
                    }
                    onStartExportMode={
                        handleStartExportMode
                    }
                    onStartHarvestMode={
                        handleStartHarvestMode
                    }
                    onStopDeviceMode={
                        handleStopDeviceMode
                    }
                    onCancelPendingCommand={
                        handleCancelPendingCommand
                    }
                />
            </section>

            <OwnerIotDeviceDetailDrawer
                open={detailDrawerOpen}
                device={selectedDevice}
                loading={detailLoading}
                onClose={closeDetailDrawer}
            />

            <OwnerIotDeviceApiKeyDrawer
                open={Boolean(apiKeyDevice)}
                device={apiKeyDevice}
                onClose={() =>
                    setApiKeyDevice(null)
                }
                onCopy={handleCopyApiKey}
            />

            <IotExportSeasonSelectDrawer
                mode="EXPORT"
                open={Boolean(exportDevice)}
                device={exportDevice}
                seasons={
                    exportableSeasons
                }
                loading={seasonLoading}
                submitting={actionLoading}
                onClose={() =>
                    setExportDevice(null)
                }
                onConfirm={
                    handleConfirmExportMode
                }
            />

            <IotExportSeasonSelectDrawer
                mode="HARVEST"
                open={Boolean(harvestDevice)}
                device={harvestDevice}
                seasons={
                    harvestableSeasons
                }
                loading={seasonLoading}
                submitting={actionLoading}
                onClose={() =>
                    setHarvestDevice(null)
                }
                onConfirm={
                    handleConfirmHarvestMode
                }
            />
        </>
    );
}

export default OwnerIotDevicesPage;
