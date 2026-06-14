import { useEffect, useState } from "react";

import { useToast } from "../../../components/common/toast/ToastProvider";
import { OwnerIotDeviceActivateCard } from "../../../features/owner/iot-devices/components/OwnerIotDeviceActivateCard";
import { OwnerIotDeviceApiKeyDrawer } from "../../../features/owner/iot-devices/components/OwnerIotDeviceApiKeyDrawer";
import { OwnerIotDeviceDetailDrawer } from "../../../features/owner/iot-devices/components/OwnerIotDeviceDetailDrawer";
import { OwnerIotDeviceStats } from "../../../features/owner/iot-devices/components/OwnerIotDeviceStats";
import { OwnerIotDeviceTable } from "../../../features/owner/iot-devices/components/OwnerIotDeviceTable";
import { useOwnerIotDevices } from "../../../features/owner/iot-devices/hooks/useOwnerIotDevices";
import { useAuth } from "../../../features/auth/context/AuthContext";

const CURRENT_FARM_ID = 1;

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
                    Kích hoạt, theo dõi và kiểm tra thiết bị cân-camera của farm
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
        actionError,
        clearActionError,

        activateDevice,
        loadDeviceDetail,
    } = useOwnerIotDevices(farmId);

    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [apiKeyDevice, setApiKeyDevice] = useState(null);

    useEffect(() => {
        reload();
    }, [reload]);

    if (!farmId) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Tài khoản OWNER chưa có farmId. Vui lòng kiểm tra dữ liệu user/farm.
            </div>
        );
    }


    async function handleActivateDevice(payload) {
        const activatedDevice = await activateDevice(payload);

        if (!activatedDevice) {
            toast.error("Không thể kích hoạt thiết bị.");
            return false;
        }

        toast.success(`Đã kích hoạt thiết bị "${activatedDevice.deviceName}".`);

        if (activatedDevice.apiKey) {
            setApiKeyDevice(activatedDevice);
        }

        return true;
    }

    async function openDetailDrawer(device) {
        clearActionError();

        setDetailDrawerOpen(true);
        setSelectedDevice(device);

        await loadDeviceDetail(device.deviceId);
    }

    function closeDetailDrawer() {
        setDetailDrawerOpen(false);
        setSelectedDevice(null);
        clearActionError();
    }

    async function handleCopyApiKey(apiKey) {
        if (!apiKey) return;

        await navigator.clipboard.writeText(apiKey);
        toast.success("Đã copy API key.");
    }

    if (initialLoading) {
        return <OwnerIotDevicesSkeleton />;
    }

    if (error) {
        return (
            <section className="space-y-5">
                <OwnerIotDevicesHeader />

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

    return (
        <>
            <section className="space-y-5">
                <OwnerIotDevicesHeader />

                {actionError && !detailDrawerOpen && !apiKeyDevice && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <OwnerIotDeviceStats summary={summary} />

                <OwnerIotDeviceActivateCard
                    submitting={actionLoading}
                    error={actionError}
                    onSubmit={handleActivateDevice}
                />

                <OwnerIotDeviceTable
                    devices={devices}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onViewDetail={openDetailDrawer}
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
                onClose={() => setApiKeyDevice(null)}
                onCopy={handleCopyApiKey}
            />
        </>
    );
}