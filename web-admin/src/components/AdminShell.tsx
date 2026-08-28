import { Link, useLocation } from "react-router-dom";

type AdminShellProps = { children: React.ReactNode; onSignOut?: () => void };

export default function AdminShell({ children, onSignOut }: AdminShellProps) {
  const isArticles = useLocation().pathname.startsWith("/articles");
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link
          className="brand"
          to="/articles"
          aria-label="Minha Saúde Feminina — início"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3v18M3 12h18" />
              <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
          </span>
          <span>
            <strong>Minha Saúde</strong>
            <small>Feminina</small>
          </span>
        </Link>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="sidebar-label">CONTEÚDO</span>
          <Link
            className={`nav-item${isArticles ? " active" : ""}`}
            to="/articles"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
              <path d="M4 5.5v16M8 7h8M8 11h6" />
            </svg>
            Artigos
          </Link>
        </nav>
        {onSignOut && (
          <div className="sidebar-footer">
            <div className="admin-profile">
              <span className="admin-avatar">AD</span>
              <span>
                <strong>Administrador</strong>
                <small>Painel editorial</small>
              </span>
            </div>
            <button
              className="icon-button"
              onClick={onSignOut}
              aria-label="Sair"
              title="Sair"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        )}
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
