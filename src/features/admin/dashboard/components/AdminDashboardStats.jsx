import { LandPlot, Scale, Users } from "lucide-react";

function StatCard({ label, value, description, icon: Icon, iconClassName, valueClassName }) {
    return (
        <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {label}
                    </p>
                    <strong className={`mt-3 block text-4xl font-semibold leading-none ${valueClassName}`}>
                        {value}
                    </strong>
                    <p className="mt-3 text-sm text-slate-500">{description}</p>
                </div>

                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                    <Icon size={21} strokeWidth={1.8} />
                </span>
            </div>
        </article>
    );
}

export function AdminDashboardStats({ overview, iotOverview }) {
    const users = overview || {};
    const farms = overview || {};
    const devices = iotOverview || {};

    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
                label="Người dùng"
                value={users.totalUsers ?? 0}
                description={`${users.activeUsers ?? 0} đang hoạt động · ${users.inactiveUsers ?? 0} ngừng hoạt động`}
                icon={Users}
                iconClassName="bg-emerald-50 text-[#006948]"
                valueClassName="text-[#006948]"
            />
            <StatCard
                label="Nông trại"
                value={farms.totalFarms ?? 0}
                description={`${farms.activeFarms ?? 0} đang hoạt động · ${farms.inactiveFarms ?? 0} ngừng hoạt động`}
                icon={LandPlot}
                iconClassName="bg-blue-50 text-blue-700"
                valueClassName="text-blue-700"
            />
            <StatCard
                label="Thiết bị cân"
                value={devices.totalDevices ?? 0}
                description={`${devices.activeDevices ?? 0} đang hoạt động · ${(devices.uncreatedDevices ?? 0) + (devices.unassignedDevices ?? 0)} chờ xử lý`}
                icon={Scale}
                iconClassName="bg-amber-50 text-amber-700"
                valueClassName="text-amber-700"
            />
        </section>
    );
}
