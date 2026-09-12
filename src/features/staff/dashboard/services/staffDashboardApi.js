import { httpClient } from "../../../../services/httpClient";

export async function getStaffDashboard() {
    const response = await httpClient.get("/staff/dashboard");
    return response.data?.data ?? response.data ?? null;
}
