import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signOut, getCurrentAdminProfile } from "../services/auth";
import "./auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      const profile = await getCurrentAdminProfile();

      if (!profile?.is_admin) {
        await signOut();
        setError("Acesso restrito a administradores.");
        return;
      }

      navigate("/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual" aria-hidden="true">
        <div className="auth-brand">
          <span className="auth-brand-mark">✦</span>
          <strong>Minha Saúde</strong>
          <small>Feminina</small>
        </div>
        <div className="auth-message">
          <span className="auth-eyebrow">CONTEÚDO QUE ACOLHE</span>
          <h2>
            Informação de saúde,
            <br />
            <em>com cuidado.</em>
          </h2>
          <p>
            Um espaço seguro para criar, revisar e compartilhar conteúdos que
            fazem a diferença.
          </p>
        </div>
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
      </section>

      <section className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-mobile-brand">
            <span>✦</span> Minha Saúde <small>FEMININA</small>
          </div>
          <span className="auth-kicker">PAINEL EDITORIAL</span>
          <h1>Bem-vinda de volta</h1>
          <p className="auth-subtitle">
            Entre com suas credenciais para acessar o painel.
          </p>
          <label>
            E-mail
            <span className="input-wrap">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
              </svg>
              <input
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>
          <label>
            Senha
            <span className="input-wrap">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </span>
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner spinner-light" /> Entrando…
              </>
            ) : (
              <>
                Entrar no painel <span>→</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
