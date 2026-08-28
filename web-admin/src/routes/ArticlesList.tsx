import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Article,
  listArticles,
  updateArticle,
  deleteArticle,
} from "../services/articles";
import { signOut } from "../services/auth";
import AdminShell from "../components/AdminShell";
import "./ArticlesList.css";

type Filter = "all" | "published" | "draft";

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      setArticles(await listArticles());
    } finally {
      setLoading(false);
    }
  }
  async function handleTogglePublished(article: Article) {
    await updateArticle(article.id, { published: !article.published });
    load();
  }
  async function handleDelete(article: Article) {
    if (
      !confirm(
        `Excluir o artigo "${article.title}"? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    await deleteArticle(article.id);
    load();
  }
  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const visibleArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesQuery = article.title
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR"));
        const matchesFilter =
          filter === "all" ||
          (filter === "published" ? article.published : !article.published);
        return matchesQuery && matchesFilter;
      }),
    [articles, query, filter],
  );
  const published = articles.filter((article) => article.published).length;
  const draft = articles.length - published;

  return (
    <AdminShell onSignOut={handleSignOut}>
      <div className="list-page">
        <header className="page-header">
          <div>
            <span className="page-eyebrow">BIBLIOTECA EDITORIAL</span>
            <h1>Artigos</h1>
            <p>Gerencie os conteúdos publicados no aplicativo.</p>
          </div>
          <Link className="btn-primary" to="/articles/new">
            <svg className="button-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo artigo
          </Link>
        </header>
        <section className="stats-grid" aria-label="Resumo dos artigos">
          <div className="stat-card">
            <span className="stat-icon stat-icon-all">▤</span>
            <div>
              <strong>{articles.length}</strong>
              <small>Total de artigos</small>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-published">✓</span>
            <div>
              <strong>{published}</strong>
              <small>Publicados</small>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon stat-icon-draft">✎</span>
            <div>
              <strong>{draft}</strong>
              <small>Rascunhos</small>
            </div>
          </div>
        </section>
        <section className="content-panel">
          <div className="content-toolbar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título..."
                aria-label="Buscar artigos"
              />
            </div>
            <div className="filter-tabs" aria-label="Filtrar artigos">
              {(
                [
                  ["all", "Todos"],
                  ["published", "Publicados"],
                  ["draft", "Rascunhos"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="list-state">
              <span className="spinner" /> Carregando artigos...
            </div>
          ) : visibleArticles.length === 0 ? (
            <div className="empty-state">
              <span>✦</span>
              <h2>
                {query
                  ? "Nenhum resultado encontrado"
                  : "Sua biblioteca está vazia"}
              </h2>
              <p>
                {query
                  ? "Tente buscar por outro título."
                  : "Crie o primeiro artigo para começar a compartilhar conteúdo."}
              </p>
              {!query && (
                <Link className="btn-primary" to="/articles/new">
                  Criar artigo
                </Link>
              )}
            </div>
          ) : (
            <div className="article-table">
              <div className="table-head">
                <span>ARTIGO</span>
                <span>STATUS</span>
                <span>ÚLTIMA ATUALIZAÇÃO</span>
                <span>AÇÕES</span>
              </div>
              {visibleArticles.map((article) => (
                <article key={article.id} className="article-row">
                  <Link
                    className="article-identity"
                    to={`/articles/${article.id}`}
                  >
                    <span className="article-thumb">
                      {article.cover_image_url ? (
                        <img src={article.cover_image_url} alt="" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M4 5h16v14H4zM4 15l5-5 4 4 2-2 5 5M15.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <strong>{article.title || "(sem título)"}</strong>
                      <small>
                        {article.content
                          .replace(/<[^>]*>/g, " ")
                          .trim()
                          .slice(0, 70) || "Sem conteúdo adicionado"}
                      </small>
                    </span>
                  </Link>
                  <span>
                    <span
                      className={`badge ${article.published ? "badge-published" : "badge-draft"}`}
                    >
                      <i />
                      {article.published ? "Publicado" : "Rascunho"}
                    </span>
                  </span>
                  <time dateTime={article.updated_at}>
                    {new Date(article.updated_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    <small>
                      {new Date(article.updated_at).toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </small>
                  </time>
                  <div className="article-row-actions">
                    <button onClick={() => handleTogglePublished(article)}>
                      {article.published ? "Ocultar" : "Publicar"}
                    </button>
                    <Link to={`/articles/${article.id}`}>Editar</Link>
                    <button
                      className="danger"
                      onClick={() => handleDelete(article)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
