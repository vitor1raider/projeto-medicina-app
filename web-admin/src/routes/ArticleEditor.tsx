import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RichTextEditor from '../components/RichTextEditor'
import {
  Article,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  uploadMedia,
} from '../services/articles'
import './ArticleEditor.css'

export default function ArticleEditor() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return

    getArticle(id!).then((data) => {
      if (!data) return
      setArticle(data)
      setTitle(data.title)
      setContent(data.content)
      setCoverImageUrl(data.cover_image_url)
      setLoading(false)
    })
  }, [id, isNew])

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const url = await uploadMedia(file)
    setCoverImageUrl(url)
  }

  async function handleSave(publish?: boolean) {
    setSaving(true)
    try {
      if (isNew) {
        const created = await createArticle({ title, content, cover_image_url: coverImageUrl })
        if (publish) {
          await updateArticle(created.id, { published: true })
        }
      } else {
        const patch: Record<string, unknown> = { title, content, cover_image_url: coverImageUrl }
        if (publish !== undefined) patch.published = publish
        await updateArticle(id!, patch)
      }
      navigate('/articles')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!article) return
    if (!confirm(`Excluir o artigo "${article.title}"? Essa ação não pode ser desfeita.`)) return
    await deleteArticle(article.id)
    navigate('/articles')
  }

  if (loading) return <p style={{ padding: 24 }}>Carregando…</p>

  return (
    <div className="editor-page">
      <header className="editor-header">
        <button className="btn-link" onClick={() => navigate('/articles')}>
          ← Voltar
        </button>
        <div className="editor-header-actions">
          {!isNew && (
            <button className="btn-link btn-danger" onClick={handleDelete}>
              Excluir
            </button>
          )}
          <button className="btn-secondary" disabled={saving} onClick={() => handleSave()}>
            Salvar rascunho
          </button>
          <button className="btn-primary" disabled={saving} onClick={() => handleSave(true)}>
            {article?.published ? 'Salvar' : 'Publicar'}
          </button>
        </div>
      </header>

      <div className="editor-body">
        <input
          className="title-input"
          placeholder="Título do artigo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="cover-label">
          Imagem de capa
          <input type="file" accept="image/*" onChange={handleCoverChange} />
        </label>

        {coverImageUrl && <img className="cover-preview" src={coverImageUrl} alt="Capa" />}

        <RichTextEditor value={content} onChange={setContent} />
      </div>
    </div>
  )
}
