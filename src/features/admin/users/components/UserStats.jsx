function StatCard({ label, value, description, valueClassName = "" }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {label}
            </p>

            <div className="mt-2 flex items-end gap-2">
                <strong className={`text-3xl font-semibold leading-none ${valueClassName}`}>
                    {value}
                </strong>

                <span className="pb-0.5 text-xs text-slate-600">
                    {description}
                </span>
            </div>
        </article>
    );
}

export function UserStats({ summary }) {
    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="Tổng Người dùng"
                value={summary.totalUsers}
                description="Trong hệ thống"
            />

            <StatCard
                label="Chủ nông trại (Owner)"
                value={summary.totalOwners}
                description="Tài khoản quản lý"
                valueClassName="text-[#006948]"
            />

            <StatCard
                label="Nhân viên (Staff)"
                value={summary.totalStaffs}
                description="Nhân sự vận hành"
                valueClassName="text-blue-600"
            />

            <StatCard
                label="Quản trị viên (Admin)"
                value={summary.totalAdmins}
                description="Người điều hành"
                valueClassName="text-purple-600"
            />
        </section>
    );
}
