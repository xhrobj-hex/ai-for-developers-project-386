import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Публичная запись", end: true },
  { to: "/admin", label: "Админ-раздел", end: false },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <p className="app-header__eyebrow">Этап 4 · frontend MVP plan</p>
            <h1 className="app-header__title">Календарь звонков</h1>
          </div>
          <nav className="app-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn("ui-button ui-button--ghost app-nav__link", isActive && "is-active")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
