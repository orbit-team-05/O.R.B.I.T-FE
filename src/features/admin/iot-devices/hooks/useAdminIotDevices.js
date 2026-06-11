import { useCallback, useEffect, useState } from "react";

import {
    createIotDevice,
    getIotDeviceSummary,
    getIotDevices,
    updateIotDeviceStatus,
} from "../services/iotDeviceApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useAdminIotDevices(initialPage = 0, initialSize = 10) {
    const [devicePage, setDevicePage] = useState(null);
    const [summary, setSummary] = useState({
        totalDevices: 0,
        activeDevices: 0,
        unassignedDevices: 0,
        lostDevices: 0,
        inactiveDevices: 0,
        brokenDevices: 0,
    });

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadDevices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [devicesData, summaryData] = await Promise.all([
                getIotDevices(page, size),
                getIotDeviceSummary(),
            ]);

            setDevicePage(devicesData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        loadDevices();
    }, [loadDevices]);

    async function handleCreateDevice(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            const createdDevice = await createIotDevice(payload);
            await loadDevices();

            return createdDevice;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo thiết bị IoT."));
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateStatus(deviceId, status) {
        try {
            setActionLoading(true);
            setActionError("");

            await updateIotDeviceStatus(deviceId, status);
            await loadDevices();

            return true;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể cập nhật trạng thái thiết bị."),
            );
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    return {
        devices: devicePage?.content ?? [],
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
        setPage,
        loading,
        error,
        reload: loadDevices,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createDevice: handleCreateDevice,
        updateStatus: handleUpdateStatus,
    };
}