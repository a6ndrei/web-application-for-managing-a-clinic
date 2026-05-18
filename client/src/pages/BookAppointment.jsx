import { useState, useMemo } from "react";
import "../styles/BookAppointment.css";

const SPECIALTIES = [
  { icon: "🫀", name: "Cardiology", doctors: 4, price: 180 },
  { icon: "🧠", name: "Neurology", doctors: 3, price: 200 },
  { icon: "🦴", name: "Orthopedics", doctors: 5, price: 160 },
  { icon: "🩺", name: "Internal Medicine", doctors: 6, price: 130 },
  { icon: "👁️", name: "Ophthalmology", doctors: 3, price: 150 },
  { icon: "🌿", name: "Dermatology", doctors: 4, price: 140 },
];

const DOCTORS = {
  Cardiology: [
    {
      id: "d1",
      name: "Dr. Elena Marchetti",
      spec: "Cardiology",
      initials: "EM",
      rating: "4.9",
      reviews: "312",
      next: "Tomorrow",
    },
    {
      id: "d2",
      name: "Dr. Paul Armand",
      spec: "Cardiology",
      initials: "PA",
      rating: "4.7",
      reviews: "198",
      next: "May 19",
    },
  ],
  Neurology: [
    {
      id: "d3",
      name: "Dr. James Okafor",
      spec: "Neurology",
      initials: "JO",
      rating: "4.8",
      reviews: "274",
      next: "Today",
    },
    {
      id: "d4",
      name: "Dr. Lena Hoffmann",
      spec: "Neurology",
      initials: "LH",
      rating: "4.6",
      reviews: "145",
      next: "May 20",
    },
  ],
  Orthopedics: [
    {
      id: "d5",
      name: "Dr. Sophia Reyes",
      spec: "Orthopedics",
      initials: "SR",
      rating: "5.0",
      reviews: "198",
      next: "Tomorrow",
    },
    {
      id: "d6",
      name: "Dr. Marcus Webb",
      spec: "Orthopedics",
      initials: "MW",
      rating: "4.8",
      reviews: "221",
      next: "May 21",
    },
  ],
  "Internal Medicine": [
    {
      id: "d7",
      name: "Dr. Alan Voss",
      spec: "Internal Medicine",
      initials: "AV",
      rating: "4.7",
      reviews: "421",
      next: "Today",
    },
    {
      id: "d8",
      name: "Dr. Yuki Tanaka",
      spec: "Internal Medicine",
      initials: "YT",
      rating: "4.9",
      reviews: "317",
      next: "Tomorrow",
    },
  ],
  Ophthalmology: [
    {
      id: "d9",
      name: "Dr. Claire Dupont",
      spec: "Ophthalmology",
      initials: "CD",
      rating: "4.8",
      reviews: "159",
      next: "May 19",
    },
  ],
  Dermatology: [
    {
      id: "d10",
      name: "Dr. Nadia Petrov",
      spec: "Dermatology",
      initials: "NP",
      rating: "4.9",
      reviews: "283",
      next: "Tomorrow",
    },
  ],
};

const VISIT_TYPES = [
  { icon: "🏥", name: "In-Person", desc: "Visit the clinic" },
  { icon: "💻", name: "Telehealth", desc: "Video consultation" },
];

const TIMES = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];
const UNAVAIL = ["8:30 AM", "9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TODAY = new Date();

function Calendar({ selected, onSelect }) {
  const [view, setView] = useState({
    year: TODAY.getFullYear(),
    month: TODAY.getMonth(),
  });

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const last = new Date(view.year, view.month + 1, 0);
    const blanks = Array(first.getDay()).fill(null);
    const days = Array.from({ length: last.getDate() }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [view]);

  const slotDays = useMemo(() => {
    const s = new Set();
    for (let i = 1; i <= 28; i++) {
      if (i % 7 !== 0 && i % 6 !== 1) s.add(i);
    }
    return s;
  }, []);

  const prev = () =>
    setView((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { ...v, month: v.month - 1 },
    );
  const next = () =>
    setView((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { ...v, month: v.month + 1 },
    );

  const isToday = (d) =>
    d === TODAY.getDate() &&
    view.month === TODAY.getMonth() &&
    view.year === TODAY.getFullYear();
  const isPast = (d) =>
    new Date(view.year, view.month, d) <
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const dateKey = (d) =>
    `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="bk-calendar-wrap">
      <div className="bk-cal-header">
        <button className="bk-cal-nav" onClick={prev}>
          ‹
        </button>
        <span className="bk-cal-month">
          {MONTHS[view.month]} {view.year}
        </span>
        <button className="bk-cal-nav" onClick={next}>
          ›
        </button>
      </div>
      <div className="bk-cal-grid">
        <div className="bk-cal-days-header">
          {DAYS.map((d) => (
            <div key={d} className="bk-cal-day-name">
              {d}
            </div>
          ))}
        </div>
        <div className="bk-cal-days">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="bk-cal-day empty" />;
            const past = isPast(d);
            const hasSlots = slotDays.has(d) && !past;
            const sel = selected === dateKey(d);
            return (
              <div
                key={i}
                className={`bk-cal-day ${past ? "past" : ""} ${isToday(d) ? "today" : ""} ${hasSlots ? "has-slots" : ""} ${sel ? "selected" : ""}`}
                onClick={() => !past && hasSlots && onSelect(dateKey(d))}
              >
                {d}
                {hasSlots && <div className="bk-cal-dot" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({ step, booking }) {
  const spec = SPECIALTIES.find((s) => s.name === booking.specialty);
  const doctor = booking.doctor;
  const fmtDate = (d) => {
    if (!d) return null;
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <aside className="bk-right">
      <div className="bk-summary-title">Booking Summary</div>

      <div className="bk-summary-section">
        <div className="bk-summary-label">Specialty</div>
        {booking.specialty ? (
          <div className="bk-summary-val big">
            {spec?.icon} {booking.specialty}
          </div>
        ) : (
          <div className="bk-summary-placeholder">Not selected yet</div>
        )}
      </div>

      <div className="bk-summary-section">
        <div className="bk-summary-label">Doctor</div>
        {doctor ? (
          <div className="bk-summary-doc-card">
            <div className="bk-summary-doc-avatar">{doctor.initials}</div>
            <div>
              <div className="bk-summary-doc-name">{doctor.name}</div>
              <div className="bk-summary-doc-spec">{doctor.spec}</div>
            </div>
          </div>
        ) : (
          <div className="bk-summary-placeholder">Not selected yet</div>
        )}
      </div>

      <div className="bk-summary-section">
        <div className="bk-summary-label">Date & Time</div>
        {booking.date && booking.time ? (
          <div className="bk-summary-val">
            {fmtDate(booking.date)}
            <br />
            {booking.time} · {booking.visitType || "In-Person"}
          </div>
        ) : booking.date ? (
          <div className="bk-summary-val">
            {fmtDate(booking.date)}
            <br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>
              Time not chosen
            </span>
          </div>
        ) : (
          <div className="bk-summary-placeholder">Not selected yet</div>
        )}
      </div>

      <div className="bk-summary-section">
        <div className="bk-summary-label">Patient</div>
        {booking.firstName ? (
          <div className="bk-summary-val">
            {booking.firstName} {booking.lastName}
            <br />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {booking.email}
            </span>
          </div>
        ) : (
          <div className="bk-summary-placeholder">Not entered yet</div>
        )}
      </div>

      <div className="bk-summary-divider" />

      <div className="bk-summary-total">
        <div className="bk-summary-total-label">Consultation Fee</div>
        <div className="bk-summary-total-price">
          {spec ? `£${spec.price}` : "—"}
        </div>
        <div className="bk-summary-total-note">
          Payment collected at the clinic
        </div>
      </div>

      <div className="bk-summary-help">
        Need help? Call us at <a href="#">+44 20 7946 0300</a> or email{" "}
        <a href="#">hello@vitamedclinic.com</a>
      </div>
    </aside>
  );
}

const STEPS = ["Specialty", "Doctor", "Date & Time", "Your Details"];

export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [booking, setBooking] = useState({
    specialty: "",
    doctor: null,
    date: "",
    time: "",
    visitType: "In-Person",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    insurance: "",
    notes: "",
  });

  const set = (key, val) => setBooking((b) => ({ ...b, [key]: val }));

  const canNext = [
    !!booking.specialty,
    !!booking.doctor,
    !!(booking.date && booking.time),
    !!(booking.firstName && booking.lastName && booking.email),
  ];

  const handleSubmit = () => {
    if (canNext[3]) setSubmitted(true);
  };

  const refId = `VM-${Math.floor(10000 + Math.random() * 90000)}`;
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (submitted)
    return (
      <>
        <nav className="bk-nav">
          <a href="/" className="bk-nav-logo">
            <div className="bk-logo-mark">V</div>
            <span className="bk-logo-text">
              Vita<span>Med</span>
            </span>
          </a>
        </nav>
        <div className="bk-success">
          <div className="bk-success-card">
            <div className="bk-success-ring">✓</div>
            <div className="bk-success-id">Ref: {refId}</div>
            <h2 className="bk-success-title">
              Appointment <em>confirmed!</em>
            </h2>
            <p className="bk-success-sub">
              Your booking has been received. You'll get a confirmation email at{" "}
              <strong>{booking.email}</strong> within a few minutes.
            </p>
            <div className="bk-success-details">
              <div>
                <div className="bk-success-detail-label">Doctor</div>
                <div className="bk-success-detail-val">
                  {booking.doctor?.name}
                </div>
              </div>
              <div>
                <div className="bk-success-detail-label">Specialty</div>
                <div className="bk-success-detail-val">{booking.specialty}</div>
              </div>
              <div>
                <div className="bk-success-detail-label">Date</div>
                <div className="bk-success-detail-val">
                  {fmtDate(booking.date)}
                </div>
              </div>
              <div>
                <div className="bk-success-detail-label">Time</div>
                <div className="bk-success-detail-val">
                  {booking.time} · {booking.visitType}
                </div>
              </div>
            </div>
            <div className="bk-success-btns">
              <button
                className="bk-success-btn-primary"
                onClick={() => (window.location.href = "/reservations")}
              >
                View My Appointments
              </button>
              <button
                className="bk-success-btn-ghost"
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                  setBooking({
                    specialty: "",
                    doctor: null,
                    date: "",
                    time: "",
                    visitType: "In-Person",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    dob: "",
                    insurance: "",
                    notes: "",
                  });
                }}
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <nav className="bk-nav">
        <a href="/" className="bk-nav-logo">
          <div className="bk-logo-mark">V</div>
          <span className="bk-logo-text">
            Vita<span>Med</span>
          </span>
        </a>
        <a href="/reservations" className="bk-nav-back">
          ← My Appointments
        </a>
      </nav>

      <div className="bk-page">
        <div className="bk-left">
          <div className="bk-stepper">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`bk-step ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}
              >
                <div className="bk-step-circle">{i < step ? "✓" : i + 1}</div>
                <div className="bk-step-label">{label}</div>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="bk-panel">
              <div className="bk-section-eyebrow">Step 1 of 4</div>
              <h2 className="bk-section-title">
                Choose a <em>specialty</em>
              </h2>
              <div className="bk-specialty-grid">
                {SPECIALTIES.map((s) => (
                  <div
                    key={s.name}
                    className={`bk-specialty-card ${booking.specialty === s.name ? "selected" : ""}`}
                    onClick={() => {
                      set("specialty", s.name);
                      set("doctor", null);
                    }}
                  >
                    <span className="bk-spec-icon">{s.icon}</span>
                    <div className="bk-spec-name">{s.name}</div>
                    <div className="bk-spec-count">
                      {s.doctors} specialists · from £{s.price}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bk-nav-btns">
                <button
                  className="bk-btn-next"
                  disabled={!canNext[0]}
                  onClick={() => setStep(1)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bk-panel">
              <div className="bk-section-eyebrow">Step 2 of 4</div>
              <h2 className="bk-section-title">
                Select a <em>doctor</em>
              </h2>
              <div className="bk-doctor-list">
                {(DOCTORS[booking.specialty] || []).map((d) => (
                  <div
                    key={d.id}
                    className={`bk-doctor-card ${booking.doctor?.id === d.id ? "selected" : ""}`}
                    onClick={() => set("doctor", d)}
                  >
                    <div className="bk-doc-avatar">{d.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div className="bk-doc-name">{d.name}</div>
                      <div className="bk-doc-spec">{d.spec}</div>
                      <div className="bk-doc-meta">
                        <span className="bk-doc-rating">
                          <span className="stars">★★★★★</span> {d.rating} (
                          {d.reviews})
                        </span>
                      </div>
                    </div>
                    <div className="bk-doc-next">
                      <div className="bk-doc-next-label">Next available</div>
                      <div className="bk-doc-next-val">{d.next}</div>
                    </div>
                    <div className="bk-check">✓</div>
                  </div>
                ))}
              </div>
              <div className="bk-nav-btns">
                <button className="bk-btn-back" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button
                  className="bk-btn-next"
                  disabled={!canNext[1]}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bk-panel">
              <div className="bk-section-eyebrow">Step 3 of 4</div>
              <h2 className="bk-section-title">
                Pick a <em>date & time</em>
              </h2>

              <div className="bk-visit-types" style={{ marginBottom: 28 }}>
                {VISIT_TYPES.map((t) => (
                  <div
                    key={t.name}
                    className={`bk-visit-type ${booking.visitType === t.name ? "selected" : ""}`}
                    onClick={() => set("visitType", t.name)}
                  >
                    <span className="bk-visit-type-icon">{t.icon}</span>
                    <div className="bk-visit-type-name">{t.name}</div>
                    <div className="bk-visit-type-desc">{t.desc}</div>
                  </div>
                ))}
              </div>

              <Calendar
                selected={booking.date}
                onSelect={(d) => {
                  set("date", d);
                  set("time", "");
                }}
              />

              {booking.date && (
                <>
                  <div className="bk-slots-title">Available Times</div>
                  <div className="bk-slots-grid">
                    {TIMES.map((t) => (
                      <div
                        key={t}
                        className={`bk-slot ${UNAVAIL.includes(t) ? "unavailable" : ""} ${booking.time === t ? "selected" : ""}`}
                        onClick={() => !UNAVAIL.includes(t) && set("time", t)}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="bk-nav-btns">
                <button className="bk-btn-back" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  className="bk-btn-next"
                  disabled={!canNext[2]}
                  onClick={() => setStep(3)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bk-panel">
              <div className="bk-section-eyebrow">Step 4 of 4</div>
              <h2 className="bk-section-title">
                Your <em>details</em>
              </h2>

              <div className="bk-form-grid" style={{ marginBottom: 16 }}>
                <div className="bk-field">
                  <label>First Name *</label>
                  <input
                    placeholder="Jane"
                    value={booking.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                </div>
                <div className="bk-field">
                  <label>Last Name *</label>
                  <input
                    placeholder="Doe"
                    value={booking.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                </div>
                <div className="bk-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={booking.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="bk-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={booking.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div className="bk-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={booking.dob}
                    onChange={(e) => set("dob", e.target.value)}
                  />
                </div>
                <div className="bk-field">
                  <label>Insurance / Policy No.</label>
                  <input
                    placeholder="Optional"
                    value={booking.insurance}
                    onChange={(e) => set("insurance", e.target.value)}
                  />
                </div>
                <div className="bk-field full" style={{ gridColumn: "1 / -1" }}>
                  <label>Reason for visit / Notes</label>
                  <textarea
                    placeholder="Describe your symptoms, previous diagnoses, or anything you'd like the doctor to know…"
                    value={booking.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>
              </div>

              <div className="bk-nav-btns">
                <button className="bk-btn-back" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button
                  className="bk-btn-submit"
                  disabled={!canNext[3]}
                  onClick={handleSubmit}
                >
                  Confirm Appointment ✓
                </button>
              </div>
            </div>
          )}
        </div>

        <SummaryPanel step={step} booking={booking} />
      </div>
    </>
  );
}
