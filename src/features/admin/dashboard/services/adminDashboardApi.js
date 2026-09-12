import { httpClient } from "../../../../services/httpClient";

export async function getAdminDashboardSummary() {
    const response = await httpClient.get("/admin/dashboard/summary");
    return response.data.data;
}
