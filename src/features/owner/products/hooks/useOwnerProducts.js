import { useCallback, useMemo, useState } from "react";
import {
    createOwnerProduct,
    getOwnerProducts,
} from "../services/ownerProductApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const PRODUCT_REALTIME_TOPICS = ["products"];

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerProducts(farmId, initialPage = 0, initialSize = 10) {
    const [productPage, setProductPage] = useState(null);
    const [createdProduct, setCreatedProduct] = useState(null);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const products = productPage?.content ?? [];

    const loadProducts = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerProducts(farmId, page, size);
            setProductPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách sản phẩm."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    async function createProduct(payload) {
        if (!farmId) return null;

        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");

            const data = await createOwnerProduct(farmId, payload);

            setCreatedProduct(data);
            setActionSuccess("Tạo sản phẩm thành công.");

            await loadProducts();

            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo sản phẩm."));
            return null;
        } finally {
            setSubmitting(false);
        }
    }

    const summary = useMemo(() => {
        return {
            totalProducts: productPage?.totalElements ?? products.length,
            feed: products.filter((item) => item.category === "FEED").length,
            medicine: products.filter((item) => item.category === "MEDICINE").length,
            chemical: products.filter((item) => item.category === "CHEMICAL").length,
        };
    }, [productPage?.totalElements, products]);

    useFarmRealtimeRefresh(farmId, PRODUCT_REALTIME_TOPICS, loadProducts);

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        products,
        createdProduct,
        setCreatedProduct,
        summary,

        pageInfo: {
            number: productPage?.number ?? productPage?.page ?? page,
            size: productPage?.size ?? size,
            totalPages: productPage?.totalPages ?? 0,
            totalElements: productPage?.totalElements ?? 0,
            first: productPage?.first ?? true,
            last: productPage?.last ?? true,
        },

        loading,
        initialLoading: loading && productPage === null,
        tableLoading: loading && productPage !== null,
        submitting,

        error,
        actionError,
        actionSuccess,

        setPage: handleSetPage,
        reload: loadProducts,
        createProduct,
        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}
