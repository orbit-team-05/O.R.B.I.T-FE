import { useCallback, useEffect, useState } from "react";
import { getUsers, getUserDashboard, createUser, updateUser, updateUserStatus, getRoles, getFarms } from "../services/userApi";

const INITIAL_SUMMARY = {
    totalUsers: 0,
    totalOwners: 0,
    totalStaffs: 0,
    totalAdmins: 0,
};

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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [usersData, summaryData] = await Promise.all([
                getUsers(page, size),
                getUserDashboard(),
            ]);

            setUsersPage(usersData);
            setSummary(summaryData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải dữ liệu người dùng."));
        } finally {
            setLoading(false);
        }
    }, [page, size]);

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
        loadUsers();
    }, [loadUsers]);

    async function handleCreateUser(payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await createUser(payload);
            await loadUsers();

            return true;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tạo người dùng mới."));
            return false;
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateUser(userId, payload) {
        try {
            setActionLoading(true);
            setActionError("");

            await updateUser(userId, payload);
            await loadUsers();

            return true;
        } catch (err) {
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

    return {
        users: usersPage?.content ?? [],
        summary,
        roles,
        farms,
        pageInfo: {
            number: usersPage?.number ?? page,
            size: usersPage?.size ?? size,
            totalPages: usersPage?.totalPages ?? 0,
            totalElements: usersPage?.totalElements ?? 0,
            first: usersPage?.first ?? true,
            last: usersPage?.last ?? true,
        },
        page,
        setPage: handleSetPage,
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
