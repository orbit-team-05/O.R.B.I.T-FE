import { httpClient } from "../../../services/httpClient";

export const getStaffs = async ({ page = 0, size = 10, keyword = "", role = "", status = "" }) => {
    const response = await httpClient.get("/owner/staff", {
        params: { page, size, keyword, role: role || undefined, status: status || undefined }
    });
    return response.data.data || response.data;
};

export const getStaff = async (id) => {
    const response = await httpClient.get(`/owner/staff/${id}`);
    return response.data.data || response.data;
};

export const createStaff = async (payload) => {
    const response = await httpClient.post("/owner/staff", payload);
    return response.data.data || response.data;
};

export const toggleStaffStatus = async (id, active) => {
    await httpClient.put(`/owner/staff/${id}/status`, { active });
};

export const resetStaffPassword = async (id, newPassword) => {
    await httpClient.put(`/owner/staff/${id}/reset-password`, { newPassword });
};

export const updateStaff = async (id, payload) => {
    const response = await httpClient.patch(`/owner/staff/${id}`, payload);
    return response.data.data || response.data;
};

export const uploadStaffAvatar = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post(`/owner/staff/${id}/avatar`, formData);
    return response.data.data || response.data;
};

export const getStaffAuditLogs = async (id, { page = 0, size = 20 } = {}) => {
    const response = await httpClient.get(`/owner/staff/${id}/audit-logs`, {
        params: { page, size },
    });
    return response.data.data || response.data;
};
