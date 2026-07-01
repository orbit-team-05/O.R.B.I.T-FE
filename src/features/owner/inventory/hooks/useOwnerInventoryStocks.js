import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getOwnerInventoryStocks,
    getOwnerInventoryStockDetail,
} from "../services/ownerInventoryApi.js";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const INVENTORY_REALTIME_TOPICS = [
    "inventory",
    "iot-imports",
    "iot-exports",
    "products",
];

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerInventoryStocks(farmId, initialPage = 0, initialSize = 10) {
    const [stockPage, setStockPage] = useState(null);
    const [stocks, setStocks] = useState([]);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

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

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerInventoryStocks(farmId, page, size);

            setStockPage(data);
            setStocks(data?.content ?? []);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách tồn kho."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

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
        void loadStocks();
    }, [loadStocks]);

    const summary = useMemo(() => {
        const totalProducts = stocks.length;
        const lowStock = stocks.filter((item) => item.lowStock).length;
        const inventoryValue = stocks.reduce(
            (sum, item) => sum + Number(item.inventoryValue || 0),
            0,
        );

        return {
            totalProducts,
            lowStock,
            inventoryValue,
        };
    }, [stocks]);

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
            totalElements: stockPage?.totalElements ?? stocks.length,
            first: stockPage?.first ?? true,
            last: stockPage?.last ?? true,
        },

        loading,
        error,

        selectedStockDetail,
        setSelectedStockDetail,
        detailLoading,
        loadStockDetail,

        setPage,
        reload: loadStocks,
    };
}
