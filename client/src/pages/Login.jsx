import { useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const features = [
  "Vizualizați și gestionați programările viitoare",
  "Comunicați în siguranță cu echipa medicală",
];

export default function Login() {
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const validateLogin = () => {
    const e = {};
    if (!loginForm.email) e.email = "Email-ul este obligatoriu.";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email))
      e.email = "Introduceți un email valid.";
    if (!loginForm.password) e.password = "Parola este obligatorie.";
    return e;
  };

  const validateReg = () => {
    const e = {};
    if (!regForm.firstName) e.firstName = "Prenumele este obligatoriu.";
    if (!regForm.lastName) e.lastName = "Numele este obligatoriu.";
    if (!regForm.email) e.email = "Email-ul este obligatoriu.";
    else if (!/\S+@\S+\.\S+/.test(regForm.email))
      e.email = "Introduceți un email valid.";
    if (!regForm.password) e.password = "Parola este obligatorie.";
    else if (regForm.password.length < 8) e.password = "Minim 8 caractere.";
    if (regForm.confirm !== regForm.password)
      e.confirm = "Parolele nu se potrivesc.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = tab === "login" ? validateLogin() : validateReg();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await axios.post("http://localhost:5000/auth/login", {
          email: loginForm.email,
          password: loginForm.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccess(true);
        setTimeout(() => {
          if (res.data.user.rol === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        await axios.post("http://localhost:5000/auth/register", {
          firstName: regForm.firstName,
          lastName: regForm.lastName,
          email: regForm.email,
          password: regForm.password,
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTab("login");
        }, 1500);
      }
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "A apărut o eroare" });
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setSuccess(false);
  };

  const lc = (k) => (e) =>
    setLoginForm({
      ...loginForm,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const rc = (k) => (e) => setRegForm({ ...regForm, [k]: e.target.value });

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
          <p className="login-eyebrow">Portal Pacienți</p>
          <h1 className="login-headline">
            Sănătatea ta,
            <em>mereu la îndemână.</em>
          </h1>
          <p className="login-sub">
            Accesați istoricul complet de îngrijire, rezervați programări și
            rămâneți conectat cu echipa medicală — totul într-un singur loc
            sigur.
          </p>

          <div className="login-features">
            {features.map((f) => (
              <div className="login-feature" key={f}>
                <div className="login-feature-dot" />
                <span className="login-feature-text">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-left-footer">
          <span className="left-footer-badge">🔒 Conform HIPAA</span>
          <span className="left-footer-badge">Criptat SSL</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          {success ? (
            <div className="lf-success">
              <div className="lf-success-icon">✅</div>
              <h2 className="lf-success-title">
                {tab === "login" ? "Bine ai revenit!" : "Cont creat!"}
              </h2>
              <p className="lf-success-sub">
                {tab === "login"
                  ? "Ești acum autentificat în portalul pentru pacienți VitaMed."
                  : "Contul tău este gata. Te rugăm să te autentifici cu noile date."}
              </p>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2 className="login-card-title">
                  {tab === "login" ? (
                    <>
                      Autentifi<em>care</em>
                    </>
                  ) : (
                    <>
                      Creează un <em>cont</em>
                    </>
                  )}
                </h2>
                <p className="login-card-sub">
                  {tab === "login"
                    ? "Accesează portalul pentru pacienți VitaMed."
                    : "Alătură-te VitaMed și preia controlul asupra sănătății tale."}
                </p>
              </div>

              <div className="login-tabs">
                <button
                  className={`login-tab ${tab === "login" ? "active" : ""}`}
                  onClick={() => switchTab("login")}
                >
                  Autentificare
                </button>
                <button
                  className={`login-tab ${tab === "register" ? "active" : ""}`}
                  onClick={() => switchTab("register")}
                >
                  Înregistrare
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {errors.server && (
                  <div
                    className="lf-error-msg"
                    style={{ marginBottom: 15, color: "red" }}
                  >
                    {errors.server}
                  </div>
                )}
                {tab === "login" && (
                  <>
                    <div className="lf-group">
                      <label className="lf-label">Adresă de Email</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">✉</span>
                        <input
                          className={`lf-input ${errors.email ? "error" : ""}`}
                          type="email"
                          placeholder="tu@exemplu.com"
                          value={loginForm.email}
                          onChange={lc("email")}
                        />
                      </div>
                      {errors.email && (
                        <span className="lf-error-msg">{errors.email}</span>
                      )}
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Parolă</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔑</span>
                        <input
                          className={`lf-input ${errors.password ? "error" : ""}`}
                          type={showPass ? "text" : "password"}
                          placeholder="Introdu parola"
                          value={loginForm.password}
                          onChange={lc("password")}
                        />
                        <button
                          type="button"
                          className="lf-toggle"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? "🙈" : "👁"}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="lf-error-msg">{errors.password}</span>
                      )}
                    </div>

                    <div className="lf-meta">
                      <label className="lf-remember">
                        <input
                          type="checkbox"
                          className="lf-checkbox"
                          checked={loginForm.remember}
                          onChange={lc("remember")}
                        />
                        <span className="lf-remember-label">Ține-mă minte</span>
                      </label>
                      <a
                        href="/forgot-password"
                        className="lf-forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/forgot-password");
                        }}
                      >
                        Ai uitat parola?
                      </a>
                    </div>
                  </>
                )}

                {tab === "register" && (
                  <>
                    <div
                      className="lf-row"
                      style={{
                        display: "flex",
                        gap: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      <div
                        className="lf-group"
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <label className="lf-label">Prenume</label>
                        <div className="lf-input-wrap">
                          <span className="lf-icon">👤</span>
                          <input
                            className={`lf-input ${errors.firstName ? "error" : ""}`}
                            type="text"
                            placeholder="Ion"
                            value={regForm.firstName}
                            onChange={rc("firstName")}
                          />
                        </div>
                        {errors.firstName && (
                          <span className="lf-error-msg">
                            {errors.firstName}
                          </span>
                        )}
                      </div>
                      <div
                        className="lf-group"
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <label className="lf-label">Nume</label>
                        <div className="lf-input-wrap">
                          <span className="lf-icon">👤</span>
                          <input
                            className={`lf-input ${errors.lastName ? "error" : ""}`}
                            type="text"
                            placeholder="Popescu"
                            value={regForm.lastName}
                            onChange={rc("lastName")}
                          />
                        </div>
                        {errors.lastName && (
                          <span className="lf-error-msg">
                            {errors.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="lf-group">
                      <label className="lf-label">Adresă de Email</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">✉</span>
                        <input
                          className={`lf-input ${errors.email ? "error" : ""}`}
                          type="email"
                          placeholder="tu@exemplu.com"
                          value={regForm.email}
                          onChange={rc("email")}
                        />
                      </div>
                      {errors.email && (
                        <span className="lf-error-msg">{errors.email}</span>
                      )}
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Telefon</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">📞</span>
                        <input
                          className="lf-input"
                          type="tel"
                          placeholder="+40 700 000 000"
                          value={regForm.phone}
                          onChange={rc("phone")}
                        />
                      </div>
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Parolă</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔑</span>
                        <input
                          className={`lf-input ${errors.password ? "error" : ""}`}
                          type={showPass ? "text" : "password"}
                          placeholder="Min. 8 caractere"
                          value={regForm.password}
                          onChange={rc("password")}
                        />
                        <button
                          type="button"
                          className="lf-toggle"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? "🙈" : "👁"}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="lf-error-msg">{errors.password}</span>
                      )}
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Confirmă Parola</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔒</span>
                        <input
                          className={`lf-input ${errors.confirm ? "error" : ""}`}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repetă parola"
                          value={regForm.confirm}
                          onChange={rc("confirm")}
                        />
                        <button
                          type="button"
                          className="lf-toggle"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? "🙈" : "👁"}
                        </button>
                      </div>
                      {errors.confirm && (
                        <span className="lf-error-msg">{errors.confirm}</span>
                      )}
                    </div>
                  </>
                )}

                <button type="submit" className="lf-submit" disabled={loading}>
                  {loading ? (
                    <span className="lf-submit-loading">
                      <span className="lf-spinner" />{" "}
                      {tab === "login" ? "Autentificare…" : "Creare cont…"}
                    </span>
                  ) : tab === "login" ? (
                    "Autentifică-te în aplicație"
                  ) : (
                    "Creează-mi Contul"
                  )}
                </button>
              </form>

              <div className="login-card-footer">
                {tab === "login" ? (
                  <>
                    Nu ai un cont?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        switchTab("register");
                      }}
                    >
                      Înregistrează-te aici
                    </a>
                  </>
                ) : (
                  <>
                    Ești deja înregistrat?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        switchTab("login");
                      }}
                    >
                      Autentificare
                    </a>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
