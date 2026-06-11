import { httpClient } from "../../../../services/httpClient";

const SPECIES_ENDPOINT = "/admin/species";

export async function getSpecies(page = 0, size = 10) {
    const response = await httpClient.get(SPECIES_ENDPOINT, {
        params: { page, size },
    });

    return response.data.data;
}

export async function getSpeciesSummary() {
    const response = await httpClient.get(`${SPECIES_ENDPOINT}/summary`);

    return response.data.data;
}

export async function createSpecies(payload) {
    const response = await httpClient.post(SPECIES_ENDPOINT, payload);

    return response.data.data;
}

export async function updateSpecies(speciesId, payload) {
    const response = await httpClient.put(
        `${SPECIES_ENDPOINT}/${speciesId}`,
        payload,
    );

    return response.data.data;
}

export async function updateSpeciesStatus(speciesId, isActive) {
    const response = await httpClient.patch(
        `${SPECIES_ENDPOINT}/${speciesId}/status`,
        null,
        {
            params: { isActive },
        },
    );

    return response.data.data;
}