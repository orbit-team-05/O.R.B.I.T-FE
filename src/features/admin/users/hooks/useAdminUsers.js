import { useCallback, useEffect, useState } from "react";
import { getUsers, getUserDashboard, createUser, updateUser, updateUserStatus, getRoles, getFarms } from "../services/userApi";
import { useAdminRealtimeRefresh } from "../../../../hooks/useFarmTopic";

const INITIAL_SUMMARY = {
    totalUsers: 0,
    totalOwners: 0,
    totalStaffs: 0,
    totalAdmins: 0,
};

const USER_REALTIME_TOPICS = ["users", "farms"];

function getErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallbackMessage
    );
}

export function useAdminUsers(initialPage = 0, initialSize = 10) {
    const [usersPage, setUsersPage] = useState(null);
    const [summary, setSummary] = useState(INITIAL_SUMMARY);
    const [roles, setRoles] = useState([]);
    const [farms, setFarms] = useState([]);
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);
    const [filters, setFilters] = useState({ keyword: "", role: "", status: "", farmId: "" });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [usersData, summaryData] = await Promise.all([
                getUsers(page, size, {
                    ...filters,
                    farmId: filters.farmId || undefined,
                    role: filters.role || undefined,
                    status: filters.status || undefined,
                }),
                getUserDashboard(),
            ]);

            setUsersPage(usersData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải dữ liệu người dùng."));
        } finally {
            setLoading(false);
        }
    }, [filters, page, size]);

    // Load additional resources for form once
    useEffect(() => {
        async function loadFormData() {
            try {
                const [rolesData, farmsData] = await Promise.all([
                    getRoles(),
                    getFarms(),
                ]);
                setRoles(rolesData);
                setFarms(farmsData);
            } catch (err) {
                console.error("Không thể tải danh mục Roles/Farms:", err);
            }
        }
        loadFormData();
    }, []);

    useEffect(() => {
        // This effect synchronizes the list with page and filter state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, [loadUsers]);

    useAdminRealtimeRefresh(USER_REALTIME_TOPICS, loadUsers);

    async function handleCreateUser(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            const createdUser = await createUser(payload);
            await loadUsers();

            return createdUser;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo người dùng mới."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateUser(userId, payload) {
        console.log("useAdminUsers handleUpdateUser called, userId:", userId, "payload:", payload);
        try {
            setActionLoading(true);
            setActionError("");

            const res = await updateUser(userId, payload);
            console.log("useAdminUsers: updateUser API response:", res);

            console.log("useAdminUsers: loading users...");
            await loadUsers();
            console.log("useAdminUsers: loadUsers completed");

            return true;
        } catch (err) {
            console.error("useAdminUsers: handleUpdateUser failed with error:", err);
            setActionError(getErrorMessage(err, "Không thể cập nhật người dùng."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleToggleUserStatus(user) {
        const currentActive = user.status === "ACTIVE";
        const nextActive = !currentActive;

        try {
            setActionLoading(true);
            setActionError("");

            await updateUserStatus(user.id, nextActive);
            await loadUsers();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể cập nhật trạng thái người dùng."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    function updateFilters(nextFilters) {
        setFilters((previous) => ({ ...previous, ...nextFilters }));
        setPage(0);
    }

    const hasActiveFilters = Boolean(
        filters.keyword?.trim()
        || filters.role
        || filters.status
        || filters.farmId,
    );
    const responseTotalElements = usersPage?.totalElements ?? 0;
    // The dashboard count is a safe fallback only for the unfiltered list.
    // This keeps pagination usable when an older API instance returns the
    // current page length instead of the full count.
    const totalElements = !hasActiveFilters && Number(summary.totalUsers) > Number(responseTotalElements)
        ? Number(summary.totalUsers)
        : Number(responseTotalElements);
    const usingDashboardFallback = totalElements !== Number(responseTotalElements);
    const totalPages = usingDashboardFallback || !(usersPage?.totalPages > 0)
        ? totalElements > 0
            ? Math.ceil(totalElements / (usersPage?.size ?? size))
            : 0
        : usersPage.totalPages;

    return {
        users: usersPage?.content ?? [],
        summary,
        roles,
        farms,
        pageInfo: {
            number: usersPage?.number ?? page,
            size: usersPage?.size ?? size,
            totalPages,
            totalElements,
            first: usersPage?.first ?? true,
            last: usersPage?.last ?? true,
        },
        page,
        setPage: handleSetPage,
        filters,
        updateFilters,
        loading,
        initialLoading: loading && usersPage === null,
        tableLoading: loading && usersPage !== null,
        error,
        reload: loadUsers,

        actionLoading,
        actionError,
        clearActionError: () => setActionError(""),
        createUser: handleCreateUser,
        updateUser: handleUpdateUser,
        toggleUserStatus: handleToggleUserStatus,
    };
}
