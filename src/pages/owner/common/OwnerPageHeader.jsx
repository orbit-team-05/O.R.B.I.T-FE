export function OwnerPageHeader({
    title,
    description,
    actions = null,
    className = "",
}) {
    return (
        <header className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`}>
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
    );
}
