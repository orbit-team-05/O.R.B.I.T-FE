import { httpClient } from "../../../../services/httpClient";

const SPECIES_ENDPOINT = "/admin/species";

export async function getSpecies(page = 0, size = 10) {
    const response = await httpClient.get(SPECIES_ENDPOINT, {
        params: {
            page,
            size,
        },
    });

    return response.data.data;
}

export async function getSpeciesSummary() {
    const response = await httpClient.get(`${SPECIES_ENDPOINT}/summary`);

    return response.data.data;
}