import StoreSwitcher from "../common/StoreSwitcher";

export default function Topbar({ title }) {
  return (
    <header className="topbar">
      <div className="topbar__title">{title}</div>
      <div className="topbar__right">
        <StoreSwitcher />
        <div className="topbar__notif">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 015 5c0 3 1.5 4 1.5 4H2.5S4 10 4 7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7.5 14a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="topbar__notif-dot" />
        </div>
      </div>
    </header>
  );
}
