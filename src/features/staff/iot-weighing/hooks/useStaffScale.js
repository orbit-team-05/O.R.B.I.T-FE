import { useCallback, useEffect, useState } from "react";
import { getStaffLatestWeight, getStaffScaleDevices } from "../services/staffScaleApi";

function errorMessage(error, fallback) {
    return error?.response?.data?.message || error?.message || fallback;
}

export function useStaffScale(farmId) {
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState("");
    const [latestWeight, setLatestWeight] = useState(null);
    const [loading, setLoading] = useState(Boolean(farmId));
    const [weightLoading, setWeightLoading] = useState(false);
    const [error, setError] = useState("");
    const [weightError, setWeightError] = useState("");

    const activeDevices = devices.filter((device) => device.status === "ACTIVE");
    const selectedDevice = activeDevices.find((device) => device.deviceId === selectedDeviceId) || null;

    const reload = useCallback(async () => {
        if (!farmId) {
            setDevices([]);
            setSelectedDeviceId("");
            setLoading(false);
            setError("Tài khoản Staff chưa được gán Farm.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const nextDevices = await getStaffScaleDevices(farmId);
            setDevices(nextDevices);
            setSelectedDeviceId((current) => activeDeviceId(nextDevices, current));
        } catch (requestError) {
            setError(errorMessage(requestError, "Không thể tải danh sách thiết bị cân."));
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    const refreshWeight = useCallback(async (deviceId = selectedDeviceId) => {
        if (!farmId || !deviceId) return null;
        setWeightLoading(true);
        setWeightError("");
        try {
            const weight = await getStaffLatestWeight(farmId, deviceId);
            setLatestWeight(weight);
            return weight;
        } catch (requestError) {
            setWeightError(errorMessage(requestError, "Không thể lấy khối lượng mới nhất từ cân."));
            return null;
        } finally {
            setWeightLoading(false);
        }
    }, [farmId, selectedDeviceId]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void reload(); }, 0);
        return () => window.clearTimeout(timer);
    }, [reload]);

    function selectDevice(deviceId) {
        setSelectedDeviceId(deviceId);
        setLatestWeight(null);
        setWeightError("");
    }

    return {
        devices: activeDevices,
        selectedDevice,
        selectedDeviceId,
        selectDevice,
        latestWeight,
        loading,
        weightLoading,
        error,
        weightError,
        reload,
        refreshWeight,
    };
}

function activeDeviceId(devices, current) {
    const activeDevices = devices.filter((device) => device.status === "ACTIVE");
    return activeDevices.some((device) => device.deviceId === current) ? current : activeDevices[0]?.deviceId || "";
}
