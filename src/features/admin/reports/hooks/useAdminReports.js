import { useCallback, useEffect, useState } from "react";

import {
    exportAdminSystemReport,
    exportAdminTransactionReport,
    getAdminSystemReport,
    getAdminTransactionReport,
    getReportFarms,
} from "../services/adminReportApi";

function toInputDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDefaultFilters() {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 29);

    return {
        from: toInputDate(from),
        to: toInputDate(today),
        farmId: "",
        requestedAction: "",
        approvalStatus: "",
        deviceId: "",
        keyword: "",
        page: 0,
        size: 50,
    };
}

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

const REPORT_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    farm: "farm,asc",
    quantityDesc: "quantity,desc",
    amountDesc: "amount,desc",
    status: "status,asc",
};

function downloadBlob(response, fallbackName) {
    const blob = response.data;
    const disposition = response.headers?.["content-disposition"] || "";
    const fileNameMatch = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const fileName = decodeURIComponent(fileNameMatch?.[1] || fileNameMatch?.[2] || fallbackName);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export function useAdminReports() {
    const [reportType, setReportType] = useState("transactions");
    const [filters, setFilters] = useState(getDefaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(getDefaultFilters);
    const [sortKey, setSortKey] = useState("createdDesc");
    const [transactionReport, setTransactionReport] = useState(null);
    const [systemReport, setSystemReport] = useState(null);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");

    const loadReport = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            if (reportType === "transactions") {
                setTransactionReport(await getAdminTransactionReport(appliedFilters));
            } else {
                setSystemReport(await getAdminSystemReport());
            }
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải báo cáo."));
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, reportType]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadReport();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [loadReport]);

    useEffect(() => {
        getReportFarms()
            .then((data) => setFarms(data || []))
            .catch(() => setFarms([]));
    }, []);

    async function applyFilters(nextFilters = filters) {
        setAppliedFilters({ ...nextFilters, page: 0 });
    }

    function changePage(page) {
        setAppliedFilters((current) => ({ ...current, page: Math.max(page, 0) }));
    }

    function changeSort(sort) {
        setSortKey(sort);
        setAppliedFilters((current) => ({
            ...current,
            sort: REPORT_SORTS[sort] || REPORT_SORTS.createdDesc,
            page: 0,
        }));
    }

    async function exportReport() {
        try {
            setExporting(true);
            setError("");
            if (reportType === "transactions") {
                const response = await exportAdminTransactionReport(appliedFilters);
                downloadBlob(response, `orbit-transaction-report-${appliedFilters.from}-to-${appliedFilters.to}.pdf`);
            } else {
                const response = await exportAdminSystemReport();
                downloadBlob(response, `orbit-system-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Không thể xuất báo cáo."));
        } finally {
            setExporting(false);
        }
    }

    function switchReportType(type) {
        setReportType(type);
        setError("");
    }

    return {
        reportType,
        switchReportType,
        filters,
        setFilters,
        applyFilters,
        transactionReport,
        systemReport,
        farms,
        loading,
        exporting,
        error,
        changePage,
        changeSort,
        sortKey,
        reload: loadReport,
        exportReport,
    };
}
