import { useState, useMemo, useEffect } from "react";
import "../styles/PatientAppointments.css";

const PATIENT = {
  name: "Margaret Liu",
  initials: "ML",
  email: "m.liu@email.com",
};

const SEED = [
  {
    id: "APT-3301",
    type: "Cardiology Consultation",
    specialty: "Cardiology",
    doctor: "Dr. Elena Marchetti",
    date: "2026-05-19",
    time: "10:00 AM",
    duration: "45 min",
    room: "Suite 3B",
    status: "upcoming",
    note: "Bring all previous ECG reports and the St. Mary's referral letter.",
  },
  {
    id: "APT-3302",
    type: "Neurology Follow-up",
    specialty: "Neurology",
    doctor: "Dr. James Okafor",
    date: "2026-05-26",
    time: "11:30 AM",
    duration: "30 min",
    room: "Suite 1A",
    status: "upcoming",
    note: "Post-MRI review. Bring the April scan CD if available.",
  },
  {
    id: "APT-3303",
    type: "Annual Check-up",
    specialty: "Internal Medicine",
    doctor: "Dr. Alan Voss",
    date: "2026-05-13",
    time: "9:00 AM",
    duration: "45 min",
    room: "Suite 2D",
    status: "completed",
    note: "Blood panel ordered. Results available in the portal.",
  },
  {
    id: "APT-3304",
    type: "Dermatology Consultation",
    specialty: "Dermatology",
    doctor: "Dr. Nadia Petrov",
    date: "2026-05-10",
    time: "2:30 PM",
    duration: "30 min",
    room: "Suite 4B",
    status: "completed",
    note: "Patch test results discussed. Follow-up cream prescribed.",
  },
  {
    id: "APT-3305",
    type: "Ophthalmology Screening",
    specialty: "Ophthalmology",
    doctor: "Dr. Claire Dupont",
    date: "2026-04-28",
    time: "3:00 PM",
    duration: "45 min",
    room: "Suite 6A",
    status: "completed",
    note: "Vision stable. New prescription issued. Annual review booked.",
  },
  {
    id: "APT-3306",
    type: "Orthopedics Consultation",
    specialty: "Orthopedics",
    doctor: "Dr. Sophia Reyes",
    date: "2026-05-07",
    time: "1:00 PM",
    duration: "60 min",
    room: "Suite 5C",
    status: "cancelled",
    note: "Cancelled due to scheduling conflict. Please rebook.",
  },
  {
    id: "APT-3307",
    type: "Cardiology Results Review",
    specialty: "Cardiology",
    doctor: "Dr. Elena Marchetti",
    date: "2026-06-03",
    time: "8:30 AM",
    duration: "20 min",
    room: "Suite 3B",
    status: "upcoming",
    note: "Stress test results review and treatment plan discussion.",
  },
];

const FILTERS = [
  { key: "all", label: "All", dot: null },
  { key: "upcoming", label: "Upcoming", dot: "#C6A86B" },
  { key: "completed", label: "Completed", dot: "#27AE60" },
  { key: "cancelled", label: "Cancelled", dot: "#C0392B" },
];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtDay = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric" });

const fmtMonth = (d) =>
  new Date(d + "T00:00:00")
    .toLocaleDateString("en-GB", { month: "short" })
    .toUpperCase();

const specialtyIcon = (s) =>
  ({
    Cardiology: "🫀",
    Neurology: "🧠",
    Orthopedics: "🦴",
    "Internal Medicine": "🩺",
    Ophthalmology: "👁️",
    Dermatology: "🌿",
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
          <div className="pt-modal-title">Cancel appointment?</div>
        </div>
        <p className="pt-modal-sub">
          This will permanently remove this booking from your records. You can
          always rebook through the portal.
        </p>
        <div className="pt-modal-appt-card">
          <div className="pt-modal-appt-icon">
            {specialtyIcon(appt.specialty)}
          </div>
          <div>
            <div className="pt-modal-appt-type">{appt.type}</div>
            <div className="pt-modal-appt-meta">
              {appt.doctor} · {fmtDate(appt.date)} at {appt.time}
            </div>
          </div>
        </div>
        <div className="pt-modal-btns">
          <button className="pt-modal-cancel" onClick={onCancel}>
            Keep it
          </button>
          <button className="pt-modal-confirm" onClick={onConfirm}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointments() {
  const [appts, setAppts] = useState(SEED);
  const [filter, setFilter] = useState("all");
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
    list.sort((a, b) => {
      const da = new Date(a.date + " " + a.time);
      const db = new Date(b.date + " " + b.time);
      if (sort === "date-asc") return da - db;
      if (sort === "date-desc") return db - da;
      if (sort === "type") return a.type.localeCompare(b.type);
      if (sort === "doctor") return a.doctor.localeCompare(b.doctor);
      return 0;
    });
    return list;
  }, [appts, filter, sort]);

  const nextAppt = useMemo(
    () =>
      [...appts]
        .filter((a) => a.status === "upcoming")
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0],
    [appts],
  );

  const doDelete = () => {
    setAppts((prev) => prev.filter((a) => a.id !== modal.id));
    setToast({ msg: `${modal.type} removed from your appointments.` });
    setModal(null);
  };

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
            <a href="#">Dashboard</a>
          </li>
          <li>
            <a href="#" className="active">
              Appointments
            </a>
          </li>
          <li>
            <a href="#">Lab Results</a>
          </li>
          <li>
            <a href="#">Messages</a>
          </li>
          <li>
            <a href="#">Profile</a>
          </li>
        </ul>
        <div className="pt-nav-user">
          <div className="pt-nav-avatar">{PATIENT.initials}</div>
          <span className="pt-nav-name">{PATIENT.name.split(" ")[0]}</span>
        </div>
      </nav>

      <div className="pt-hero">
        <div className="pt-hero-glow" />
        <div className="pt-hero-grain" />
        <div className="pt-hero-inner">
          <div className="pt-hero-left">
            <p className="pt-hero-tag">Patient Portal</p>
            <h1 className="pt-hero-title">
              My Appointments,
              <em>{PATIENT.name}.</em>
            </h1>
            <p className="pt-hero-sub">
              Your full appointment history across all specialties. Book new
              slots, track upcoming visits, and manage your care schedule.
            </p>
          </div>
          <div className="pt-hero-pills">
            <div
              className={`pt-hero-pill ${counts.upcoming ? "highlight" : ""}`}
            >
              <div className="pt-pill-num">{counts.upcoming || 0}</div>
              <div className="pt-pill-lbl">Upcoming</div>
            </div>
            <div className="pt-hero-pill">
              <div className="pt-pill-num">{counts.completed || 0}</div>
              <div className="pt-pill-lbl">Completed</div>
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
              {specialtyIcon(nextAppt.specialty)}
            </div>
            <div className="pt-next-body">
              <div className="pt-next-label">Your next appointment</div>
              <div className="pt-next-title">{nextAppt.type}</div>
              <div className="pt-next-meta">
                {nextAppt.doctor} &nbsp;·&nbsp; {fmtDate(nextAppt.date)} at{" "}
                {nextAppt.time} &nbsp;·&nbsp; {nextAppt.room}
              </div>
            </div>
            <button className="pt-next-cta">Add to calendar</button>
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
              <option value="date-asc">Earliest first</option>
              <option value="date-desc">Latest first</option>
              <option value="type">Type A–Z</option>
              <option value="doctor">Doctor A–Z</option>
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
            <div className="pt-empty-title">No appointments here</div>
            <p className="pt-empty-sub">
              {filter === "all"
                ? "You don't have any appointments yet. Book your first consultation below."
                : `You have no ${filter} appointments. Try a different filter.`}
            </p>
            <button
              className="pt-empty-btn"
              onClick={() => (window.location.href = "/book")}
            >
              + Book an Appointment
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
                <div className={`pt-card-stripe ${a.status}`} />
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
                      <div className="pt-date-day">{fmtDay(a.date)}</div>
                      <div className="pt-date-month">{fmtMonth(a.date)}</div>
                    </div>
                    <span className={`pt-badge ${a.status}`}>
                      <span className="pt-badge-dot" />
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>

                  <div className="pt-card-header">
                    <div>
                      <div className="pt-card-title">{a.type}</div>
                      <div className="pt-card-spec">{a.specialty}</div>
                    </div>
                  </div>

                  <div className="pt-card-details">
                    <div className="pt-card-detail">
                      <span className="pt-card-detail-icon">👨‍⚕️</span>
                      <span className="pt-card-detail-val">{a.doctor}</span>
                    </div>
                    <div className="pt-card-detail">
                      <span className="pt-card-detail-icon">🕐</span>
                      <span className="pt-card-detail-val">
                        {a.time} &nbsp;·&nbsp; {a.duration}
                      </span>
                    </div>
                    <div className="pt-card-detail">
                      <span className="pt-card-detail-icon">📍</span>
                      <span className="pt-card-detail-val">
                        {a.room} &nbsp;·&nbsp; VitaMed Clinic
                      </span>
                    </div>
                  </div>

                  {a.note && <div className="pt-card-note">{a.note}</div>}

                  <div className="pt-card-footer">
                    <span className="pt-card-ref">{a.id}</span>
                    <div className="pt-card-actions">
                      {a.status === "completed" && (
                        <button
                          className="pt-card-act rebook"
                          onClick={() => (window.location.href = "/book")}
                        >
                          ↺ Rebook
                        </button>
                      )}
                      <button
                        className="pt-card-act delete"
                        onClick={() => setModal(a)}
                      >
                        🗑 Delete
                      </button>
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
              <div className="pt-lh">Appointment</div>
              <div className="pt-lh">Doctor</div>
              <div className="pt-lh">Date</div>
              <div className="pt-lh">Time</div>
              <div className="pt-lh">Status</div>
              <div className="pt-lh" style={{ textAlign: "right" }}>
                Actions
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
                    {specialtyIcon(a.specialty)} {a.type}
                  </div>
                  <div className="pt-lc-spec">
                    {a.specialty} &nbsp;·&nbsp; {a.id}
                  </div>
                </div>
                <div className="pt-lc">
                  <div className="pt-lc-doc">{a.doctor}</div>
                  <div className="pt-lc-spec2">{a.room}</div>
                </div>
                <div className="pt-lc">
                  <div className="pt-lc-date">{fmtDate(a.date)}</div>
                  <div className="pt-lc-time">{a.duration}</div>
                </div>
                <div className="pt-lc">
                  <div className="pt-lc-time">{a.time}</div>
                </div>
                <div className="pt-lc">
                  <span className={`pt-badge ${a.status}`}>
                    <span className="pt-badge-dot" />
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
                <div className="pt-lc" style={{ textAlign: "right" }}>
                  <div className="pt-list-acts">
                    {a.status === "completed" && (
                      <button
                        className="pt-la"
                        title="Rebook"
                        onClick={() => (window.location.href = "/book")}
                      >
                        ↺
                      </button>
                    )}
                    <button
                      className="pt-la del"
                      title="Delete"
                      onClick={() => setModal(a)}
                    >
                      🗑
                    </button>
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
              onClick={() => (window.location.href = "/book")}
            >
              + Book a New Appointment
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
