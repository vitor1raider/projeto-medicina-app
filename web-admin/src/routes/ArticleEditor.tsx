import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import AdminShell from "../components/AdminShell";
import {
  Article,
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  uploadMedia,
} from "../services/articles";
import "./ArticleEditor.css";

export default function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;

    getArticle(id!)
      .then((data) => {
        if (!data) return;
        setArticle(data);
        setTitle(data.title);
        setContent(data.content);
        setCoverImageUrl(data.cover_image_url);
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadMedia(file);
      setCoverImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(publish?: boolean) {
    setSaving(true);
    try {
      if (isNew) {
        const created = await createArticle({
          title,
          content,
          cover_image_url: coverImageUrl,
        });
        if (publish) {
          await updateArticle(created.id, { published: true });
        }
      } else {
        const patch: Record<string, unknown> = {
          title,
          content,
          cover_image_url: coverImageUrl,
        };
        if (publish !== undefined) patch.published = publish;
        await updateArticle(id!, patch);
      }
      navigate("/articles");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!article) return;
    if (
      !confirm(
        `Excluir o artigo "${article.title}"? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    await deleteArticle(article.id);
    navigate("/articles");
  }

  if (loading)
    return (
      <div className="loading-screen">
        <span className="loading-indicator">
          <span className="spinner" />
          Carregando artigo...
        </span>
      </div>
    );

  return (
    <AdminShell>
      <div className="editor-page">
        <header className="editor-header">
          <div className="editor-heading">
            <button
              className="back-button"
              onClick={() => navigate("/articles")}
              aria-label="Voltar"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <span className="page-eyebrow">
                {isNew ? "NOVO CONTEÚDO" : "EDITAR CONTEÚDO"}
              </span>
              <h1>{isNew ? "Criar artigo" : "Editar artigo"}</h1>
            </div>
          </div>
          <div className="editor-header-actions">
            {!isNew && (
              <button className="btn-danger-soft" onClick={handleDelete}>
                Excluir
              </button>
            )}
            <button
              className="btn-secondary"
              disabled={saving}
              onClick={() => handleSave()}
            >
              Salvar rascunho
            </button>
            <button
              className="btn-primary"
              disabled={saving || !title.trim()}
              onClick={() => handleSave(true)}
            >
              {saving
                ? "Salvando..."
                : article?.published
                  ? "Salvar alterações"
                  : "Publicar artigo"}
            </button>
          </div>
        </header>

        <div className="editor-grid">
          <section className="editor-card editor-content-card">
            <div className="field-group">
              <label htmlFor="article-title">Título do artigo</label>
              <input
                id="article-title"
                className="title-input"
                placeholder="Digite um título claro e acolhedor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <small>{title.length}/120 caracteres</small>
            </div>
            <div className="field-group">
              <label>Conteúdo</label>
              <p className="field-help">
                Use a barra de ferramentas para organizar e enriquecer o texto.
              </p>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </section>

          <aside className="editor-sidebar">
            <section className="editor-card side-card">
              <div className="side-card-header">
                <div>
                  <h2>Status</h2>
                  <p>Visibilidade do conteúdo</p>
                </div>
                <span
                  className={`badge ${article?.published ? "badge-published" : "badge-draft"}`}
                >
                  <i />
                  {article?.published ? "Publicado" : "Rascunho"}
                </span>
              </div>
              <div className="status-note">
                <span>i</span>
                <p>
                  {article?.published
                    ? "Este artigo está visível para os leitores."
                    : "O artigo ficará privado até ser publicado."}
                </p>
              </div>
            </section>
            <section className="editor-card side-card">
              <div className="side-card-header">
                <div>
                  <h2>Imagem de capa</h2>
                  <p>Recomendado: 1200 × 630 px</p>
                </div>
              </div>
              {coverImageUrl ? (
                <div className="cover-preview-wrap">
                  <img
                    className="cover-preview"
                    src={coverImageUrl}
                    alt="Prévia da capa"
                  />
                  <div className="cover-overlay">
                    <label>
                      Trocar imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                    </label>
                    <button onClick={() => setCoverImageUrl(null)}>
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cover-uploader">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    disabled={uploading}
                  />
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 16.5V19h16v-2.5M12 4v11M7.5 8.5 12 4l4.5 4.5" />
                  </svg>
                  <strong>
                    {uploading ? "Enviando imagem..." : "Enviar imagem"}
                  </strong>
                  <small>PNG, JPG ou WEBP</small>
                </label>
              )}
            </section>
            <section className="editor-tip">
              <span>✦</span>
              <p>
                <strong>Dica editorial</strong>Use títulos objetivos e
                parágrafos curtos para facilitar a leitura no celular.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
