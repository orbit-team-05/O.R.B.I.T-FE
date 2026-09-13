import { useCallback, useEffect, useState } from "react";

import {
    createIotDeviceFromMac,
    getIotDeviceSummary,
    getIotDevices,
    getUnassignedIotDevices,
    getUncreatedIotDevices,
    updateIotDeviceStatus,
} from "../services/iotDeviceApi";
import { useAdminRealtimeRefresh } from "../../../../hooks/useFarmTopic";

export const DEVICE_TABLE_VIEW = {
    ALL: "ALL",
    UNCREATED: "UNCREATED",
    UNASSIGNED: "UNASSIGNED",
};

const IOT_DEVICE_REALTIME_TOPICS = ["iot-devices"];

const DEVICE_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    nameAsc: "name,asc",
    nameDesc: "name,desc",
    status: "status,asc",
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useAdminIotDevices(initialView = DEVICE_TABLE_VIEW.ALL) {
    const [activeView, setActiveView] = useState(initialView);
    const [devicePage, setDevicePage] = useState(null);
    const [summary, setSummary] = useState({
        totalDevices: 0,
        uncreatedDevices: 0,
        unassignedDevices: 0,
        activeDevices: 0,
        inactiveDevices: 0,
        lostDevices: 0,
        brokenDevices: 0,
    });
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [sortKey, setSortKeyState] = useState("createdDesc");
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadPage = useCallback(async () => {
        if (activeView === DEVICE_TABLE_VIEW.UNCREATED) {
            return getUncreatedIotDevices(page, pageSize, DEVICE_SORTS[sortKey] || DEVICE_SORTS.createdDesc);
        }
        if (activeView === DEVICE_TABLE_VIEW.UNASSIGNED) {
            return getUnassignedIotDevices(page, pageSize, DEVICE_SORTS[sortKey] || DEVICE_SORTS.createdDesc);
        }
        return getIotDevices(page, pageSize, DEVICE_SORTS[sortKey] || DEVICE_SORTS.createdDesc);
    }, [activeView, page, pageSize, sortKey]);

    const loadAll = useCallback(async () => {
        const [pageData, summaryData] = await Promise.all([
            loadPage(),
            getIotDeviceSummary(),
        ]);
        setDevicePage(pageData);
        setSummary(summaryData);
    }, [loadPage]);

    const reload = useCallback(async () => {
        try {
            setTableLoading(true);
            setError("");
            await loadAll();
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải dữ liệu thiết bị cân."));
        } finally {
            setTableLoading(false);
            setInitialLoading(false);
        }
    }, [loadAll]);

    // Load the current page when filters or pagination change.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        reload();
    }, [reload]);

    useAdminRealtimeRefresh(IOT_DEVICE_REALTIME_TOPICS, reload);

    function handleChangeView(nextView) {
        setActionError("");
        setError("");
        setPage(0);
        setActiveView(nextView);
    }

    function setSortKey(nextSortKey) {
        setSortKeyState(nextSortKey);
        setPage(0);
    }

    async function handleCreateFromMac(macRecordId, payload) {
        try {
            setActionLoading(true);
            setActionError("");
            const created = await createIotDeviceFromMac(macRecordId, payload);
            await loadAll();
            return created;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo thiết bị cân."));
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateStatus(deviceId, status) {
        try {
            setActionLoading(true);
            setActionError("");
            const updated = await updateIotDeviceStatus(deviceId, status);
            await loadAll();
            return updated;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật trạng thái thiết bị."));
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    return {
        activeView,
        setActiveView: handleChangeView,
        devices: devicePage?.content ?? [],
        summary,
        sortKey,
        setSortKey,
        pageInfo: {
            number: devicePage?.number ?? page,
            size: devicePage?.size ?? pageSize,
            totalPages: devicePage?.totalPages ?? 0,
            totalElements: devicePage?.totalElements ?? 0,
            first: devicePage?.first ?? true,
            last: devicePage?.last ?? true,
        },
        initialLoading,
        tableLoading,
        error,
        setPage: (nextPage) => setPage(Math.max(Number(nextPage) || 0, 0)),
        reload,
        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createFromMac: handleCreateFromMac,
        updateStatus: handleUpdateStatus,
    };
}
