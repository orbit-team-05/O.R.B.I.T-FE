import { useCallback, useEffect, useState } from "react";

import {
    createIotDevice,
    getIotDeviceSummary,
    getIotDevices,
    getUnassignedIotDevices,
    replaceIotDeviceComponent,
    updateIotDeviceStatus,
} from "../services/iotDeviceApi";

export const DEVICE_TABLE_VIEW = {
    ALL: "ALL",
    UNASSIGNED: "UNASSIGNED",
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useAdminIotDevices(initialView = DEVICE_TABLE_VIEW.ALL) {
    const [activeView, setActiveView] = useState(initialView);

    const [devicePage, setDevicePage] = useState(null);

    const [summary, setSummary] = useState({
        totalDevices: 0,
        activeDevices: 0,
        unassignedDevices: 0,
        lostDevices: 0,
        inactiveDevices: 0,
        brokenDevices: 0,
    });

    const [allPage, setAllPage] = useState(0);
    const [unassignedPage, setUnassignedPage] = useState(0);

    const [allSize] = useState(10);
    const [unassignedSize] = useState(5);

    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const currentPage =
        activeView === DEVICE_TABLE_VIEW.UNASSIGNED ? unassignedPage : allPage;

    const currentSize =
        activeView === DEVICE_TABLE_VIEW.UNASSIGNED ? unassignedSize : allSize;

    const loadDeviceTable = useCallback(async () => {
        const devicesData =
            activeView === DEVICE_TABLE_VIEW.UNASSIGNED
                ? await getUnassignedIotDevices(unassignedPage, unassignedSize)
                : await getIotDevices(allPage, allSize);

        setDevicePage(devicesData);
    }, [activeView, allPage, allSize, unassignedPage, unassignedSize]);

    const loadInitialData = useCallback(async () => {
        try {
            setInitialLoading(true);
            setError("");

            const [devicesData, summaryData] = await Promise.all([
                activeView === DEVICE_TABLE_VIEW.UNASSIGNED
                    ? getUnassignedIotDevices(unassignedPage, unassignedSize)
                    : getIotDevices(allPage, allSize),
                getIotDeviceSummary(),
            ]);

            setDevicePage(devicesData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
        } finally {
            setInitialLoading(false);
        }
    }, [activeView, allPage, allSize, unassignedPage, unassignedSize]);

    const reloadTable = useCallback(async () => {
        try {
            setTableLoading(true);
            setError("");

            await loadDeviceTable();
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
        } finally {
            setTableLoading(false);
        }
    }, [loadDeviceTable]);

    const reloadAll = useCallback(async () => {
        try {
            setTableLoading(true);
            setError("");

            const [devicesData, summaryData] = await Promise.all([
                activeView === DEVICE_TABLE_VIEW.UNASSIGNED
                    ? getUnassignedIotDevices(unassignedPage, unassignedSize)
                    : getIotDevices(allPage, allSize),
                getIotDeviceSummary(),
            ]);

            setDevicePage(devicesData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
        } finally {
            setTableLoading(false);
        }
    }, [activeView, allPage, allSize, unassignedPage, unassignedSize]);

    useEffect(() => {
        loadInitialData();
        // chỉ chạy 1 lần lúc vào page
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (initialLoading) return;

        reloadTable();
    }, [activeView, allPage, unassignedPage, initialLoading, reloadTable]);

    function handleChangeView(nextView) {
        setActionError("");
        setError("");
        setActiveView(nextView);
    }

    function handleSetPage(nextPage) {
        const safePage = Math.max(Number(nextPage) || 0, 0);

        if (activeView === DEVICE_TABLE_VIEW.UNASSIGNED) {
            setUnassignedPage(safePage);
            return;
        }

        setAllPage(safePage);
    }

    async function handleCreateDevice(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            const createdDevice = await createIotDevice(payload);
            await reloadAll();

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
            await reloadAll();

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

    async function handleReplaceComponent(deviceId, payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await replaceIotDeviceComponent(deviceId, payload);
            await reloadAll();

            return true;
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Không thể thay linh kiện thiết bị."),
            );
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    return {
        activeView,
        setActiveView: handleChangeView,

        devices: devicePage?.content ?? [],
        summary,

        pageInfo: {
            number: devicePage?.number ?? currentPage,
            size: devicePage?.size ?? currentSize,
            totalPages: devicePage?.totalPages ?? 0,
            totalElements: devicePage?.totalElements ?? 0,
            first: devicePage?.first ?? true,
            last: devicePage?.last ?? true,
        },

        initialLoading,
        tableLoading,

        // giữ loading để page cũ không bị vỡ nếu đang dùng
        loading: initialLoading,

        error,
        setPage: handleSetPage,
        reload: reloadAll,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createDevice: handleCreateDevice,
        updateStatus: handleUpdateStatus,
        replaceComponent: handleReplaceComponent,
    };
}