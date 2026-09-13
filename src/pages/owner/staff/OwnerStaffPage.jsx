import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarDays,
    ChevronRight,
    Clock3,
    Edit3,
    FileClock,
    KeyRound,
    Mail,
    Plus,
    Search,
    ShieldAlert,
    ShieldCheck,
    UploadCloud,
    UserRound,
    X,
} from "lucide-react";

import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import Pagination from "../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../components/common/sort/SortSelect";
import { PasswordInput } from "../../../components/common/form/PasswordInput";
import { ImagePreviewModal } from "../../../components/ui/ImagePreviewModal";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { OwnerPageHeader } from "../common/OwnerPageHeader";
import {
    createStaff,
    getStaff,
    getStaffAuditLogs,
    getStaffs,
    resetStaffPassword,
    toggleStaffStatus,
    updateStaff,
    uploadStaffAvatar,
} from "../../../features/owner/services/ownerStaffApi";

const STAFF_SORTS = {
    createdDesc: "created,desc",
    nameAsc: "name,asc",
    nameDesc: "name,desc",
    lastLoginDesc: "lastLogin,desc",
    status: "status,asc",
};

const AUDIT_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    action: "action,asc",
};

const EMPTY_FORM = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "STAFF",
};

const MAX_AVATAR_SIZE = 20 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatDate(value) {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback;
}

function getRoleLabel(staff) {
    return staff?.roleLabel
        || (staff?.roleCode === "FARM_MANAGER" || staff?.roles?.includes("FARM_MANAGER")
            ? "Quản lý Farm"
            : "Nhân viên");
}

function getInitials(fullName, username) {
    const value = fullName || username || "?";
    return value
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((item) => item[0])
        .join("")
        .toUpperCase();
}

function Avatar({ staff, size = "md", onClick }) {
    const sizes = {
        md: "h-11 w-11 text-sm",
        lg: "h-20 w-20 text-xl",
    };
    const className = [
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 font-semibold text-[#006948]",
        sizes[size] || sizes.md,
        onClick ? "cursor-zoom-in" : "",
    ].join(" ");

    if (staff?.avatarUrl) {
        return (
            <button type="button" className={className} onClick={onClick} aria-label="Xem ảnh đại diện">
                <img src={staff.avatarUrl} alt={staff.fullName || "Avatar"} className="h-full w-full object-cover" />
            </button>
        );
    }

    return <div className={className}>{getInitials(staff?.fullName, staff?.username)}</div>;
}

function StatusBadge({ status }) {
    const active = status === "ACTIVE";
    return (
        <span className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
        ].join(" ")}>
            <span className={["h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-slate-400"].join(" ")} />
            {active ? "Đang hoạt động" : "Đã khóa"}
        </span>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <div className="mt-1 text-sm text-slate-800">{children || "Chưa cập nhật"}</div>
        </div>
    );
}

export function OwnerStaffPage() {
    const toast = useToast();
    const { user } = useAuth();
    const isOwner = user?.role === "OWNER" || user?.roles?.includes("OWNER");
    const isFarmManager = user?.role === "FARM_MANAGER" || user?.roles?.includes("FARM_MANAGER");
    const canManageStaff = isOwner || isFarmManager;

    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(0);
    const [sortKey, setSortKeyState] = useState("createdDesc");
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [panel, setPanel] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState("overview");
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditPage, setAuditPage] = useState(0);
    const [auditPageInfo, setAuditPageInfo] = useState({ totalPages: 0, totalElements: 0, size: 10 });
    const [auditSortKey, setAuditSortKey] = useState("createdDesc");
    const [auditLoading, setAuditLoading] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const loadStaffs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getStaffs({
                page,
                size: 10,
                keyword,
                role: roleFilter,
                status: statusFilter,
                sort: STAFF_SORTS[sortKey] || STAFF_SORTS.createdDesc,
            });
            setStaffs(data?.content || []);
            setTotalPages(data?.totalPages || 0);
            setTotalElements(data?.totalElements || 0);
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể tải danh sách nhân sự."));
        } finally {
            setLoading(false);
        }
    }, [keyword, page, roleFilter, statusFilter, sortKey, toast]);

    useEffect(() => {
        // This effect synchronizes the page with server-side filters and pagination.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadStaffs();
    }, [loadStaffs]);

    const loadDetail = useCallback(async (staff) => {
        setSelectedStaff(staff);
        setPanel("detail");
        setDetailTab("overview");
        setAuditPage(0);
        setAuditSortKey("createdDesc");
        setAuditPageInfo({ totalPages: 0, totalElements: 0, size: 10 });
        setDetailLoading(true);
        try {
            const detail = await getStaff(staff.id);
            setSelectedStaff(detail);
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể tải chi tiết nhân sự."));
        } finally {
            setDetailLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (panel !== "detail" || detailTab !== "audit" || !selectedStaff?.id) return;

        let mounted = true;
        // Loading state belongs to the lazy audit request lifecycle.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuditLoading(true);
        getStaffAuditLogs(selectedStaff.id, {
            page: auditPage,
            size: 10,
            sort: AUDIT_SORTS[auditSortKey] || AUDIT_SORTS.createdDesc,
        })
            .then((data) => {
                if (mounted) {
                    setAuditLogs(data?.content || []);
                    setAuditPageInfo({
                        number: data?.number ?? auditPage,
                        size: data?.size ?? 10,
                        totalPages: data?.totalPages ?? 0,
                        totalElements: data?.totalElements ?? 0,
                    });
                }
            })
            .catch((error) => {
                if (mounted) toast.error(getErrorMessage(error, "Không thể tải lịch sử thay đổi."));
            })
            .finally(() => mounted && setAuditLoading(false));

        return () => {
            mounted = false;
        };
    }, [auditPage, auditSortKey, detailTab, panel, selectedStaff?.id, toast]);

    function handleAuditSortChange(nextSortKey) {
        setAuditSortKey(nextSortKey);
        setAuditPage(0);
    }

    const roleOptions = useMemo(() => (
        isOwner
            ? [
                { value: "STAFF", label: "Nhân viên" },
                { value: "FARM_MANAGER", label: "Quản lý Farm" },
            ]
            : [{ value: "STAFF", label: "Nhân viên" }]
    ), [isOwner]);

    function setSortKey(nextSortKey) {
        setSortKeyState(nextSortKey);
        setPage(0);
    }

    function openCreate() {
        setFormData({ ...EMPTY_FORM, role: roleOptions[0].value });
        setSelectedStaff(null);
        setPanel("create");
    }

    function openEdit() {
        setFormData({
            ...EMPTY_FORM,
            fullName: selectedStaff?.fullName || "",
            email: selectedStaff?.email || "",
            phone: selectedStaff?.phone || "",
        });
        setPanel("edit");
    }

    function openResetPassword() {
        setFormData({ ...EMPTY_FORM, password: "" });
        setPanel("reset-password");
    }

    function closePanel() {
        setPanel(null);
        setSelectedStaff(null);
        setAuditLogs([]);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            setSubmitting(true);
            let updated;

            if (panel === "create") {
                updated = await createStaff({
                    username: formData.username.trim(),
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim() || null,
                    phone: formData.phone.trim() || null,
                    password: formData.password,
                    role: formData.role,
                });
                toast.success("Tạo tài khoản nhân sự thành công.");
                setPage(0);
                closePanel();
                await loadStaffs();
                if (updated?.id) await loadDetail(updated);
                return;
            }

            if (panel === "edit") {
                updated = await updateStaff(selectedStaff.id, {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim() || null,
                    phone: formData.phone.trim() || null,
                });
                toast.success("Cập nhật thông tin nhân sự thành công.");
            }

            if (panel === "reset-password") {
                await resetStaffPassword(selectedStaff.id, formData.password);
                toast.success("Đã cấp lại mật khẩu và thu hồi các phiên đăng nhập cũ.");
                setPanel("detail");
                setSelectedStaff(await getStaff(selectedStaff.id));
                return;
            }

            setSelectedStaff(updated);
            setPanel("detail");
            await loadStaffs();
        } catch (error) {
            toast.error(getErrorMessage(error, "Thao tác thất bại. Vui lòng thử lại."));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleStatus() {
        if (!confirmTarget) return;
        try {
            setSubmitting(true);
            await toggleStaffStatus(confirmTarget.id, confirmTarget.status !== "ACTIVE");
            toast.success(confirmTarget.status === "ACTIVE" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
            setConfirmTarget(null);
            await loadStaffs();
            if (selectedStaff?.id === confirmTarget.id) {
                setSelectedStaff(await getStaff(confirmTarget.id));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể cập nhật trạng thái tài khoản."));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleAvatarUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !selectedStaff?.canEdit) return;

        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            toast.error("Ảnh đại diện chỉ hỗ trợ JPEG, PNG hoặc WebP.");
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            toast.error("Ảnh đại diện không được vượt quá 20MB.");
            return;
        }

        try {
            setSubmitting(true);
            const updated = await uploadStaffAvatar(selectedStaff.id, file);
            setSelectedStaff(updated);
            toast.success("Đã cập nhật ảnh đại diện.");
            await loadStaffs();
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể tải ảnh đại diện lên."));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <AdminPageSkeleton variant="table" />;

    const panelTitle = panel === "create"
        ? "Thêm nhân sự"
        : panel === "edit"
            ? "Chỉnh sửa thông tin"
            : panel === "reset-password"
                ? "Cấp lại mật khẩu"
                : selectedStaff?.fullName || "Chi tiết nhân sự";

    return (
        <section className="space-y-5 animate-fade-in">
            <OwnerPageHeader
                title="Nhân sự"
                description="Quản lý tài khoản và quyền vận hành trong nông trại."
                actions={canManageStaff ? <button type="button" onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00583d]"><Plus size={18} />Thêm nhân sự</button> : null}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Tổng nhân sự</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{totalElements}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Hoạt động trên trang</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">{staffs.filter((staff) => staff.status === "ACTIVE").length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Trang hiện tại</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{totalPages ? page + 1 : 0}<span className="text-base font-normal text-slate-400"> / {totalPages}</span></p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 p-4 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1 lg:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={keyword}
                            onChange={(event) => {
                                setKeyword(event.target.value);
                                setPage(0);
                            }}
                            placeholder="Tìm tên, username, email hoặc số điện thoại..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>
                    <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(0); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#006948]">
                        <option value="">Tất cả vai trò</option>
                        <option value="STAFF">Nhân viên</option>
                        {isOwner && <option value="FARM_MANAGER">Quản lý Farm</option>}
                    </select>
                    <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#006948]">
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Đã khóa</option>
                    </select>
                    <SortSelect value={sortKey} onChange={setSortKey} options={[
                        { value: "createdDesc", label: "Mới tạo trước" },
                        { value: "nameAsc", label: "Tên A → Z" },
                        { value: "nameDesc", label: "Tên Z → A" },
                        { value: "lastLoginDesc", label: "Đăng nhập gần đây" },
                        { value: "status", label: "Theo trạng thái" },
                    ]} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Nhân sự</th>
                                <th className="px-5 py-4 font-semibold">Liên hệ</th>
                                <th className="px-5 py-4 font-semibold">Vai trò</th>
                                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                                <th className="px-5 py-4 font-semibold">Ngày tạo</th>
                                <th className="px-5 py-4 text-right font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staffs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-16 text-center">
                                        <UserRound className="mx-auto text-slate-300" size={34} />
                                        <p className="mt-3 text-sm font-medium text-slate-600">Chưa có nhân sự phù hợp</p>
                                        <p className="mt-1 text-sm text-slate-400">Thử thay đổi bộ lọc hoặc tạo tài khoản mới.</p>
                                    </td>
                                </tr>
                            ) : staffs.map((staff) => (
                                <tr key={staff.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => loadDetail(staff)}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar staff={staff} onClick={() => staff.avatarUrl && setPreview({ src: staff.avatarUrl, alt: staff.fullName })} />
                                            <div>
                                                <p className="font-medium text-slate-800">{staff.fullName}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">@{staff.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-slate-700">{staff.email || "Chưa cập nhật"}</p>
                                        <p className="mt-1 text-xs text-slate-500">{staff.phone || "Chưa cập nhật"}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={[
                                            "inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium",
                                            staff.roleCode === "FARM_MANAGER" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600",
                                        ].join(" ")}>
                                            {getRoleLabel(staff)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4"><StatusBadge status={staff.status} /></td>
                                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(staff.createdAt)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <button type="button" onClick={(event) => { event.stopPropagation(); loadDetail(staff); }} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-[#006948]" title="Xem chi tiết">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={10}
                    loading={loading}
                    onPageChange={setPage}
                />
            </div>

            {panel && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <button type="button" aria-label="Đóng panel" className="fixed inset-0 cursor-default bg-slate-950/25 backdrop-blur-[1px]" onClick={closePanel} />
                    <aside className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-400">{panel === "create" ? "Tài khoản mới" : "Nhân sự"}</p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{panelTitle}</h2>
                                </div>
                            </div>
                            <button type="button" onClick={closePanel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng"><X size={21} /></button>
                        </div>

                        {panel === "detail" && selectedStaff && (
                            <>
                                <div className="border-b border-slate-100 px-6 pt-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="flex shrink-0 flex-col items-center gap-2">
                                            <Avatar staff={selectedStaff} size="lg" onClick={() => selectedStaff.avatarUrl && setPreview({ src: selectedStaff.avatarUrl, alt: selectedStaff.fullName })} />
                                            {selectedStaff.canEdit && (
                                                <>
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-[#006948]/30 hover:text-[#006948]" title="Tải ảnh lên"><UploadCloud size={14} />Tải ảnh</button>
                                                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarUpload} />
                                                </>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{selectedStaff.fullName}</h3>
                                                <StatusBadge status={selectedStaff.status} />
                                            </div>
                                            <p className="mt-1 text-sm text-slate-500">@{selectedStaff.username} · {getRoleLabel(selectedStaff)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-5">
                                        <button type="button" onClick={() => setDetailTab("overview")} className={["border-b-2 px-1 pb-3 text-sm font-medium", detailTab === "overview" ? "border-[#006948] text-[#006948]" : "border-transparent text-slate-400"].join(" ")}>Tổng quan</button>
                                        <button type="button" onClick={() => setDetailTab("audit")} className={["border-b-2 px-1 pb-3 text-sm font-medium", detailTab === "audit" ? "border-[#006948] text-[#006948]" : "border-transparent text-slate-400"].join(" ")}>Lịch sử thay đổi</button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    {detailLoading ? (
                                        <div className="space-y-4"><div className="h-20 animate-pulse rounded-xl bg-slate-100" /><div className="h-40 animate-pulse rounded-xl bg-slate-100" /></div>
                                    ) : detailTab === "overview" ? (
                                        <div className="space-y-7">
                                            <section>
                                                <h4 className="text-sm font-semibold text-slate-900">Thông tin tài khoản</h4>
                                                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                    <Field label="Username">@{selectedStaff.username}</Field>
                                                    <Field label="Vai trò">{getRoleLabel(selectedStaff)}</Field>
                                                    <Field label="Email"><span className="inline-flex items-center gap-2"><Mail size={15} className="text-slate-400" />{selectedStaff.email}</span></Field>
                                                    <Field label="Số điện thoại"><span className="inline-flex items-center gap-2"><span className="text-slate-400">☎</span>{selectedStaff.phone}</span></Field>
                                                </div>
                                            </section>
                                            <section className="border-t border-slate-100 pt-6">
                                                <h4 className="text-sm font-semibold text-slate-900">Thông tin hệ thống</h4>
                                                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                    <Field label="Ngày tạo"><span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-slate-400" />{formatDate(selectedStaff.createdAt)}</span></Field>
                                                    <Field label="Cập nhật gần nhất"><span className="inline-flex items-center gap-2"><Clock3 size={15} className="text-slate-400" />{formatDate(selectedStaff.updatedAt)}</span></Field>
                                                    <Field label="Lần đăng nhập cuối">{formatDate(selectedStaff.lastLoginAt)}</Field>
                                                    <Field label="Trạng thái"><StatusBadge status={selectedStaff.status} /></Field>
                                                </div>
                                            </section>
                                        </div>
                                    ) : (
                                        <section>
                                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-xs text-slate-500">{auditPageInfo.totalElements} bản ghi thay đổi</p>
                                                <SortSelect value={auditSortKey} onChange={handleAuditSortChange} options={[
                                                    { value: "createdDesc", label: "Mới nhất trước" },
                                                    { value: "createdAsc", label: "Cũ nhất trước" },
                                                    { value: "action", label: "Theo thao tác" },
                                                ]} />
                                            </div>
                                            {auditLoading ? (
                                                <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
                                            ) : auditLogs.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center"><FileClock className="mx-auto text-slate-300" size={30} /><p className="mt-3 text-sm text-slate-500">Chưa có lịch sử thay đổi.</p></div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {auditLogs.map((log) => (
                                                        <div key={log.id} className="rounded-xl border border-slate-200 p-4">
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <span className="text-sm font-semibold text-slate-800">{log.action}</span>
                                                                <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                                                            </div>
                                                            <p className="mt-2 text-sm text-slate-600">{log.details || "Đã cập nhật thông tin."}</p>
                                                            <p className="mt-2 text-xs text-slate-400">Thực hiện bởi {log.actorName || "Hệ thống"} · {log.actorRole || "SYSTEM"}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {!auditLoading && auditLogs.length > 0 && (
                                                <Pagination
                                                    page={auditPageInfo.number ?? auditPage}
                                                    totalPages={auditPageInfo.totalPages}
                                                    totalElements={auditPageInfo.totalElements}
                                                    pageSize={auditPageInfo.size}
                                                    loading={auditLoading}
                                                    onPageChange={setAuditPage}
                                                />
                                            )}
                                        </section>
                                    )}
                                </div>

                                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                                    {selectedStaff.canEdit && <button type="button" onClick={openEdit} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"><Edit3 size={16} /> Chỉnh sửa</button>}
                                    {selectedStaff.canResetPassword && <button type="button" onClick={openResetPassword} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100"><KeyRound size={16} /> Cấp lại mật khẩu</button>}
                                    {selectedStaff.canToggleStatus && <button type="button" onClick={() => setConfirmTarget(selectedStaff)} className={["inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white", selectedStaff.status === "ACTIVE" ? "bg-red-600 hover:bg-red-700" : "bg-[#006948] hover:bg-[#00583d]"].join(" ")}>{selectedStaff.status === "ACTIVE" ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}{selectedStaff.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}</button>}
                                </div>
                            </>
                        )}

                        {(panel === "create" || panel === "edit" || panel === "reset-password") && (
                            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                        {panel === "create" ? "Mật khẩu ban đầu chỉ dùng để bàn giao cho nhân sự và sẽ bắt buộc đổi ở lần đăng nhập đầu tiên." : panel === "reset-password" ? "Sau khi cấp lại, các thiết bị của tài khoản này sẽ bị đăng xuất và tài khoản phải đổi mật khẩu." : "Chỉ cập nhật thông tin hồ sơ; role và Farm assignment được quản lý qua flow riêng."}
                                    </div>

                                    {panel === "create" && (
                                        <>
                                            <label className="block">
                                                <span className="text-sm font-medium text-slate-700">Tên đăng nhập *</span>
                                                <input name="username" value={formData.username} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100" />
                                            </label>
                                            <label className="block">
                                                <span className="text-sm font-medium text-slate-700">Vai trò *</span>
                                                <select name="role" value={formData.role} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#006948]">
                                                    {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                                </select>
                                            </label>
                                        </>
                                    )}

                                    {panel !== "reset-password" && (
                                        <>
                                            <label className="block">
                                                <span className="text-sm font-medium text-slate-700">Họ và tên *</span>
                                                <input name="fullName" value={formData.fullName} onChange={handleChange} required maxLength={100} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100" />
                                            </label>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <label className="block">
                                                    <span className="text-sm font-medium text-slate-700">Email</span>
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#006948]" />
                                                </label>
                                                <label className="block">
                                                    <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
                                                    <input name="phone" value={formData.phone} onChange={handleChange} maxLength={20} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#006948]" />
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {(panel === "create" || panel === "reset-password") && (
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">{panel === "create" ? "Mật khẩu ban đầu *" : "Mật khẩu mới *"}</span>
                                            <PasswordInput name="password" value={formData.password} onChange={handleChange} required minLength={8} maxLength={72} inputClassName="mt-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100" />
                                            <span className="mt-1 block text-xs text-slate-400">Từ 8 đến 72 ký tự.</span>
                                        </label>
                                    )}
                                </div>
                                <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                                    <button type="button" onClick={() => panel === "create" ? closePanel() : setPanel("detail")} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Hủy</button>
                                    <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#006948] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Đang xử lý..." : panel === "create" ? "Tạo tài khoản" : panel === "reset-password" ? "Cấp lại mật khẩu" : "Lưu thay đổi"}</button>
                                </div>
                            </form>
                        )}
                    </aside>
                </div>
            )}

            {confirmTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <button type="button" aria-label="Đóng xác nhận" className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => !submitting && setConfirmTarget(null)} />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700"><ShieldAlert size={23} /></div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">{confirmTarget.status === "ACTIVE" ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {confirmTarget.status === "ACTIVE"
                                ? "Tài khoản @" + confirmTarget.username + " sẽ không thể đăng nhập và các session hiện tại sẽ bị thu hồi."
                                : "Tài khoản @" + confirmTarget.username + " sẽ được phép đăng nhập lại."}
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button type="button" disabled={submitting} onClick={() => setConfirmTarget(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Hủy</button>
                            <button type="button" disabled={submitting} onClick={handleToggleStatus} className={["flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60", confirmTarget.status === "ACTIVE" ? "bg-red-600 hover:bg-red-700" : "bg-[#006948] hover:bg-[#00583d]"].join(" ")}>{submitting ? "Đang xử lý..." : "Xác nhận"}</button>
                        </div>
                    </div>
                </div>
            )}

            <ImagePreviewModal open={Boolean(preview)} src={preview?.src} onClose={() => setPreview(null)} />
        </section>
    );
}
