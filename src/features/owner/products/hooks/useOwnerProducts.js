import { useCallback, useMemo, useState } from "react";
import {
    createOwnerProduct,
    getOwnerProducts,
    uploadOwnerProductImage,
    updateOwnerProduct,
    updateOwnerProductStatus,
    uploadOwnerProductImageForProduct,
} from "../services/ownerProductApi";
import { useFarmRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const PRODUCT_REALTIME_TOPICS = ["products"];

const PRODUCT_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    nameAsc: "name,asc",
    nameDesc: "name,desc",
    stockAsc: "stock,asc",
    category: "category,asc",
};

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerProducts(farmId, initialPage = 0, initialSize = 10) {
    const [productPage, setProductPage] = useState(null);
    const [createdProduct, setCreatedProduct] = useState(null);

    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);
    const [sortKey, setSortKeyState] = useState("createdDesc");
    const [filters, setFilters] = useState({ keyword: "", category: "", status: "" });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const products = useMemo(() => productPage?.content ?? [], [productPage?.content]);

    const loadProducts = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerProducts(
                farmId,
                page,
                size,
                filters,
                PRODUCT_SORTS[sortKey] || PRODUCT_SORTS.createdDesc,
            );
            setProductPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách sản phẩm."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size, filters, sortKey]);

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

    async function uploadProductImage(file) {
        if (!farmId || !file) return null;
        try {
            return await uploadOwnerProductImage(farmId, file);
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải lên ảnh nền."));
            return null;
        }
    }

    async function saveProduct(productId, payload) {
        try {
            setSubmitting(true);
            setActionError("");
            const data = await updateOwnerProduct(farmId, productId, payload);
            await loadProducts();
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật sản phẩm."));
            return null;
        } finally {
            setSubmitting(false);
        }
    }

    async function changeProductStatus(productId, status) {
        try {
            setSubmitting(true);
            setActionError("");
            const data = await updateOwnerProductStatus(farmId, productId, status);
            await loadProducts();
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật trạng thái sản phẩm."));
            return null;
        } finally {
            setSubmitting(false);
        }
    }

    async function uploadImageForProduct(productId, file) {
        try {
            setSubmitting(true);
            setActionError("");
            const data = await uploadOwnerProductImageForProduct(farmId, productId, file);
            await loadProducts();
            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải ảnh sản phẩm."));
            return null;
        } finally {
            setSubmitting(false);
        }
    }

    const summary = useMemo(() => {
        return {
            totalProducts: productPage?.totalElements ?? 0,
            feed: products.filter((item) => item.category === "FEED").length,
            medicine: products.filter((item) => item.category === "MEDICINE").length,
            chemical: products.filter((item) => item.category === "CHEMICAL").length,
        };
    }, [productPage?.totalElements, products]);

    useFarmRealtimeRefresh(farmId, PRODUCT_REALTIME_TOPICS, loadProducts);

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    function setSortKey(nextSortKey) {
        setSortKeyState(nextSortKey);
        setPage(0);
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
        sortKey,
        setSortKey,
        filters,
        setFilters,
        reload: loadProducts,
        createProduct,
        uploadProductImage,
        saveProduct,
        changeProductStatus,
        uploadImageForProduct,
        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}
