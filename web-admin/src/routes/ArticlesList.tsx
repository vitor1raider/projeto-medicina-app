import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Article, listArticles, updateArticle, deleteArticle } from '../services/articles'
import { signOut } from '../services/auth'
import './ArticlesList.css'

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      setArticles(await listArticles())
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePublished(article: Article) {
    await updateArticle(article.id, { published: !article.published })
    load()
  }

  async function handleDelete(article: Article) {
    if (!confirm(`Excluir o artigo "${article.title}"? Essa ação não pode ser desfeita.`)) return
    await deleteArticle(article.id)
    load()
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>Artigos</h1>
        <div className="list-header-actions">
          <Link className="btn-primary" to="/articles/new">
            + Novo artigo
          </Link>
          <button className="btn-link" onClick={handleSignOut}>
            Sair
          </button>
        </div>
      </header>

      {loading && <p>Carregando…</p>}

      {!loading && articles.length === 0 && <p className="empty">Nenhum artigo ainda.</p>}

      <div className="article-table">
        {articles.map((article) => (
          <div key={article.id} className="article-row">
            <div className="article-row-info">
              <span className="article-title">{article.title || '(sem título)'}</span>
              <span className={`badge ${article.published ? 'badge-published' : 'badge-draft'}`}>
                {article.published ? 'Publicado' : 'Rascunho'}
              </span>
              <span className="article-date">
                Atualizado em {new Date(article.updated_at).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="article-row-actions">
              <button className="btn-link" onClick={() => handleTogglePublished(article)}>
                {article.published ? 'Esconder' : 'Publicar'}
              </button>
              <Link className="btn-link" to={`/articles/${article.id}`}>
                Editar
              </Link>
              <button className="btn-link btn-danger" onClick={() => handleDelete(article)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
