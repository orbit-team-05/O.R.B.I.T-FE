import { useCallback, useMemo, useState } from "react";

import {
    activateOwnerIotDevice,
    cancelOwnerIotDevicePendingCommand,
    getOwnerIotDeviceDetail,
    getOwnerIotDevices,
    updateOwnerIotDeviceWorkMode,
} from "../services/ownerIotDeviceApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const IOT_DEVICE_REALTIME_TOPICS = ["iot-devices"];

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerIotDevices(farmId, initialPage = 0, initialSize = 10) {
    const [devicePage, setDevicePage] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const devices = devicePage?.content ?? [];

    const loadDevices = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerIotDevices(farmId, page, size);
            setDevicePage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    const summary = useMemo(() => {
        const totalDevices = devicePage?.totalElements ?? devices.length;

        const activeDevices = devices.filter(
            (item) => item.status === "ACTIVE",
        ).length;

        const inactiveDevices = devices.filter(
            (item) => item.status === "INACTIVE",
        ).length;

        const lostDevices = devices.filter(
            (item) => item.status === "LOST",
        ).length;

        return {
            totalDevices,
            activeDevices,
            inactiveDevices,
            lostDevices,
        };
    }, [devicePage?.totalElements, devices]);

    async function loadDeviceDetail(deviceId) {
        if (!farmId || !deviceId) return null;

        try {
            setDetailLoading(true);
            setActionError("");

            const data = await getOwnerIotDeviceDetail(farmId, deviceId);
            setSelectedDevice(data);

            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải chi tiết thiết bị."));
            return null;
        } finally {
            setDetailLoading(false);
        }
    }

    useFarmRealtimeRefresh(farmId, IOT_DEVICE_REALTIME_TOPICS, async () => {
        await loadDevices();

        if (selectedDevice?.deviceId) {
            await loadDeviceDetail(selectedDevice.deviceId);
        }
    });

    async function handleActivateDevice(payload) {
        if (!farmId) return null;

        try {
            setActionLoading(true);
            setActionError("");

            const data = await activateOwnerIotDevice(farmId, payload);
            await loadDevices();

            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể kích hoạt thiết bị."));
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateWorkMode(deviceId, mode, seasonId = null) {
        if (!farmId || !deviceId) return null;

        try {
            setActionLoading(true);
            setActionError("");

            const payload = {
                mode,
                seasonId,
            };

            const data = await updateOwnerIotDeviceWorkMode(
                farmId,
                deviceId,
                payload,
            );

            await loadDevices();

            return data;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể cập nhật chế độ thiết bị."),
            );
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCancelPendingCommand(deviceId) {
        if (!farmId || !deviceId) return null;

        try {
            setActionLoading(true);
            setActionError("");

            const data = await cancelOwnerIotDevicePendingCommand(
                farmId,
                deviceId,
            );

            await loadDevices();

            return data;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể hủy lệnh chờ của thiết bị."),
            );
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        devices,
        selectedDevice,
        setSelectedDevice,

        summary,

        pageInfo: {
            number: devicePage?.number ?? page,
            size: devicePage?.size ?? size,
            totalPages: devicePage?.totalPages ?? 0,
            totalElements: devicePage?.totalElements ?? 0,
            first: devicePage?.first ?? true,
            last: devicePage?.last ?? true,
        },

        page,
        setPage: handleSetPage,

        loading,
        initialLoading: loading && devicePage === null,
        tableLoading: loading && devicePage !== null,
        detailLoading,

        error,
        reload: loadDevices,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),

        activateDevice: handleActivateDevice,
        updateWorkMode: handleUpdateWorkMode,
        cancelPendingCommand: handleCancelPendingCommand,

        loadDeviceDetail,
    };
}
