import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transfer', label: 'Transfer' },
  { to: '/cards', label: 'Cards' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/bill-pay', label: 'Bill pay' },
];

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span> Northstar
        </div>
        <nav>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-right">
          <NotificationBell />
          <span className="muted">{user?.name}</span>
          <button className="link" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
