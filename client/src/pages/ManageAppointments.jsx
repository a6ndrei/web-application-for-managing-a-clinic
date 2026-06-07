import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "../styles/ManageAppointments.css";

const FILTERS = ["all", "Programată", "Finalizată", "Anulată"];
const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", badge: null },
  { icon: "📋", label: "Appointments", badge: null, active: true },
  { icon: "👥", label: "Patients", badge: null },
  { icon: "👨‍⚕️", label: "Doctors", badge: null },
  { icon: "🧪", label: "Lab Results", badge: null },
  { icon: "📊", label: "Reports", badge: null },
  { icon: "⚙️", label: "Settings", badge: null },
];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  const icons = { success: "✅", danger: "🗑️", warn: "❌" };
  return (
    <div className={`ma-toast ${type}`}>
      <span className="ma-toast-icon">{icons[type]}</span>
      {msg}
    </div>
  );
}

function Modal({ action, appt, onConfirm, onCancel }) {
  const configs = {
    delete: {
      icon: "🗑️",
      title: "Anulează programarea",
      sub: `Ești pe cale să anulezi programarea pentru`,
      btnLabel: "Anulează",
      btnClass: "danger",
    },
    decline: {
      icon: "❌",
      title: "Refuză programarea",
      sub: `Ești pe cale să refuzi programarea pentru`,
      btnLabel: "Refuză",
      btnClass: "warn",
    },
  };
  const c = configs[action];
  return (
    <div className="ma-overlay" onClick={onCancel}>
      <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ma-modal-icon">{c.icon}</div>
        <div className="ma-modal-title">{c.title}</div>
        <p className="ma-modal-sub">
          {c.sub} <span className="ma-modal-patient">{appt.patient.name}</span>{" "}
          pe data de {fmtDate(appt.date)} la {appt.time}. Această acțiune nu poate fi anulată.
        </p>
        <div className="ma-modal-btns">
          <button className="ma-modal-cancel" onClick={onCancel}>
            Renunță
          </button>
          <button
            className={`ma-modal-confirm ${c.btnClass}`}
            onClick={onConfirm}
          >
            {c.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageAppointments() {
  const [appts, setAppts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-asc");
  const [view, setView] = useState("cards");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/appointments/all", {
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
        doctor: {
          name: `Dr. ${a.Medic.User.firstName} ${a.Medic.User.lastName}`,
          spec: a.specializare,
        },
        date: a.data_programare,
        time: a.ora_programare,
        type: a.tip_vizita,
        status: a.status,
        note: a.notes,
      }));
      setAppts(mapped);
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
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(q) ||
          a.doctor.name.toLowerCase().includes(q) ||
          a.doctor.spec.toLowerCase().includes(q) ||
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
      if (sort === "doctor") return a.doctor.name.localeCompare(b.doctor.name);
      return 0;
    });
    return list;
  }, [appts, filter, search, sort]);

  const setStatus = (id, status) => {
    // În mod normal am face un apel API aici
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const labels = {
      Programată: "Programare restabilită",
      Finalizată: "Programare finalizată",
      Anulată: "Programare anulată",
    };
    setToast({ msg: labels[status], type: "success" });
  };

  const doDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/appointments/cancel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppts((prev) => prev.filter((a) => a.id !== id));
      setModal(null);
      setToast({ msg: "Programare ștearsă", type: "danger" });
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la ștergere");
    }
  };

  const openModal = (action, appt) => setModal({ action, appt });
  const closeModal = () => setModal(null);

  const ActionButtons = ({ appt, compact = false }) => (
    <>
      {appt.status !== "Finalizată" && (
        <button
          className={compact ? "ma-row-act accept" : "ma-act-btn ma-act-accept"}
          onClick={() => setStatus(appt.id, "Finalizată")}
          title="Finalizează"
        >
          ✓ {!compact && "Finalizează"}
        </button>
      )}
      <button
        className={compact ? "ma-row-act del" : "ma-act-btn ma-act-delete"}
        onClick={() => openModal("delete", appt)}
        title="Șterge"
      >
        🗑 {!compact && "Șterge"}
      </button>
    </>
  );

  if (loading) return <div style={{ color: "white", padding: 50, textAlign: "center" }}>Se încarcă programările...</div>;

  return (
    <div className="ma-shell">
      <aside className="ma-sidebar">
        <a href="/" className="ma-sidebar-logo">
          <div className="ma-logo-mark">V</div>
          <span className="ma-logo-text">
            Vita<span>Med</span>
          </span>
        </a>
        <nav className="ma-nav">
          <div className="ma-nav-label">Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`ma-nav-item ${item.active ? "active" : ""}`}
            >
              <span className="ma-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="ma-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="ma-nav-label">Account</div>
          <button className="ma-nav-item" onClick={() => { localStorage.removeItem("token"); window.location.href="/login"; }}>
            <span className="ma-nav-icon">🚪</span>Sign Out
          </button>
        </nav>
      </aside>

      <div className="ma-main">
        <header className="ma-topbar">
          <div className="ma-topbar-left">
            <span className="ma-topbar-title">Gestionează Programările</span>
            <span className="ma-topbar-sub">
              Revizuiește, acceptă sau anulează programările pacienților
            </span>
          </div>
          <div className="ma-topbar-right">
            <div className="ma-search-wrap">
              <span className="ma-search-icon">🔍</span>
              <input
                className="ma-search"
                placeholder="Caută pacient, doctor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ma-view-toggle">
              <button
                className={`ma-view-btn ${view === "cards" ? "active" : ""}`}
                onClick={() => setView("cards")}
                title="Card view"
              >
                ⊞
              </button>
              <button
                className={`ma-view-btn ${view === "table" ? "active" : ""}`}
                onClick={() => setView("table")}
                title="Table view"
              >
                ☰
              </button>
            </div>
          </div>
        </header>

        <div className="ma-content">
          <div className="ma-summary">
            <div className="ma-sum-card c-pending">
              <div className="ma-sum-icon">⏳</div>
              <div className="ma-sum-label">Programate</div>
              <div className="ma-sum-num">{counts.Programată || 0}</div>
              <div className="ma-sum-sub">În așteptare</div>
            </div>
            <div className="ma-sum-card c-accepted">
              <div className="ma-sum-icon">✅</div>
              <div className="ma-sum-label">Finalizate</div>
              <div className="ma-sum-num">{counts.Finalizată || 0}</div>
              <div className="ma-sum-sub">Vizite încheiate</div>
            </div>
            <div className="ma-sum-card c-declined">
              <div className="ma-sum-icon">❌</div>
              <div className="ma-sum-label">Anulate</div>
              <div className="ma-sum-num">{counts.Anulată || 0}</div>
              <div className="ma-sum-sub">Programări anulate</div>
            </div>
            <div className="ma-sum-card c-total">
              <div className="ma-sum-icon">📋</div>
              <div className="ma-sum-label">Total</div>
              <div className="ma-sum-num">{counts.all}</div>
              <div className="ma-sum-sub">Toate programările</div>
            </div>
          </div>

          <div className="ma-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`ma-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                <span className="ma-filter-count">{counts[f] || 0}</span>
              </button>
            ))}
            <div className="ma-filters-right">
              <select
                className="ma-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="date-asc">Data: cele mai apropiate</option>
                <option value="date-desc">Data: cele mai îndepărtate</option>
                <option value="patient">Pacient A–Z</option>
                <option value="doctor">Doctor A–Z</option>
              </select>
            </div>
          </div>

          {view === "cards" &&
            (filtered.length === 0 ? (
              <div className="ma-empty">
                <div className="ma-empty-icon">📭</div>
                <div className="ma-empty-title">Nu s-au găsit programări</div>
                <div className="ma-empty-sub">
                  Încearcă să ajustezi căutarea sau filtrele.
                </div>
              </div>
            ) : (
              <div className="ma-cards">
                {filtered.map((a, i) => (
                  <div
                    className="ma-card"
                    key={a.id}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="ma-card-top">
                      <div className="ma-card-patient">
                        <div
                          className="ma-card-avatar"
                          style={{ background: a.patient.color }}
                        >
                          {a.patient.initials}
                        </div>
                        <div>
                          <div className="ma-card-name">{a.patient.name}</div>
                          <div className="ma-card-email">{a.patient.email}</div>
                        </div>
                      </div>
                      <span className={`ma-badge ${a.status === "Programată" ? "pending" : a.status === "Finalizată" ? "accepted" : "declined"}`}>
                        <span className="ma-badge-dot" />
                        {a.status}
                      </span>
                    </div>

                    <div className="ma-card-body">
                      <div className="ma-card-row">
                        <span className="ma-card-row-icon">👨‍⚕️</span>
                        <span>{a.doctor.name}</span>
                        <span style={{ color: "var(--muted)", fontSize: 11 }}>
                          · {a.doctor.spec}
                        </span>
                      </div>
                      <div className="ma-card-row">
                        <span className="ma-card-row-icon">📅</span>
                        <span className="ma-card-row-val">
                          {fmtDate(a.date)}
                        </span>
                        <span style={{ color: "var(--muted)" }}>
                          la {a.time}
                        </span>
                      </div>
                      <div className="ma-card-row">
                        <span className="ma-card-row-icon">🏷️</span>
                        <span>{a.type}</span>
                        <span
                          style={{
                            color: "var(--muted)",
                            fontSize: 11,
                            marginLeft: "auto",
                          }}
                        >
                          #{a.id}
                        </span>
                      </div>
                      {a.note && (
                        <>
                          <div className="ma-card-divider" />
                          <div className="ma-card-note">{a.note}</div>
                        </>
                      )}
                    </div>

                    <div className="ma-card-actions">
                      <ActionButtons appt={a} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {view === "table" && (
            <div className="ma-table-wrap">
              <div className="ma-table-head">
                <div className="ma-th">Pacient</div>
                <div className="ma-th">Doctor</div>
                <div className="ma-th">Data & Ora</div>
                <div className="ma-th">Tip</div>
                <div className="ma-th">Status</div>
                <div className="ma-th" style={{ textAlign: "right" }}>
                  Acțiuni
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="ma-empty">
                  <div className="ma-empty-icon">📭</div>
                  <div className="ma-empty-title">Nu s-au găsit programări</div>
                  <div className="ma-empty-sub">
                    Încearcă să ajustezi căutarea sau filtrele.
                  </div>
                </div>
              ) : (
                filtered.map((a, i) => (
                  <div
                    className="ma-row"
                    key={a.id}
                    style={{ animationDelay: `${i * 0.035}s` }}
                  >
                    <div className="ma-cell">
                      <div className="ma-patient-cell">
                        <div
                          className="ma-pat-avatar"
                          style={{ background: a.patient.color }}
                        >
                          {a.patient.initials}
                        </div>
                        <div>
                          <div className="ma-pat-name">{a.patient.name}</div>
                          <div className="ma-pat-email">{a.patient.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="ma-cell">
                      <div className="ma-doc-name">{a.doctor.name}</div>
                      <div className="ma-doc-spec">{a.doctor.spec}</div>
                    </div>
                    <div className="ma-cell">
                      <div className="ma-date-main">{fmtDate(a.date)}</div>
                      <div className="ma-date-time">{a.time}</div>
                    </div>
                    <div className="ma-cell">
                      <span className="ma-type-pill">{a.type}</span>
                    </div>
                    <div className="ma-cell">
                      <span className={`ma-badge ${a.status === "Programată" ? "pending" : a.status === "Finalizată" ? "accepted" : "declined"}`}>
                        <span className="ma-badge-dot" />
                        {a.status}
                      </span>
                    </div>
                    <div className="ma-cell" style={{ textAlign: "right" }}>
                      <div className="ma-row-actions">
                        <ActionButtons appt={a} compact />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          action={modal.action}
          appt={modal.appt}
          onCancel={closeModal}
          onConfirm={() => {
            if (modal.action === "delete") doDelete(modal.appt.id);
          }}
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
