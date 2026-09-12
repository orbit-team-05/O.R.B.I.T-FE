import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const HELP_SECTIONS = [
    {
        match: "/admin/dashboard",
        title: "Dashboard vận hành",
        summary: "Theo dõi nhanh sức khỏe User, Farm, thiết bị cân và giao dịch trong hệ thống.",
        steps: [
            "Kiểm tra ba nhóm tổng quan: User, Farm và thiết bị IoT.",
            "Theo dõi biểu đồ trạng thái và xu hướng giao dịch để nhận biết biến động.",
            "Mở mục Cảnh báo hệ thống hoặc chuông thông báo để xử lý các việc đang chờ.",
        ],
        actionLabel: "Mở Dashboard",
        actionPath: "/admin/dashboard",
    },
    {
        match: "/admin/users",
        title: "Quản lý người dùng",
        summary: "Quản lý tài khoản, vai trò, trạng thái và thông tin hồ sơ của người dùng.",
        steps: [
            "Dùng bộ lọc để tìm người dùng theo vai trò hoặc trạng thái.",
            "Mở Chi tiết để xem avatar, thông tin liên hệ, Farm và lịch sử thay đổi.",
            "Các thao tác khóa, mở khóa hoặc thay đổi quyền cần được kiểm tra trước khi xác nhận.",
        ],
        actionLabel: "Mở Quản lý người dùng",
        actionPath: "/admin/users",
    },
    {
        match: "/admin/farms",
        title: "Quản lý nông trại",
        summary: "Theo dõi danh sách Farm, Owner phụ trách và trạng thái hoạt động.",
        steps: [
            "Mở Chi tiết để xem ảnh đại diện, thông tin Farm và Owner liên quan.",
            "Kiểm tra trạng thái trước khi thực hiện thao tác quản trị.",
            "Các thay đổi quan trọng cần được ghi nhận trong audit log ở backend.",
        ],
        actionLabel: "Mở Quản lý nông trại",
        actionPath: "/admin/farms",
    },
    {
        match: "/admin/devices",
        title: "Quản trị thiết bị cân",
        summary: "Khởi tạo thiết bị từ địa chỉ MAC và theo dõi thiết bị chưa gắn Farm.",
        steps: [
            "Tab Thiết bị chưa tạo chứa các địa chỉ MAC đang chờ khởi tạo.",
            "Mở một ô thiết bị để tạo cân, cập nhật ảnh và thông tin thiết bị.",
            "Theo dõi trạng thái hoạt động và Farm được gắn trong phần chi tiết.",
        ],
        actionLabel: "Mở Quản trị thiết bị",
        actionPath: "/admin/devices",
    },
    {
        match: "/admin/reports",
        title: "Báo cáo quản trị",
        summary: "Lọc dữ liệu giao dịch và xuất báo cáo PDF phục vụ kiểm tra vận hành.",
        steps: [
            "Chọn khoảng thời gian và các bộ lọc cần thiết trước khi tra cứu.",
            "Kiểm tra số liệu tổng hợp và danh sách giao dịch trong kết quả.",
            "Dùng nút Xuất PDF để tải báo cáo theo đúng bộ lọc hiện tại.",
        ],
        actionLabel: "Mở Báo cáo",
        actionPath: "/admin/reports",
    },
    {
        match: "/admin/settings",
        title: "Cài đặt tài khoản",
        summary: "Cập nhật thông tin cá nhân, avatar và bảo mật tài khoản Admin.",
        steps: [
            "Bấm vào ảnh đại diện để xem ảnh lớn; dùng thao tác cập nhật ảnh ở khu vực hồ sơ.",
            "Khi đổi mật khẩu, các thiết bị khác sẽ bị đăng xuất theo chính sách bảo mật.",
            "IoT là phần cài đặt mở rộng sẽ được bổ sung ở giai đoạn sau.",
        ],
        actionLabel: "Mở Cài đặt",
        actionPath: "/admin/settings",
    },
];

function getHelpSection(pathname) {
    return HELP_SECTIONS.find(({ match }) => pathname.startsWith(match)) ?? HELP_SECTIONS[0];
}

export function AdminHelpModal({ open, pathname, onClose }) {
    const dialogRef = useRef(null);
    const section = getHelpSection(pathname);

    useEffect(() => {
        if (!open) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        dialogRef.current?.focus();

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[90] flex items-start justify-end bg-slate-900/30 p-4 pt-[82px] backdrop-blur-[2px]"
            onClick={onClose}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-help-title"
                tabIndex={-1}
                className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#006948]">
                            Hướng dẫn Admin
                        </p>
                        <h2 id="admin-help-title" className="mt-1 text-lg font-semibold text-slate-900">
                            {section.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng hướng dẫn"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="space-y-5 px-5 py-5">
                    <p className="text-sm leading-6 text-slate-600">{section.summary}</p>

                    <ol className="space-y-3">
                        {section.steps.map((step, index) => (
                            <li key={step} className="flex gap-3 text-sm leading-5 text-slate-700">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-[#006948]">
                                    {index + 1}
                                </span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>

                    <Link
                        to={section.actionPath}
                        onClick={onClose}
                        className="inline-flex h-10 items-center rounded-lg bg-[#006948] px-4 text-sm font-medium text-white transition hover:bg-[#00583d]"
                    >
                        {section.actionLabel}
                    </Link>
                </div>
            </section>
        </div>
    );
}
