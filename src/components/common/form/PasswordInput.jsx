import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput({ inputClassName = "", ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={visible ? "text" : "password"}
                className={`w-full pr-11 ${inputClassName}`}
            />
            <button
                type="button"
                aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                title={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setVisible((current) => !current)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006948]/30"
            >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
        </div>
    );
}
