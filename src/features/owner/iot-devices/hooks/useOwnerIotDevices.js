import { useCallback, useMemo, useState } from "react";

import {
    activateOwnerIotDevice,
    getOwnerLatestScaleWeight,
    getOwnerScaleDeviceAuditLogs,
    getOwnerIotDeviceDetail,
    getOwnerIotDevices,
    updateOwnerScaleDeviceProfile,
    uploadOwnerScaleDeviceImage,
} from "../services/ownerIotDeviceApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const IOT_DEVICE_REALTIME_TOPICS = ["iot-devices"];

const DEVICE_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    nameAsc: "name,asc",
    status: "status,asc",
    lastSeenDesc: "lastSeen,desc",
};

const AUDIT_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    action: "action,asc",
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerIotDevices(farmId, initialPage = 0, initialSize = 10) {
    const [devicePage, setDevicePage] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);
    const [sortKey, setSortKeyState] = useState("createdDesc");

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const devices = useMemo(() => devicePage?.content ?? [], [devicePage?.content]);

    const loadDevices = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerIotDevices(
                farmId,
                page,
                size,
                DEVICE_SORTS[sortKey] || DEVICE_SORTS.createdDesc,
            );
            setDevicePage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size, sortKey]);

    const summary = useMemo(() => {
        const totalDevices = devicePage?.totalElements ?? 0;

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

    async function refreshLatestWeight(deviceId) {
        if (!farmId || !deviceId) return null;
        try {
            const latest = await getOwnerLatestScaleWeight(farmId, deviceId);
            setSelectedDevice((current) => current && current.deviceId === deviceId
                ? { ...current, lastWeightGrams: latest.weightGrams, lastWeightAt: latest.capturedAt }
                : current);
            return latest;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể lấy khối lượng mới nhất."));
            return null;
        }
    }

    async function loadAuditLogs(deviceId, auditPage = 0, auditSortKey = "createdDesc") {
        if (!farmId || !deviceId) return null;
        try {
            const data = await getOwnerScaleDeviceAuditLogs(
                farmId,
                deviceId,
                auditPage,
                10,
                AUDIT_SORTS[auditSortKey] || AUDIT_SORTS.createdDesc,
            );
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải nhật ký thiết bị."));
            return null;
        }
    }

    async function updateDeviceProfile(deviceId, payload) {
        if (!farmId || !deviceId) return null;
        try {
            setActionLoading(true);
            setActionError("");
            const data = await updateOwnerScaleDeviceProfile(farmId, deviceId, payload);
            setSelectedDevice(data);
            await loadDevices();
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật thông tin thiết bị."));
            return null;
        } finally {
            setActionLoading(false);
        }
    }

    async function uploadDeviceImage(deviceId, file) {
        if (!farmId || !deviceId || !file) return null;
        if (file.size > 20 * 1024 * 1024) {
            setActionError("Ảnh thiết bị không được vượt quá 20MB.");
            return null;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setActionError("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.");
            return null;
        }
        try {
            setActionLoading(true);
            setActionError("");
            const data = await uploadOwnerScaleDeviceImage(farmId, deviceId, file);
            setSelectedDevice(data);
            await loadDevices();
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật ảnh thiết bị."));
            return null;
        } finally {
            setActionLoading(false);
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
        sortKey,
        setSortKey: (nextSortKey) => {
            setSortKeyState(nextSortKey);
            setPage(0);
        },

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

        loadDeviceDetail,
        refreshLatestWeight,
        loadAuditLogs,
        updateDeviceProfile,
        uploadDeviceImage,
    };
}
