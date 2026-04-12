import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Запись", end: true },
  { to: "/admin", label: "Владелец", end: false },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <p className="app-header__eyebrow">Демо сервиса бронирования</p>
            <h1 className="app-header__title">Календарь звонков</h1>
            <p className="app-header__lead">
              Гость выбирает тип встречи и свободное время, владелец создаёт события и видит предстоящие бронирования.
            </p>
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
