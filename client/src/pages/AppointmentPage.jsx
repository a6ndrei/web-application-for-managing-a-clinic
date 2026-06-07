import { useState, useMemo, useEffect } from "react";
import "../styles/AppointmentPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const FILTERS = [
  { key: "all", label: "Toate", dot: null },
  { key: "Programată", label: "Programate", dot: "#C6A86B" },
  { key: "Finalizată", label: "Finalizate", dot: "#27AE60" },
  { key: "Anulată", label: "Anulate", dot: "#C0392B" },
];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtDay = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("ro-RO", { day: "numeric" });

const fmtMonth = (d) =>
  new Date(d + "T00:00:00")
    .toLocaleDateString("ro-RO", { month: "short" })
    .toUpperCase();

const specialtyIcon = (s) =>
  ({
    Cardiologie: "🫀",
    Neurologie: "🧠",
    Oftalmologie: "👁️",
    Dermatologie: "🌿",
  })[s] || "🏥";

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="pt-toast">🗑️ &nbsp;{msg}</div>;
}

function DeleteModal({ appt, onConfirm, onCancel }) {
  return (
    <div className="pt-modal-overlay" onClick={onCancel}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal-top">
          <div className="pt-modal-icon-wrap">🗑️</div>
          <div className="pt-modal-title">Anulezi programarea?</div>
        </div>
        <p className="pt-modal-sub">
          Această acțiune va elimina definitiv programarea. Poți oricând să faci
          o programare nouă din portal.
        </p>
        <div className="pt-modal-appt-card">
          <div className="pt-modal-appt-icon">
            {specialtyIcon(appt.specializare)}
          </div>
          <div>
            <div className="pt-modal-appt-type">{appt.specializare}</div>
            <div className="pt-modal-appt-meta">
              Dr. {appt.Medic.User.firstName} {appt.Medic.User.lastName} ·{" "}
              {fmtDate(appt.data_programare)} la {appt.ora_programare}
            </div>
          </div>
        </div>
        <div className="pt-modal-btns">
          <button className="pt-modal-cancel" onClick={onCancel}>
            Păstrează
          </button>
          <button className="pt-modal-confirm" onClick={onConfirm}>
            Da, anulează
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentPage() {
  const [appts, setAppts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date-asc");
  const [view, setView] = useState("cards");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/appointments/my-appointments",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Fetched appts:", res.data);
      setAppts(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const c = { all: appts.length };
    appts.forEach((a) => {
      c[a.status] = (c[a.status] || 0) + 1;
    });
    return c;
  }, [appts]);

  const filtered = useMemo(() => {
    let list = [...appts];
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    list.sort((a, b) => {
      const da = new Date(a.data_programare + " " + a.ora_programare);
      const db = new Date(b.data_programare + " " + b.ora_programare);
      if (sort === "date-asc") return da - db;
      if (sort === "date-desc") return db - da;
      return 0;
    });
    return list;
  }, [appts, filter, sort]);

  const nextAppt = useMemo(
    () =>
      [...appts]
        .filter((a) => a.status === "Programată")
        .sort(
          (a, b) => new Date(a.data_programare) - new Date(b.data_programare),
        )[0],
    [appts],
  );

  const doDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/appointments/cancel/${modal.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setToast({ msg: `Programarea la ${modal.specializare} a fost anulată.` });
      setAppts((prev) => prev.filter((a) => a.id !== modal.id));
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la anularea programării.");
    }
  };

  if (loading)
    return (
      <div style={{ color: "white", padding: 50, textAlign: "center" }}>
        Se încarcă programările...
      </div>
    );

  return (
    <>
      <nav className="pt-nav">
        <a href="/" className="pt-nav-logo">
          <div className="pt-logo-mark">V</div>
          <span className="pt-nav-logo-text">
            Vita<span>Med</span>
          </span>
        </a>
        <ul className="pt-nav-links">
          <li>
            <a href="/">Acasă</a>
          </li>
          <li>
            <a href="#" className="active">
              Programări
            </a>
          </li>
          <li>
            <a href="#">Rezultate Analize</a>
          </li>
          <li>
            <a href="#">Mesaje</a>
          </li>
          <li>
            <a href="#">Profil</a>
          </li>
        </ul>
        <div
          className="pt-nav-user"
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer" }}
        >
          <div className="pt-nav-avatar">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <span className="pt-nav-name">{user.firstName}</span>
        </div>
      </nav>

      <div className="pt-hero">
        <div className="pt-hero-glow" />
        <div className="pt-hero-grain" />
        <div className="pt-hero-inner">
          <div className="pt-hero-left">
            <p className="pt-hero-tag">Portal Pacient</p>
            <h1 className="pt-hero-title">
              Programările mele,
              <em> {user.firstName}.</em>
            </h1>
            <p className="pt-hero-sub">
              Istoricul complet al vizitelor tale medicale. Gestionează
              programările viitoare și urmărește starea sănătății tale.
            </p>
          </div>
          <div className="pt-hero-pills">
            <div
              className={`pt-hero-pill ${counts.Programată ? "highlight" : ""}`}
            >
              <div className="pt-pill-num">{counts.Programată || 0}</div>
              <div className="pt-pill-lbl">Viitoare</div>
            </div>
            <div className="pt-hero-pill">
              <div className="pt-pill-num">{counts.Finalizată || 0}</div>
              <div className="pt-pill-lbl">Finalizate</div>
            </div>
            <div className="pt-hero-pill">
              <div className="pt-pill-num">{counts.all}</div>
              <div className="pt-pill-lbl">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-body">
        {nextAppt && (
          <div className="pt-next-banner">
            <div className="pt-next-icon">
              {specialtyIcon(nextAppt.specializare)}
            </div>
            <div className="pt-next-body">
              <div className="pt-next-label">Următoarea ta programare</div>
              <div className="pt-next-title">{nextAppt.specializare}</div>
              <div className="pt-next-meta">
                Dr. {nextAppt.Medic.User.firstName}{" "}
                {nextAppt.Medic.User.lastName} &nbsp;·&nbsp;{" "}
                {fmtDate(nextAppt.data_programare)} la {nextAppt.ora_programare}
              </div>
            </div>
            <button
              className="pt-next-cta"
              onClick={() => navigate("/bookAppointment")}
            >
              Programează alta
            </button>
          </div>
        )}

        <div className="pt-controls">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`pt-filter ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.dot && (
                <span
                  className="pt-filter-dot"
                  style={{
                    background:
                      filter === f.key ? "rgba(255,255,255,.5)" : f.dot,
                  }}
                />
              )}
              {f.label}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 5px",
                  borderRadius: 100,
                  background:
                    filter === f.key ? "rgba(255,255,255,.15)" : "var(--cream)",
                  color: filter === f.key ? "var(--white)" : "var(--navy)",
                }}
              >
                {counts[f.key] || 0}
              </span>
            </button>
          ))}

          <div className="pt-controls-right">
            <select
              className="pt-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date-asc">Cele mai recente</option>
              <option value="date-desc">Cele mai vechi</option>
            </select>
            <div className="pt-view-toggle">
              <button
                className={`pt-view-btn ${view === "cards" ? "active" : ""}`}
                title="Card view"
                onClick={() => setView("cards")}
              >
                ⊞
              </button>
              <button
                className={`pt-view-btn ${view === "list" ? "active" : ""}`}
                title="List view"
                onClick={() => setView("list")}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="pt-empty">
            <div className="pt-empty-ring">📭</div>
            <div className="pt-empty-title">Nu ai programări aici</div>
            <p className="pt-empty-sub">
              {filter === "all"
                ? "Nu ai nicio programare înregistrată încă. Începe prin a face prima programare."
                : `Nu ai nicio programare cu statusul "${filter}".`}
            </p>
            <button
              className="pt-empty-btn"
              onClick={() => navigate("/bookAppointment")}
            >
              + Programează o Consultație
            </button>
          </div>
        )}

        {view === "cards" && filtered.length > 0 && (
          <div className="pt-cards">
            {filtered.map((a, i) => (
              <div
                key={a.id}
                className="pt-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={`pt-card-stripe ${a.status === "Programată" ? "upcoming" : a.status === "Finalizată" ? "completed" : "cancelled"}`}
                />
                <div className="pt-card-body">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div className="pt-card-date-badge">
                      <div className="pt-date-day">
                        {fmtDay(a.data_programare)}
                      </div>
                      <div className="pt-date-month">
                        {fmtMonth(a.data_programare)}
                      </div>
                    </div>
                    <span
                      className={`pt-badge ${a.status === "Programată" ? "upcoming" : a.status === "Finalizată" ? "completed" : "cancelled"}`}
                    >
                      <span className="pt-badge-dot" />
                      {a.status}
                    </span>
                  </div>

                  <div className="pt-card-header">
                    <div>
                      <div className="pt-card-title">{a.specializare}</div>
                      <div className="pt-card-spec">{a.tip_vizita}</div>
                    </div>
                  </div>

                  <div className="pt-card-details">
                    <div className="pt-card-detail">
                      <span className="pt-card-detail-icon">👨‍⚕️</span>
                      <span className="pt-card-detail-val">
                        Dr. {a.Medic.User.firstName} {a.Medic.User.lastName}
                      </span>
                    </div>
                    <div className="pt-card-detail">
                      <span className="pt-card-detail-icon">🕐</span>
                      <span className="pt-card-detail-val">
                        {a.ora_programare}
                      </span>
                    </div>
                    <div className="pt-card-detail">
                      <span className="pt-card-detail-icon">📍</span>
                      <span className="pt-card-detail-val">
                        Clinica VitaMed
                      </span>
                    </div>
                  </div>

                  {a.notes && <div className="pt-card-note">{a.notes}</div>}

                  <div className="pt-card-footer">
                    <span className="pt-card-ref">#{a.id}</span>
                    <div className="pt-card-actions">
                      {a.status === "Programată" && (
                        <button
                          className="pt-card-act delete"
                          onClick={() => setModal(a)}
                        >
                          🗑 Anulează
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "list" && filtered.length > 0 && (
          <div className="pt-list-wrap">
            <div className="pt-list-head">
              <div className="pt-lh">Programare</div>
              <div className="pt-lh">Medic</div>
              <div className="pt-lh">Data</div>
              <div className="pt-lh">Ora</div>
              <div className="pt-lh">Status</div>
              <div className="pt-lh" style={{ textAlign: "right" }}>
                Acțiuni
              </div>
            </div>

            {filtered.map((a, i) => (
              <div
                key={a.id}
                className="pt-list-row"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="pt-lc">
                  <div className="pt-lc-type">
                    {specialtyIcon(a.specializare)} {a.specializare}
                  </div>
                  <div className="pt-lc-spec">
                    {a.tip_vizita} &nbsp;·&nbsp; #{a.id}
                  </div>
                </div>
                <div className="pt-lc">
                  <div className="pt-lc-doc">
                    Dr. {a.Medic.User.firstName} {a.Medic.User.lastName}
                  </div>
                  <div className="pt-lc-spec2">VitaMed</div>
                </div>
                <div className="pt-lc">
                  <div className="pt-lc-date">{fmtDate(a.data_programare)}</div>
                </div>
                <div className="pt-lc">
                  <div className="pt-lc-time">{a.ora_programare}</div>
                </div>
                <div className="pt-lc">
                  <span
                    className={`pt-badge ${a.status === "Programată" ? "upcoming" : a.status === "Finalizată" ? "completed" : "cancelled"}`}
                  >
                    <span className="pt-badge-dot" />
                    {a.status}
                  </span>
                </div>
                <div className="pt-lc" style={{ textAlign: "right" }}>
                  <div className="pt-list-acts">
                    {a.status === "Programată" && (
                      <button
                        className="pt-la del"
                        title="Anulează"
                        onClick={() => setModal(a)}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button
              className="pt-empty-btn"
              style={{ display: "inline-flex" }}
              onClick={() => navigate("/bookAppointment")}
            >
              + Programează o Consultație Nouă
            </button>
          </div>
        )}
      </div>

      {modal && (
        <DeleteModal
          appt={modal}
          onCancel={() => setModal(null)}
          onConfirm={doDelete}
        />
      )}

      {toast && <Toast msg={toast.msg} onDone={() => setToast(null)} />}
    </>
  );
}
