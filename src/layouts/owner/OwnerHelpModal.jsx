import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

const HELP_SECTIONS = [
    { match: "/owner/dashboard", title: "Tổng quan vận hành", summary: "Theo dõi nhanh mùa vụ, tồn kho, giao dịch và thiết bị cân của Farm.", steps: ["Chọn khoảng thời gian để xem xu hướng giao dịch phù hợp.", "Kiểm tra các chỉ số tồn kho thực tế, dự kiến và giao dịch chờ duyệt.", "Mở báo cáo khi cần đối soát chi tiết theo khoảng thời gian."], actionLabel: "Mở Dashboard", actionPath: "/owner/dashboard" },
    { match: "/owner/farms", title: "Hồ sơ nông trại", summary: "Cập nhật thông tin, địa chỉ và ảnh đại diện của Farm hiện tại.", steps: ["Kiểm tra trạng thái Farm trước khi chỉnh sửa.", "Dùng bản đồ để chọn hoặc xác nhận vị trí.", "Các thay đổi được ghi nhận cùng người chỉnh sửa và thời gian."], actionLabel: "Mở Hồ sơ nông trại", actionPath: "/owner/farms" },
    { match: "/owner/staff", title: "Nhân sự", summary: "Quản lý Staff và Farm Manager trong phạm vi Farm được gán.", steps: ["Dùng bộ lọc để tìm nhân sự theo vai trò hoặc trạng thái.", "Mở chi tiết để xem avatar, thông tin và lịch sử thay đổi.", "Thao tác khóa/mở khóa hoặc cập nhật tài khoản cần xác nhận."], actionLabel: "Mở Nhân sự", actionPath: "/owner/staff" },
    { match: "/owner/products", title: "Sản phẩm", summary: "Quản lý danh mục vật tư và sản phẩm nuôi của Farm.", steps: ["Tạo sản phẩm trước khi tạo giao dịch kho.", "Phân biệt sản phẩm vật tư với sản phẩm thu hoạch.", "Ảnh sản phẩm có thể xem lớn bằng cách bấm vào ảnh."], actionLabel: "Mở Sản phẩm", actionPath: "/owner/products" },
    { match: "/owner/seasons", title: "Mùa vụ", summary: "Theo dõi kế hoạch, chi phí, sản lượng mục tiêu và lợi nhuận mùa vụ.", steps: ["Sản lượng và giá bán dự kiến có thể để trống hoặc cập nhật sau.", "Chi phí phát sinh cần có bằng chứng khi nghiệp vụ yêu cầu.", "Chỉ chuyển trạng thái mùa vụ theo đúng vòng đời vận hành."], actionLabel: "Mở Mùa vụ", actionPath: "/owner/seasons" },
    { match: "/owner/inventory", title: "Kho vận hành", summary: "Quản lý riêng kho vật tư và kho sản phẩm thu hoạch.", steps: ["Tồn thực tế chỉ thay đổi sau giao dịch đã được duyệt.", "Tồn dự kiến bao gồm giao dịch đang chờ duyệt.", "Kiểm tra giao dịch chờ duyệt trước khi đối soát tồn kho."], actionLabel: "Mở Kho vận hành", actionPath: "/owner/inventory" },
    { match: "/owner/devices", title: "Thiết bị cân", summary: "Kích hoạt và theo dõi các thiết bị cân được gắn vào Farm.", steps: ["Nhập activation code để gắn thiết bị vào Farm.", "Latest weight chỉ là dữ liệu cân mới nhất, không tự làm thay đổi tồn kho.", "Owner có thể cập nhật tên và ảnh thiết bị; API key chỉ hiển thị một lần."], actionLabel: "Mở Thiết bị cân", actionPath: "/owner/devices" },
    { match: "/owner/reports", title: "Báo cáo", summary: "Lọc giao dịch của Farm và xuất báo cáo PDF để đối soát.", steps: ["Chọn khoảng thời gian và trạng thái cần tra cứu.", "Kiểm tra tổng hợp trước khi xuất file.", "Báo cáo PDF dùng đúng bộ lọc hiện tại."], actionLabel: "Mở Báo cáo", actionPath: "/owner/reports" },
    { match: "/owner/settings", title: "Cài đặt tài khoản", summary: "Cập nhật thông tin cá nhân, ảnh đại diện và mật khẩu.", steps: ["Ảnh đại diện tối đa 20MB và có thể bấm để xem ảnh lớn.", "Đổi mật khẩu sẽ đăng xuất các thiết bị khác.", "Không chia sẻ mật khẩu hoặc thông tin phiên đăng nhập."], actionLabel: "Mở Cài đặt", actionPath: "/owner/settings" },
];

function getHelpSection(pathname) {
    return HELP_SECTIONS.find(({ match }) => pathname.startsWith(match)) || HELP_SECTIONS[0];
}

export function OwnerHelpModal({ open, pathname, onClose }) {
    const { user } = useAuth();
    const dialogRef = useRef(null);
    const section = getHelpSection(pathname);
    const isFarmManager = user?.role === "FARM_MANAGER" || user?.roles?.includes("FARM_MANAGER");

    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKeyDown);
        dialogRef.current?.focus();
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return <div className="fixed inset-0 z-[90] flex items-start justify-end bg-slate-900/30 p-4 pt-[82px] backdrop-blur-[2px]" onClick={onClose}>
        <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="owner-help-title" tabIndex={-1} className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#006948]">Hướng dẫn {isFarmManager ? "Farm Manager" : "Owner"}</p><h2 id="owner-help-title" className="mt-1 text-lg font-semibold text-slate-900">{section.title}</h2></div><button type="button" onClick={onClose} aria-label="Đóng hướng dẫn" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"><X size={18} /></button></header>
            <div className="space-y-5 px-5 py-5"><p className="text-sm leading-6 text-slate-600">{section.summary}</p><ol className="space-y-3">{section.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-5 text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-[#006948]">{index + 1}</span><span>{step}</span></li>)}</ol><Link to={section.actionPath} onClick={onClose} className="inline-flex h-10 items-center rounded-lg bg-[#006948] px-4 text-sm font-medium text-white transition hover:bg-[#00583d]">{section.actionLabel}</Link></div>
        </section>
    </div>;
}
