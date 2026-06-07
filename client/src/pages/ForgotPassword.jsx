import { useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email-ul este obligatoriu.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/auth/forgot-password", { email });
      setSuccess(true);
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
          <p className="login-eyebrow">Recuperare Cont</p>
          <h1 className="login-headline">
            Ai uitat
            <em>parola?</em>
          </h1>
          <p className="login-sub">
            Nu vă faceți griji. Introduceți adresa de email și vă vom trimite un link pentru a vă reseta parola.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          {success ? (
            <div className="lf-success">
              <div className="lf-success-icon">✉️</div>
              <h2 className="lf-success-title">Email trimis!</h2>
              <p className="lf-success-sub">
                Dacă adresa de email există în sistemul nostru, vei primi un link de resetare în câteva minute.
              </p>
              <button className="lf-submit" style={{ marginTop: 30 }} onClick={() => navigate("/login")}>
                Înapoi la Login
              </button>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2 className="login-card-title">
                  Resetare <em>parolă</em>
                </h2>
                <p className="login-card-sub">
                  Introdu email-ul tău pentru a primi instrucțiunile.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="lf-error-msg" style={{ marginBottom: 15 }}>{error}</div>
                )}
                <div className="lf-group">
                  <label className="lf-label">Adresa de Email</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">✉</span>
                    <input
                      className={`lf-input ${error ? "error" : ""}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="lf-submit" disabled={loading}>
                  {loading ? (
                    <span className="lf-submit-loading">
                      <span className="lf-spinner" /> Se trimite...
                    </span>
                  ) : (
                    "Trimite Link Resetare"
                  )}
                </button>
              </form>

              <div className="login-card-footer">
                V-ați amintit parola?{" "}
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                  Înapoi la Sign In
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
