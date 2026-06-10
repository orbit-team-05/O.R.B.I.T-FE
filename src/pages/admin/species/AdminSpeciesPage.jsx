import { useEffect } from "react";

import {
    getSpecies,
    getSpeciesSummary,
} from "../../../features/admin/species/services/speciesApi";

export function AdminSpeciesPage() {
    useEffect(() => {
        async function loadData() {
            try {
                const speciesPage = await getSpecies(0, 10);
                const summary = await getSpeciesSummary();

                console.log("Species page:", speciesPage);
                console.log("Species summary:", summary);
            } catch (error) {
                console.error("Call API Species failed:", error);
            }
        }

        loadData();
    }, []);

    return <h1>Quản lý Species</h1>;
}