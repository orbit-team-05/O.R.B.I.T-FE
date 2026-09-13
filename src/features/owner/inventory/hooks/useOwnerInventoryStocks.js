import { useCallback, useEffect, useState } from "react";
import {
    getOwnerInventoryStocks,
    getOwnerInventoryStockDetail,
} from "../services/ownerInventoryApi.js";
import { getOwnerInventorySummary } from "../services/inventorySummaryApi.js";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const INVENTORY_REALTIME_TOPICS = [
    "inventory",
    "iot-imports",
    "iot-exports",
    "products",
];

const STOCK_SORTS = {
    createdDesc: "created,desc",
    updatedDesc: "updated,desc",
    nameAsc: "name,asc",
    nameDesc: "name,desc",
    quantityDesc: "quantity,desc",
    quantityAsc: "quantity,asc",
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerInventoryStocks(farmId, warehouseType = "MATERIAL", initialPage = 0, initialSize = 10) {
    const [stockPage, setStockPage] = useState(null);
    const [stocks, setStocks] = useState([]);
    const [summary, setSummary] = useState(null);

    const [category, setCategory] = useState("");
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);
    const [sortKey, setSortKeyState] = useState("createdDesc");

    useEffect(() => {
        // Reset the category/page when switching between material and product warehouses.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategory("");
        setPage(initialPage);
    }, [warehouseType, initialPage]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedStockDetail, setSelectedStockDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadStocks = useCallback(async () => {
        if (!farmId) {
            setStocks([]);
            setStockPage(null);
            setLoading(false);
            return;
        }
        
        if (category === "pending") {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [data, summaryData] = await Promise.all([
                getOwnerInventoryStocks(
                    farmId,
                    warehouseType === "PRODUCT" ? "" : category,
                    page,
                    size,
                    warehouseType,
                    STOCK_SORTS[sortKey] || STOCK_SORTS.createdDesc,
                ),
                getOwnerInventorySummary(farmId, warehouseType),
            ]);

            setStockPage(data);
            setStocks(data?.content ?? []);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách tồn kho."));
        } finally {
            setLoading(false);
        }
    }, [farmId, category, page, size, warehouseType, sortKey]);

    const loadStockDetail = useCallback(
        async (stockId) => {
            if (!farmId || !stockId) return null;

            try {
                setDetailLoading(true);
                setError("");

                const data = await getOwnerInventoryStockDetail(farmId, stockId);
                setSelectedStockDetail(data);

                return data;
            } catch (err) {
                setError(getErrorMessage(err, "Không thể tải chi tiết tồn kho."));
                return null;
            } finally {
                setDetailLoading(false);
            }
        },
        [farmId],
    );

    useEffect(() => {
        // Start the async inventory loading lifecycle.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadStocks();
    }, [loadStocks]);

    useFarmRealtimeRefresh(farmId, INVENTORY_REALTIME_TOPICS, async () => {
        await loadStocks();

        if (selectedStockDetail?.id) {
            await loadStockDetail(selectedStockDetail.id);
        }
    });

    return {
        stocks,
        summary,

        pageInfo: {
            number: stockPage?.number ?? stockPage?.page ?? page,
            size: stockPage?.size ?? size,
            totalPages: stockPage?.totalPages ?? 0,
            totalElements: stockPage?.totalElements ?? 0,
            first: stockPage?.first ?? true,
            last: stockPage?.last ?? true,
        },

        loading,
        error,

        selectedStockDetail,
        setSelectedStockDetail,
        detailLoading,
        loadStockDetail,

        category,
        setCategory,
        setPage,
        sortKey,
        setSortKey: (nextSortKey) => {
            setSortKeyState(nextSortKey);
            setPage(0);
        },
        reload: loadStocks,
    };
}
