import { useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const features = [
  "View and manage your upcoming appointments",
  "Access your medical records and test results",
  "Message your care team securely",
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
    if (!loginForm.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email))
      e.email = "Enter a valid email.";
    if (!loginForm.password) e.password = "Password is required.";
    return e;
  };

  const validateReg = () => {
    const e = {};
    if (!regForm.firstName) e.firstName = "First name is required.";
    if (!regForm.lastName) e.lastName = "Last name is required.";
    if (!regForm.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(regForm.email))
      e.email = "Enter a valid email.";
    if (!regForm.password) e.password = "Password is required.";
    else if (regForm.password.length < 8) e.password = "Minimum 8 characters.";
    if (regForm.confirm !== regForm.password)
      e.confirm = "Passwords do not match.";
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
      setErrors({ server: err.response?.data?.message || "An error occurred" });
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
          <p className="login-eyebrow">Patient Portal</p>
          <h1 className="login-headline">
            Your health,
            <em>always at hand.</em>
          </h1>
          <p className="login-sub">
            Access your complete care history, book appointments, and stay
            connected with your medical team — all in one secure place.
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
          <span className="left-footer-badge">🔒 HIPAA Compliant</span>
          <span className="left-footer-badge">SSL Encrypted</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          {success ? (
            <div className="lf-success">
              <div className="lf-success-icon">✅</div>
              <h2 className="lf-success-title">
                {tab === "login" ? "Welcome back!" : "Account created!"}
              </h2>
              <p className="lf-success-sub">
                {tab === "login"
                  ? "You're now signed in to your VitaMed patient portal."
                  : "Your account is ready. Please sign in with your new credentials."}
              </p>
            </div>
          ) : (
            <>
              <div className="login-card-header">
                <h2 className="login-card-title">
                  {tab === "login" ? (
                    <>
                      Sign <em>in</em>
                    </>
                  ) : (
                    <>
                      Create an <em>account</em>
                    </>
                  )}
                </h2>
                <p className="login-card-sub">
                  {tab === "login"
                    ? "Access your VitaMed patient portal."
                    : "Join VitaMed and take control of your health."}
                </p>
              </div>

              <div className="login-tabs">
                <button
                  className={`login-tab ${tab === "login" ? "active" : ""}`}
                  onClick={() => switchTab("login")}
                >
                  Sign In
                </button>
                <button
                  className={`login-tab ${tab === "register" ? "active" : ""}`}
                  onClick={() => switchTab("register")}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {errors.server && (
                  <div className="lf-error-msg" style={{ marginBottom: 15, color: "red" }}>{errors.server}</div>
                )}
                {tab === "login" && (
                  <>
                    <div className="lf-group">
                      <label className="lf-label">Email Address</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">✉</span>
                        <input
                          className={`lf-input ${errors.email ? "error" : ""}`}
                          type="email"
                          placeholder="you@example.com"
                          value={loginForm.email}
                          onChange={lc("email")}
                        />
                      </div>
                      {errors.email && (
                        <span className="lf-error-msg">{errors.email}</span>
                      )}
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Password</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔑</span>
                        <input
                          className={`lf-input ${errors.password ? "error" : ""}`}
                          type={showPass ? "text" : "password"}
                          placeholder="Enter your password"
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
                        <span className="lf-remember-label">Remember me</span>
                      </label>
                      <a href="/forgot-password" className="lf-forgot" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}>
                        Forgot password?
                      </a>
                    </div>
                  </>
                )}

                {tab === "register" && (
                  <>
                    <div className="lf-row" style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                      <div className="lf-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="lf-label">First Name</label>
                        <div className="lf-input-wrap">
                          <span className="lf-icon">👤</span>
                          <input
                            className={`lf-input ${errors.firstName ? "error" : ""}`}
                            type="text"
                            placeholder="John"
                            value={regForm.firstName}
                            onChange={rc("firstName")}
                          />
                        </div>
                        {errors.firstName && (
                          <span className="lf-error-msg">{errors.firstName}</span>
                        )}
                      </div>
                      <div className="lf-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="lf-label">Last Name</label>
                        <div className="lf-input-wrap">
                          <span className="lf-icon">👤</span>
                          <input
                            className={`lf-input ${errors.lastName ? "error" : ""}`}
                            type="text"
                            placeholder="Doe"
                            value={regForm.lastName}
                            onChange={rc("lastName")}
                          />
                        </div>
                        {errors.lastName && (
                          <span className="lf-error-msg">{errors.lastName}</span>
                        )}
                      </div>
                    </div>
                    <div className="lf-group">
                      <label className="lf-label">Email Address</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">✉</span>
                        <input
                          className={`lf-input ${errors.email ? "error" : ""}`}
                          type="email"
                          placeholder="you@example.com"
                          value={regForm.email}
                          onChange={rc("email")}
                        />
                      </div>
                      {errors.email && (
                        <span className="lf-error-msg">{errors.email}</span>
                      )}
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Phone (optional)</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">📞</span>
                        <input
                          className="lf-input"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={regForm.phone}
                          onChange={rc("phone")}
                        />
                      </div>
                    </div>

                    <div className="lf-group">
                      <label className="lf-label">Password</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔑</span>
                        <input
                          className={`lf-input ${errors.password ? "error" : ""}`}
                          type={showPass ? "text" : "password"}
                          placeholder="Min. 8 characters"
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
                      <label className="lf-label">Confirm Password</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔒</span>
                        <input
                          className={`lf-input ${errors.confirm ? "error" : ""}`}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat password"
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
                      {tab === "login" ? "Signing in…" : "Creating account…"}
                    </span>
                  ) : tab === "login" ? (
                    "Sign In to Portal"
                  ) : (
                    "Create My Account"
                  )}
                </button>
              </form>

              {tab === "login" && (
                <>
                  <div className="lf-divider">
                    <span>or continue with</span>
                  </div>
                  <div className="lf-socials">
                    <button className="lf-social-btn">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </button>
                    <button className="lf-social-btn">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#1877F2"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </>
              )}

              <div className="login-card-footer">
                {tab === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        switchTab("register");
                      }}
                    >
                      Register here
                    </a>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        switchTab("login");
                      }}
                    >
                      Sign in
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
