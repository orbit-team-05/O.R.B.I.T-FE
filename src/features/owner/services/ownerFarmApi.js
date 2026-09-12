import { httpClient } from "../../../services/httpClient";

export const getMyFarm = async () => {
    const response = await httpClient.get("/me/farm");
    return response.data.data || response.data;
};

export const updateMyFarm = async (payload) => {
    const response = await httpClient.patch("/me/farm", payload);
    return response.data.data || response.data;
};

export async function uploadFarmImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post("/me/farm/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data.data || response.data;
}

export async function searchFarmLocations(query, country = "VN") {
    const response = await httpClient.get("/me/farm/location/search", {
        params: { query, country },
    });
    return response.data.data || [];
}

export async function reverseFarmLocation(latitude, longitude) {
    const response = await httpClient.get("/me/farm/location/reverse", {
        params: { latitude, longitude },
    });
    return response.data.data || null;
}
