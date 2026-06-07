import { useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Parola este obligatorie.");
      return;
    }
    if (password.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }
    if (password !== confirm) {
      setError("Parolele nu se potrivesc.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(`http://localhost:5000/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "A apărut o eroare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <a href="/" className="login-left-logo">
          <div className="login-logo-mark">V</div>
          <span className="login-logo-text">
            Vita<span>Med</span>
          </span>
        </a>
        <div className="login-left-body">
          <p className="login-eyebrow">Securitate Cont</p>
          <h1 className="login-headline">
            Setează o
            <em>parolă nouă.</em>
          </h1>
          <p className="login-sub">
            Alege o parolă puternică pentru a-ți proteja datele medicale și accesul în portal.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          {success ? (
            <div className="lf-success">
              <div className="lf-success-icon">🎉</div>
              <h2 className="lf-success-title">Succes!</h2>
              <p className="lf-success-sub">
                Parola ta a fost actualizată. Te redirecționăm către pagina de autentificare...
              </p>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2 className="login-card-title">
                  Noua <em>parolă</em>
                </h2>
                <p className="login-card-sub">
                  Introdu și confirmă noua ta parolă.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="lf-error-msg" style={{ marginBottom: 15 }}>{error}</div>
                )}
                
                <div className="lf-group">
                  <label className="lf-label">Noua Parolă</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">🔑</span>
                    <input
                      className={`lf-input ${error ? "error" : ""}`}
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 caractere"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="lf-toggle"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="lf-group">
                  <label className="lf-label">Confirmă Parola</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">🔒</span>
                    <input
                      className={`lf-input ${error ? "error" : ""}`}
                      type={showPass ? "text" : "password"}
                      placeholder="Repetă parola"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="lf-submit" disabled={loading}>
                  {loading ? (
                    <span className="lf-submit-loading">
                      <span className="lf-spinner" /> Se actualizează...
                    </span>
                  ) : (
                    "Actualizează Parola"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
