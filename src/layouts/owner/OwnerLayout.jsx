import { NavLink, Outlet } from "react-router-dom";

export function OwnerLayout() {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2>ORBIT</h2>

                <nav>
                    <NavLink to="/owner/dashboard">
                        Dashboard
                    </NavLink>

                    <NavLink to="/owner/products">
                        Sản phẩm và kho
                    </NavLink>
                </nav>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}