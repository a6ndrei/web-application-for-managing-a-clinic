import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "../styles/DoctorPage.css";

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`dp-toast ${type}`}>
      <span className="dp-toast-icon">{type === "ok" ? "✅" : "🗑️"}</span>
      {msg}
    </div>
  );
}

/* ─────────────── Delete Modal ─────────────── */
function DeleteModal({ appt, onConfirm, onCancel }) {
  return (
    <div className="dp-overlay" onClick={onCancel}>
      <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dp-modal-icon">🗑️</div>
        <div className="dp-modal-title">Anulează programarea</div>
        <p className="dp-modal-sub">
          Ești pe cale să anulezi programarea pentru{" "}
          <span className="dp-modal-name">{appt.patient.name}</span> pe data de{" "}
          {fmtDate(appt.date)} la {appt.time}. Această acțiune nu poate fi
          anulată.
        </p>
        <div className="dp-modal-btns">
          <button className="dp-modal-cancel" onClick={onCancel}>
            Renunță
          </button>
          <button className="dp-modal-confirm" onClick={onConfirm}>
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPortal() {
  const [appts, setAppts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-asc");
  const [tabDay, setTabDay] = useState("upcoming"); // upcoming | today
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/appointments/doctor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped = res.data.map((a) => ({
        id: a.id,
        patient: {
          name: `${a.Pacient.User.firstName} ${a.Pacient.User.lastName}`,
          email: a.Pacient.User.email,
          initials: `${a.Pacient.User.firstName[0]}${a.Pacient.User.lastName[0]}`,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        },
        date: a.data_programare,
        time: a.ora_programare,
        duration: "30 min",
        type: a.tip_vizita,
        status:
          a.status === "Programată"
            ? "pending"
            : a.status === "Finalizată"
              ? "accepted"
              : "declined",
        room: "Cabinet 1",
        note: a.notes,
      }));
      setAppts(mapped);
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
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
    if (tabDay === "today") {
      const todayStr = new Date().toISOString().split("T")[0];
      list = list.filter((a) => a.date === todayStr);
    }
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          String(a.id).toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (sort === "date-asc")
        return (
          new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
        );
      if (sort === "date-desc")
        return (
          new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time)
        );
      if (sort === "patient")
        return a.patient.name.localeCompare(b.patient.name);
      return 0;
    });
    return list;
  }, [appts, filter, search, sort, tabDay]);

  const accept = (id) => {
    // Aici am face un apel API pt update status
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a)),
    );
    setToast({ msg: "Programare finalizată", type: "ok" });
  };

  const remove = async (appt) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/appointments/cancel/${appt.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAppts((prev) => prev.filter((a) => a.id !== appt.id));
      setModal(null);
      setToast({ msg: "Programare anulată", type: "del" });
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la anulare");
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (loading)
    return (
      <div style={{ color: "white", padding: 50, textAlign: "center" }}>
        Se încarcă programările...
      </div>
    );

  return (
    <div className="dp-shell">
      <aside className="dp-sidebar">
        <div className="dp-sidebar-top">
          <a href="/" className="dp-logo">
            <div className="dp-logo-mark">V</div>
            <span className="dp-logo-text">
              Vita<span>Med</span>
            </span>
          </a>

          <div className="dp-profile-block">
            <div className="dp-profile-avatar-wrap">
              <div className="dp-profile-avatar">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="dp-profile-status-dot" />
            </div>
            <div className="dp-profile-name">
              Dr. {user.firstName} {user.lastName}
            </div>
            <div className="dp-profile-spec">Specialist</div>
          </div>
        </div>

        <nav className="dp-nav">
          <div className="dp-nav-section">Meniu</div>
          <button className="dp-nav-item active">
            <span className="dp-nav-icon">📅</span>Programările Mele
          </button>
          <button
            className="dp-nav-item"
            onClick={() => (window.location.href = "/")}
          >
            <span className="dp-nav-icon">🏠</span>Acasă
          </button>
          <div className="dp-nav-section">Cont</div>
          <button
            className="dp-nav-item"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <span className="dp-nav-icon">🚪</span>Deconectare
          </button>
        </nav>
      </aside>

      <div className="dp-main">
        <header className="dp-topbar">
          <div>
            <div className="dp-topbar-greeting">
              Bună ziua, <em>Dr. {user.lastName}</em>
            </div>
            <div className="dp-topbar-date">
              Ai {counts.all} programări în total.
            </div>
          </div>
          <div className="dp-topbar-right">
            <div className="dp-search-wrap">
              <span className="dp-search-icon">🔍</span>
              <input
                className="dp-search"
                placeholder="Caută pacient sau tip…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="dp-tab-toggle">
              <button
                className={`dp-tab-btn ${tabDay === "today" ? "active" : ""}`}
                onClick={() => setTabDay("today")}
              >
                Azi
              </button>
              <button
                className={`dp-tab-btn ${tabDay === "upcoming" ? "active" : ""}`}
                onClick={() => setTabDay("upcoming")}
              >
                Toate
              </button>
            </div>
          </div>
        </header>

        <div className="dp-content">
          <div className="dp-stats">
            <div className="dp-stat-card c1">
              <div className="dp-stat-icon">📅</div>
              <div className="dp-stat-label">Azi</div>
              <div className="dp-stat-num">
                {
                  appts.filter(
                    (a) => a.date === new Date().toISOString().split("T")[0],
                  ).length
                }
              </div>
              <div className="dp-stat-sub">programări</div>
            </div>
            <div className="dp-stat-card c2">
              <div className="dp-stat-icon">✅</div>
              <div className="dp-stat-label">Finalizate</div>
              <div className="dp-stat-num">{counts.accepted || 0}</div>
              <div className="dp-stat-sub">confirmate</div>
            </div>
            <div className="dp-stat-card c3">
              <div className="dp-stat-icon">⏳</div>
              <div className="dp-stat-label">În așteptare</div>
              <div className="dp-stat-num">{counts.pending || 0}</div>
              <div className="dp-stat-sub">necesită acțiune</div>
            </div>
            <div className="dp-stat-card c4">
              <div className="dp-stat-icon">🗓</div>
              <div className="dp-stat-label">Total</div>
              <div className="dp-stat-num">{counts.all}</div>
              <div className="dp-stat-sub">programări totale</div>
            </div>
          </div>

          <div className="dp-body">
            <div>
              <div className="dp-list-header">
                <h2 className="dp-list-title">
                  {tabDay === "today"
                    ? "Programările de Azi"
                    : "Toate Programările"}
                </h2>
                <div className="dp-list-controls">
                  <select
                    className="dp-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="date-asc">Cele mai apropiate</option>
                    <option value="date-desc">Cele mai îndepărtate</option>
                    <option value="patient">Pacient A–Z</option>
                  </select>
                </div>
              </div>

              {grouped.length === 0 ? (
                <div className="dp-empty">
                  <div className="dp-empty-icon">📭</div>
                  <div className="dp-empty-title">Nu s-au găsit programări</div>
                  <div className="dp-empty-sub">
                    Încearcă să ajustezi filtrele sau căutarea.
                  </div>
                </div>
              ) : (
                grouped.map(([date, list]) => (
                  <div key={date}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        margin: "20px 0 10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        {fmtDate(date)}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: "var(--border)",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {list.length} programări
                      </span>
                    </div>

                    {list.map((a, i) => (
                      <div
                        key={a.id}
                        className={`dp-appt-card ${a.status}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="dp-appt-card-inner">
                          <div className="dp-appt-time-col">
                            <div className="dp-time-main">{a.time}</div>
                            <div className="dp-time-dur">{a.duration}</div>
                          </div>

                          <div className="dp-appt-body">
                            <div className="dp-appt-top">
                              <div className="dp-appt-patient">
                                <div
                                  className="dp-appt-avatar"
                                  style={{ background: a.patient.color }}
                                >
                                  {a.patient.initials}
                                </div>
                                <div>
                                  <div className="dp-appt-name">
                                    {a.patient.name}
                                  </div>
                                  <div className="dp-appt-email">
                                    {a.patient.email}
                                  </div>
                                </div>
                              </div>
                              <span className={`dp-pill ${a.status}`}>
                                <span className="dp-pill-dot" />
                                {a.status === "pending"
                                  ? "În așteptare"
                                  : a.status === "accepted"
                                    ? "Finalizată"
                                    : "Anulată"}
                              </span>
                            </div>

                            <div className="dp-appt-meta">
                              <span className="dp-appt-meta-item">
                                <span className="dp-appt-meta-icon">🏷️</span>
                                {a.type}
                              </span>
                              <span className="dp-appt-meta-item">
                                <span className="dp-appt-meta-icon">📍</span>
                                {a.room}
                              </span>
                              <span
                                className="dp-appt-meta-item"
                                style={{
                                  marginLeft: "auto",
                                  fontFamily: "var(--serif)",
                                  fontSize: 11,
                                  color: "var(--muted)",
                                }}
                              >
                                #{a.id}
                              </span>
                            </div>

                            {a.note && (
                              <div className="dp-appt-note">{a.note}</div>
                            )}

                            <div className="dp-appt-actions">
                              <button
                                className="dp-act accept"
                                disabled={a.status === "accepted"}
                                onClick={() => accept(a.id)}
                              >
                                ✓{" "}
                                {a.status === "accepted"
                                  ? "Finalizată"
                                  : "Finalizează"}
                              </button>
                              <button
                                className="dp-act delete"
                                onClick={() => setModal(a)}
                              >
                                🗑 Anulează
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <DeleteModal
          appt={modal}
          onCancel={() => setModal(null)}
          onConfirm={() => remove(modal)}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
