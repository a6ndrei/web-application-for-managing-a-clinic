import { useState, useMemo, useEffect } from "react";
import "../styles/ManageAppointments.css";

const INITIAL = [
  {
    id: "A-3301",
    patient: {
      name: "Margaret Liu",
      email: "m.liu@email.com",
      initials: "ML",
      color: "#D9C49A",
    },
    doctor: { name: "Dr. Elena Marchetti", spec: "Cardiology" },
    date: "2026-05-18",
    time: "10:00 AM",
    type: "Consultation",
    status: "pending",
    note: "Intermittent chest tightness. EKG review requested.",
  },
  {
    id: "A-3302",
    patient: {
      name: "Thomas Bauer",
      email: "t.bauer@email.com",
      initials: "TB",
      color: "#A8C4D9",
    },
    doctor: { name: "Dr. James Okafor", spec: "Neurology" },
    date: "2026-05-18",
    time: "11:30 AM",
    type: "Follow-up",
    status: "pending",
    note: "Post-MRI follow-up. Discuss findings from April scan.",
  },
  {
    id: "A-3303",
    patient: {
      name: "Isabelle Fontaine",
      email: "i.fontaine@email.com",
      initials: "IF",
      color: "#D4A8C7",
    },
    doctor: { name: "Dr. Sophia Reyes", spec: "Orthopedics" },
    date: "2026-05-19",
    time: "2:00 PM",
    type: "Consultation",
    status: "accepted",
    note: "Knee replacement pre-op assessment.",
  },
  {
    id: "A-3304",
    patient: {
      name: "David Osei",
      email: "d.osei@email.com",
      initials: "DO",
      color: "#A8D4B8",
    },
    doctor: { name: "Dr. Alan Voss", spec: "Internal Medicine" },
    date: "2026-05-19",
    time: "9:00 AM",
    type: "Annual Check-up",
    status: "accepted",
    note: "Routine annual exam. Blood panel ordered.",
  },
  {
    id: "A-3305",
    patient: {
      name: "Priya Nair",
      email: "p.nair@email.com",
      initials: "PN",
      color: "#F0C8A0",
    },
    doctor: { name: "Dr. Elena Marchetti", spec: "Cardiology" },
    date: "2026-05-20",
    time: "3:30 PM",
    type: "Consultation",
    status: "declined",
    note: "Rescheduling requested for week of May 25.",
  },
  {
    id: "A-3306",
    patient: {
      name: "Carlos Mendez",
      email: "c.mendez@email.com",
      initials: "CM",
      color: "#C8B4E8",
    },
    doctor: { name: "Dr. James Okafor", spec: "Neurology" },
    date: "2026-05-20",
    time: "10:30 AM",
    type: "Follow-up",
    status: "pending",
    note: "Awaiting insurance pre-authorisation confirmation.",
  },
  {
    id: "A-3307",
    patient: {
      name: "Saoirse Kelly",
      email: "s.kelly@email.com",
      initials: "SK",
      color: "#F0D4A8",
    },
    doctor: { name: "Dr. Sophia Reyes", spec: "Orthopedics" },
    date: "2026-05-21",
    time: "1:00 PM",
    type: "Consultation",
    status: "pending",
    note: "New patient referral. Lower back pain, possible L4-L5 disc.",
  },
  {
    id: "A-3308",
    patient: {
      name: "Wei Zhang",
      email: "w.zhang@email.com",
      initials: "WZ",
      color: "#A8D4D0",
    },
    doctor: { name: "Dr. Alan Voss", spec: "Internal Medicine" },
    date: "2026-05-22",
    time: "8:00 AM",
    type: "Lab Review",
    status: "accepted",
    note: "Review Q2 blood panel and thyroid results.",
  },
  {
    id: "A-3309",
    patient: {
      name: "Nadia Petrov",
      email: "n.petrov@email.com",
      initials: "NP",
      color: "#EAD4A8",
    },
    doctor: { name: "Dr. Claire Dupont", spec: "Ophthalmology" },
    date: "2026-05-22",
    time: "4:00 PM",
    type: "Consultation",
    status: "pending",
    note: "Vision deterioration, possible early-stage glaucoma.",
  },
  {
    id: "A-3310",
    patient: {
      name: "Luca Ferretti",
      email: "l.ferretti@email.com",
      initials: "LF",
      color: "#C8D4E8",
    },
    doctor: { name: "Dr. Nadia Petrov", spec: "Dermatology" },
    date: "2026-05-23",
    time: "11:00 AM",
    type: "Consultation",
    status: "pending",
    note: "Persistent rash on forearms. Possible eczema or psoriasis.",
  },
];

const FILTERS = ["all", "pending", "accepted", "declined"];
const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", badge: null },
  { icon: "📋", label: "Appointments", badge: "4", active: true },
  { icon: "👥", label: "Patients", badge: null },
  { icon: "👨‍⚕️", label: "Doctors", badge: null },
  { icon: "🧪", label: "Lab Results", badge: "2" },
  { icon: "📊", label: "Reports", badge: null },
  { icon: "⚙️", label: "Settings", badge: null },
];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
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
      title: "Delete appointment",
      sub: `This will permanently remove the appointment for`,
      btnLabel: "Delete",
      btnClass: "danger",
    },
    decline: {
      icon: "❌",
      title: "Decline appointment",
      sub: `You are about to decline the appointment for`,
      btnLabel: "Decline",
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
          on {fmtDate(appt.date)} at {appt.time}. This action cannot be undone.
        </p>
        <div className="ma-modal-btns">
          <button className="ma-modal-cancel" onClick={onCancel}>
            Cancel
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
  const [appts, setAppts] = useState(INITIAL);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-asc");
  const [view, setView] = useState("cards");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

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
          a.id.toLowerCase().includes(q),
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
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const labels = {
      accepted: "Appointment accepted",
      declined: "Appointment declined",
    };
    const types = { accepted: "success", declined: "warn" };
    setToast({ msg: labels[status], type: types[status] });
  };

  const doDelete = (id) => {
    setAppts((prev) => prev.filter((a) => a.id !== id));
    setModal(null);
    setToast({ msg: "Appointment deleted", type: "danger" });
  };

  const openModal = (action, appt) => setModal({ action, appt });
  const closeModal = () => setModal(null);

  const ActionButtons = ({ appt, compact = false }) => (
    <>
      <button
        className={compact ? "ma-row-act accept" : "ma-act-btn ma-act-accept"}
        disabled={appt.status === "accepted"}
        onClick={() => setStatus(appt.id, "accepted")}
        title="Accept"
      >
        ✓ {!compact && "Accept"}
      </button>
      <button
        className={compact ? "ma-row-act decline" : "ma-act-btn ma-act-decline"}
        disabled={appt.status === "declined"}
        onClick={() => openModal("decline", appt)}
        title="Decline"
      >
        ✕ {!compact && "Decline"}
      </button>
      <button
        className={compact ? "ma-row-act del" : "ma-act-btn ma-act-delete"}
        onClick={() => openModal("delete", appt)}
        title="Delete"
      >
        🗑 {!compact && "Delete"}
      </button>
    </>
  );

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
          <button className="ma-nav-item">
            <span className="ma-nav-icon">🚪</span>Sign Out
          </button>
        </nav>
        <div className="ma-sidebar-user">
          <div className="ma-user-avatar">EM</div>
          <div>
            <div className="ma-user-name">Dr. E. Marchetti</div>
            <div className="ma-user-role">Administrator</div>
          </div>
        </div>
      </aside>

      <div className="ma-main">
        <header className="ma-topbar">
          <div className="ma-topbar-left">
            <span className="ma-topbar-title">Manage Appointments</span>
            <span className="ma-topbar-sub">
              Review, accept, or decline incoming bookings
            </span>
          </div>
          <div className="ma-topbar-right">
            <div className="ma-search-wrap">
              <span className="ma-search-icon">🔍</span>
              <input
                className="ma-search"
                placeholder="Search patient, doctor…"
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
              <div className="ma-sum-label">Pending Review</div>
              <div className="ma-sum-num">{counts.pending || 0}</div>
              <div className="ma-sum-sub">Awaiting action</div>
            </div>
            <div className="ma-sum-card c-accepted">
              <div className="ma-sum-icon">✅</div>
              <div className="ma-sum-label">Accepted</div>
              <div className="ma-sum-num">{counts.accepted || 0}</div>
              <div className="ma-sum-sub">Confirmed bookings</div>
            </div>
            <div className="ma-sum-card c-declined">
              <div className="ma-sum-icon">❌</div>
              <div className="ma-sum-label">Declined</div>
              <div className="ma-sum-num">{counts.declined || 0}</div>
              <div className="ma-sum-sub">Not confirmed</div>
            </div>
            <div className="ma-sum-card c-total">
              <div className="ma-sum-icon">📋</div>
              <div className="ma-sum-label">Total</div>
              <div className="ma-sum-num">{counts.all}</div>
              <div className="ma-sum-sub">All appointments</div>
            </div>
          </div>

          <div className="ma-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`ma-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ma-filter-count">{counts[f] || 0}</span>
              </button>
            ))}
            <div className="ma-filters-right">
              <select
                className="ma-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="date-asc">Date: earliest first</option>
                <option value="date-desc">Date: latest first</option>
                <option value="patient">Patient A–Z</option>
                <option value="doctor">Doctor A–Z</option>
              </select>
            </div>
          </div>

          {view === "cards" &&
            (filtered.length === 0 ? (
              <div className="ma-empty">
                <div className="ma-empty-icon">📭</div>
                <div className="ma-empty-title">No appointments found</div>
                <div className="ma-empty-sub">
                  Try adjusting your search or filter.
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
                      <span className={`ma-badge ${a.status}`}>
                        <span className="ma-badge-dot" />
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
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
                          at {a.time}
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
                          {a.id}
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
                <div className="ma-th">Patient</div>
                <div className="ma-th">Doctor</div>
                <div className="ma-th">Date & Time</div>
                <div className="ma-th">Type</div>
                <div className="ma-th">Status</div>
                <div className="ma-th" style={{ textAlign: "right" }}>
                  Actions
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="ma-empty">
                  <div className="ma-empty-icon">📭</div>
                  <div className="ma-empty-title">No appointments found</div>
                  <div className="ma-empty-sub">
                    Try adjusting your search or filter.
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
                      <span className={`ma-badge ${a.status}`}>
                        <span className="ma-badge-dot" />
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
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
            if (modal.action === "decline") {
              setStatus(modal.appt.id, "declined");
              closeModal();
            }
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
