import { useState, useMemo, useEffect } from "react";
import "../styles/DoctorPortal.css";

/* ─────────────── Data ─────────────── */
const DOCTOR = {
  name: "Dr. Elena Marchetti",
  spec: "Cardiology",
  initials: "EM",
  id: "VMD-0041",
};

const INITIAL_APPTS = [
  {
    id: "AP-001",
    patient: {
      name: "Margaret Liu",
      email: "m.liu@email.com",
      initials: "ML",
      color: "#D9C49A",
    },
    date: "2026-05-14",
    time: "8:00 AM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 3B",
    note: "Intermittent chest tightness. EKG review requested. Bring previous reports from St. Mary's.",
  },
  {
    id: "AP-002",
    patient: {
      name: "Priya Nair",
      email: "p.nair@email.com",
      initials: "PN",
      color: "#F0C8A0",
    },
    date: "2026-05-14",
    time: "9:00 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "accepted",
    room: "Suite 3B",
    note: "Post-stress-test review. Previous echo showed mild regurgitation.",
  },
  {
    id: "AP-003",
    patient: {
      name: "Thomas Bauer",
      email: "t.bauer@email.com",
      initials: "TB",
      color: "#A8C4D9",
    },
    date: "2026-05-14",
    time: "10:30 AM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 3B",
    note: "New patient. Referred by GP for palpitations workup.",
  },
  {
    id: "AP-004",
    patient: {
      name: "Carlos Mendez",
      email: "c.mendez@email.com",
      initials: "CM",
      color: "#C8B4E8",
    },
    date: "2026-05-14",
    time: "12:00 PM",
    duration: "30 min",
    type: "Results Review",
    status: "accepted",
    room: "Suite 3B",
    note: "24-hour Holter monitor results ready for review.",
  },
  {
    id: "AP-005",
    patient: {
      name: "Saoirse Kelly",
      email: "s.kelly@email.com",
      initials: "SK",
      color: "#F0D4A8",
    },
    date: "2026-05-15",
    time: "9:30 AM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 3B",
    note: "Family history of CAD. Risk stratification requested.",
  },
  {
    id: "AP-006",
    patient: {
      name: "David Osei",
      email: "d.osei@email.com",
      initials: "DO",
      color: "#A8D4B8",
    },
    date: "2026-05-15",
    time: "11:00 AM",
    duration: "60 min",
    type: "Procedure",
    status: "accepted",
    room: "Suite 3B",
    note: "Scheduled echocardiogram. Patient is on anticoagulants.",
  },
  {
    id: "AP-007",
    patient: {
      name: "Wei Zhang",
      email: "w.zhang@email.com",
      initials: "WZ",
      color: "#A8D4D0",
    },
    date: "2026-05-16",
    time: "8:30 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "pending",
    room: "Suite 3B",
    note: "Post-cardioversion check-in. Rhythm monitoring ongoing.",
  },
  {
    id: "AP-008",
    patient: {
      name: "Isabelle Fontaine",
      email: "i.fontaine@email.com",
      initials: "IF",
      color: "#D4A8C7",
    },
    date: "2026-05-16",
    time: "2:00 PM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 3B",
    note: "Dyspnea on exertion. Rule out heart failure.",
  },
];

const TODAY_TIMES = [
  {
    time: "8:00 AM",
    name: "Margaret Liu",
    type: "Consultation",
    status: "accepted",
  },
  { time: "9:00 AM", name: "Priya Nair", type: "Follow-up", status: "now" },
  {
    time: "10:30 AM",
    name: "Thomas Bauer",
    type: "Consultation",
    status: "pending",
  },
  {
    time: "12:00 PM",
    name: "Carlos Mendez",
    type: "Results Review",
    status: "pending",
  },
];

const SLOT_SCHEDULE = [
  { time: "8:00", label: "8:00 AM", state: "booked" },
  { time: "8:30", label: "8:30 AM", state: "free" },
  { time: "9:00", label: "9:00 AM", state: "booked" },
  { time: "9:30", label: "9:30 AM", state: "free" },
  { time: "10:00", label: "10:00 AM", state: "booked" },
  { time: "10:30", label: "10:30 AM", state: "free" },
];

const PATIENT_NOTES = [
  {
    initials: "ML",
    color: "#D9C49A",
    name: "Margaret Liu",
    note: "EKG from March shows sinus brady. Monitor rate.",
  },
  {
    initials: "PN",
    color: "#F0C8A0",
    name: "Priya Nair",
    note: "Echo: mild MR. No intervention yet. 6-month follow-up.",
  },
  {
    initials: "TB",
    color: "#A8C4D9",
    name: "Thomas Bauer",
    note: "New. Palpitation onset 3 months ago. No meds.",
  },
];

const FILTERS = ["all", "pending", "accepted"];
const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", badge: null },
  { icon: "📅", label: "My Schedule", badge: "4", active: true },
  { icon: "👥", label: "My Patients", badge: null },
  { icon: "🧪", label: "Lab Results", badge: "2" },
  { icon: "💬", label: "Messages", badge: "3" },
  { icon: "📊", label: "Reports", badge: null },
];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

/* ─────────────── Toast ─────────────── */
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
        <div className="dp-modal-title">Delete appointment</div>
        <p className="dp-modal-sub">
          This will permanently remove the appointment for{" "}
          <span className="dp-modal-name">{appt.patient.name}</span> on{" "}
          {fmtDate(appt.date)} at {appt.time}. This cannot be undone.
        </p>
        <div className="dp-modal-btns">
          <button className="dp-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="dp-modal-confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Main ─────────────── */
export default function DoctorPortal() {
  const [appts, setAppts] = useState(INITIAL_APPTS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-asc");
  const [tabDay, setTabDay] = useState("upcoming"); // upcoming | today
  const [available, setAvail] = useState(true);
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
    let list =
      tabDay === "today"
        ? appts.filter((a) => a.date === "2026-05-14")
        : [...appts];
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
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
      return 0;
    });
    return list;
  }, [appts, filter, search, sort, tabDay]);

  const accept = (id) => {
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a)),
    );
    setToast({ msg: "Appointment accepted", type: "ok" });
  };

  const remove = (appt) => {
    setAppts((prev) => prev.filter((a) => a.id !== appt.id));
    setModal(null);
    setToast({ msg: "Appointment deleted", type: "del" });
  };

  // group by date for headers
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="dp-shell">
      {/* ══ Sidebar ══ */}
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
              <div className="dp-profile-avatar">{DOCTOR.initials}</div>
              <div className="dp-profile-status-dot" />
            </div>
            <div className="dp-profile-name">{DOCTOR.name}</div>
            <div className="dp-profile-spec">{DOCTOR.spec}</div>
            <div className="dp-profile-id">{DOCTOR.id}</div>
          </div>
        </div>

        <nav className="dp-nav">
          <div className="dp-nav-section">Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`dp-nav-item ${item.active ? "active" : ""}`}
            >
              <span className="dp-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="dp-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="dp-nav-section">Account</div>
          <button className="dp-nav-item">
            <span className="dp-nav-icon">⚙️</span>Preferences
          </button>
          <button className="dp-nav-item">
            <span className="dp-nav-icon">🚪</span>Sign Out
          </button>
        </nav>

        <div className="dp-sidebar-stats">
          {[
            {
              label: "Today's patients",
              val: appts.filter((a) => a.date === "2026-05-14").length,
            },
            { label: "Pending review", val: counts.pending || 0 },
            { label: "This week total", val: appts.length },
          ].map((s) => (
            <div className="dp-sidebar-stat" key={s.label}>
              <span className="dp-sidebar-stat-label">{s.label}</span>
              <span className="dp-sidebar-stat-val">{s.val}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══ Main ══ */}
      <div className="dp-main">
        {/* Topbar */}
        <header className="dp-topbar">
          <div>
            <div className="dp-topbar-greeting">
              Good morning, <em>Dr. Marchetti</em>
            </div>
            <div className="dp-topbar-date">
              Wednesday, 14 May 2026 · {counts.all} appointments this week
            </div>
          </div>
          <div className="dp-topbar-right">
            <div className="dp-search-wrap">
              <span className="dp-search-icon">🔍</span>
              <input
                className="dp-search"
                placeholder="Search patient or type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="dp-tab-toggle">
              <button
                className={`dp-tab-btn ${tabDay === "today" ? "active" : ""}`}
                onClick={() => setTabDay("today")}
              >
                Today
              </button>
              <button
                className={`dp-tab-btn ${tabDay === "upcoming" ? "active" : ""}`}
                onClick={() => setTabDay("upcoming")}
              >
                All
              </button>
            </div>
          </div>
        </header>

        <div className="dp-content">
          {/* Stats row */}
          <div className="dp-stats">
            <div className="dp-stat-card c1">
              <div className="dp-stat-icon">📅</div>
              <div className="dp-stat-label">Today</div>
              <div className="dp-stat-num">
                {appts.filter((a) => a.date === "2026-05-14").length}
              </div>
              <div className="dp-stat-sub">appointments</div>
            </div>
            <div className="dp-stat-card c2">
              <div className="dp-stat-icon">✅</div>
              <div className="dp-stat-label">Accepted</div>
              <div className="dp-stat-num">{counts.accepted || 0}</div>
              <div className="dp-stat-sub">confirmed</div>
            </div>
            <div className="dp-stat-card c3">
              <div className="dp-stat-icon">⏳</div>
              <div className="dp-stat-label">Pending</div>
              <div className="dp-stat-num">{counts.pending || 0}</div>
              <div className="dp-stat-sub">awaiting action</div>
            </div>
            <div className="dp-stat-card c4">
              <div className="dp-stat-icon">🗓</div>
              <div className="dp-stat-label">This week</div>
              <div className="dp-stat-num">{counts.all}</div>
              <div className="dp-stat-sub">total scheduled</div>
            </div>
          </div>

          <div className="dp-body">
            {/* ══ Appointment list ══ */}
            <div>
              <div className="dp-list-header">
                <h2 className="dp-list-title">
                  {tabDay === "today" ? "Today's" : "All"}{" "}
                  <span>Appointments</span>
                </h2>
                <div className="dp-list-controls">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`dp-filter-btn ${filter === f ? "active" : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                      <span className="dp-filter-count">{counts[f] || 0}</span>
                    </button>
                  ))}
                  <select
                    className="dp-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="date-asc">Earliest first</option>
                    <option value="date-desc">Latest first</option>
                    <option value="patient">Patient A–Z</option>
                  </select>
                </div>
              </div>

              {grouped.length === 0 ? (
                <div className="dp-empty">
                  <div className="dp-empty-icon">📭</div>
                  <div className="dp-empty-title">No appointments found</div>
                  <div className="dp-empty-sub">
                    Try adjusting your filters or search.
                  </div>
                </div>
              ) : (
                grouped.map(([date, list]) => (
                  <div key={date}>
                    {/* Date header */}
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
                        {new Date(date + "T00:00:00").toLocaleDateString(
                          "en-GB",
                          { weekday: "long", day: "numeric", month: "long" },
                        )}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: "var(--border)",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {list.length} appt{list.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {list.map((a, i) => (
                      <div
                        key={a.id}
                        className={`dp-appt-card ${a.status}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="dp-appt-card-inner">
                          {/* Time column */}
                          <div className="dp-appt-time-col">
                            <div className="dp-time-main">
                              {a.time.replace(" AM", "").replace(" PM", "")}
                              <br />
                              <span
                                style={{ fontSize: 10, color: "var(--muted)" }}
                              >
                                {a.time.includes("AM") ? "AM" : "PM"}
                              </span>
                            </div>
                            <div className="dp-time-dur">{a.duration}</div>
                          </div>

                          {/* Body */}
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
                                {a.status.charAt(0).toUpperCase() +
                                  a.status.slice(1)}
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
                              <span className="dp-appt-meta-item">
                                <span className="dp-appt-meta-icon">⏱</span>
                                {a.duration}
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
                                {a.id}
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
                                  ? "Accepted"
                                  : "Accept"}
                              </button>
                              <button
                                className="dp-act delete"
                                onClick={() => setModal(a)}
                              >
                                🗑 Delete
                              </button>
                              {a.status === "accepted" && (
                                <span className="dp-act-label">
                                  Confirmed · patient notified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* ══ Right column ══ */}
            <div className="dp-right">
              {/* Today's timeline */}
              <div className="dp-schedule-card">
                <div className="dp-schedule-label">Overview</div>
                <div className="dp-schedule-title">
                  Today's <em>schedule</em>
                </div>
                <div className="dp-timeline">
                  {TODAY_TIMES.map((t, i) => (
                    <div className="dp-timeline-item" key={i}>
                      <div className={`dp-timeline-dot ${t.status}`} />
                      <span className="dp-tl-time">{t.time}</span>
                      <div>
                        <div className="dp-tl-name">{t.name}</div>
                        <div className="dp-tl-type">{t.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dp-schedule-footer">
                  <span className="dp-schedule-footer-txt">
                    Next available slot
                  </span>
                  <span className="dp-schedule-footer-num">1:30 PM</span>
                </div>
              </div>

              {/* Availability */}
              <div className="dp-avail-card">
                <div className="dp-avail-header">
                  <span className="dp-avail-title">Availability — Today</span>
                  <label className="dp-toggle">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => setAvail(e.target.checked)}
                    />
                    <span className="dp-toggle-slider" />
                  </label>
                </div>
                <div className="dp-avail-slots">
                  {SLOT_SCHEDULE.map((s) => (
                    <div key={s.time} className={`dp-avail-slot ${s.state}`}>
                      {s.label} {s.state === "booked" ? "· Booked" : "· Free"}
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient notes */}
              <div className="dp-notes-card">
                <div className="dp-notes-title">Quick Patient Notes</div>
                {PATIENT_NOTES.map((n) => (
                  <div className="dp-note-item" key={n.name}>
                    <div
                      className="dp-note-avatar"
                      style={{ background: n.color }}
                    >
                      {n.initials}
                    </div>
                    <div>
                      <div className="dp-note-patient">{n.name}</div>
                      <div className="dp-note-text">{n.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Delete Modal ══ */}
      {modal && (
        <DeleteModal
          appt={modal}
          onCancel={() => setModal(null)}
          onConfirm={() => remove(modal)}
        />
      )}

      {/* ══ Toast ══ */}
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
