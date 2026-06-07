import { useState, useMemo, useEffect } from "react";
import "../styles/BookAppointment.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SPECIALTIES = [
  { icon: "❤️", name: "Cardiologie", doctors: 1, price: 200 },
  { icon: "🧠", name: "Neurologie", doctors: 1, price: 170 },
  { icon: "👁️", name: "Oftalmologie", doctors: 1, price: 150 },
  { icon: "🌿", name: "Dermatologie", doctors: 1, price: 170 },
];

const VISIT_TYPES = [
  { icon: "🏥", name: "In-Person", desc: "Visit the clinic" },
  { icon: "💻", name: "Telehealth", desc: "Video consultation" },
];

const TIMES = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TODAY = new Date();

function Calendar({ selected, onSelect }) {
  const [view, setView] = useState({ year: TODAY.getFullYear(), month: TODAY.getMonth() });
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const last = new Date(view.year, view.month + 1, 0);
    const blanks = Array(first.getDay()).fill(null);
    const days = Array.from({ length: last.getDate() }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [view]);

  const prev = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const next = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  const isToday = (d) => d === TODAY.getDate() && view.month === TODAY.getMonth() && view.year === TODAY.getFullYear();
  const isPast = (d) => new Date(view.year, view.month, d) < new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const dateKey = (d) => `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="bk-calendar-wrap">
      <div className="bk-cal-header">
        <button className="bk-cal-nav" onClick={prev}>‹</button>
        <span className="bk-cal-month">{MONTHS[view.month]} {view.year}</span>
        <button className="bk-cal-nav" onClick={next}>›</button>
      </div>
      <div className="bk-cal-grid">
        <div className="bk-cal-days-header">{DAYS.map(d => <div key={d} className="bk-cal-day-name">{d}</div>)}</div>
        <div className="bk-cal-days">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="bk-cal-day empty" />;
            const past = isPast(d);
            const sel = selected === dateKey(d);
            return (
              <div key={i} className={`bk-cal-day ${past ? "past" : ""} ${isToday(d) ? "today" : ""} ${sel ? "selected" : ""}`} onClick={() => !past && onSelect(dateKey(d))}>
                {d}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({ booking }) {
  const spec = SPECIALTIES.find(s => s.name === booking.specialty);
  const fmtDate = (d) => {
    if (!d) return null;
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" });
  };
  return (
    <aside className="bk-right">
      <div className="bk-summary-title">Rezumatul rezervării</div>
      <div className="bk-summary-section">
        <div className="bk-summary-label">Specialitate</div>
        {booking.specialty ? <div className="bk-summary-val big">{spec?.icon} {booking.specialty}</div> : <div className="bk-summary-placeholder">Nu e selectat încă</div>}
      </div>
      <div className="bk-summary-section">
        <div className="bk-summary-label">Doctor</div>
        {booking.doctor ? (
          <div className="bk-summary-doc-card">
            <div className="bk-summary-doc-avatar">{booking.doctor.User.firstName[0]}{booking.doctor.User.lastName[0]}</div>
            <div>
              <div className="bk-summary-doc-name">Dr. {booking.doctor.User.firstName} {booking.doctor.User.lastName}</div>
              <div className="bk-summary-doc-spec">{booking.specialty}</div>
            </div>
          </div>
        ) : <div className="bk-summary-placeholder">Nu e selectat încă</div>}
      </div>
      <div className="bk-summary-section">
        <div className="bk-summary-label">Date & Time</div>
        {booking.date && booking.time ? <div className="bk-summary-val">{fmtDate(booking.date)}<br />{booking.time} · {booking.visitType}</div> : booking.date ? <div className="bk-summary-val">{fmtDate(booking.date)}<br /><span style={{ color: "rgba(255,255,255,0.3)" }}>Ora nu e selectată</span></div> : <div className="bk-summary-placeholder">Nu e selectat încă</div>}
      </div>
      <div className="bk-summary-divider" />
      <div className="bk-summary-total">
        <div className="bk-summary-total-label">Cost consultație</div>
        <div className="bk-summary-total-price">{spec ? `${spec.price} Lei` : "—"}</div>
        <div className="bk-summary-total-note">Plata colectată la clinică.</div>
      </div>
    </aside>
  );
}

const STEPS = ["Specialitate", "Doctor", "Dată & oră", "Detalii"];

export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [busySlots, setBusySlots] = useState([]);
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [booking, setBooking] = useState({
    specialty: "",
    doctor: null,
    date: "",
    time: "",
    visitType: "In-Person",
    notes: ""
  });

  useEffect(() => {
    axios.get("http://localhost:5000/doctors").then(res => setDoctors(res.data));
  }, []);

  useEffect(() => {
    if (booking.doctor && booking.date) {
      axios.get(`http://localhost:5000/appointments/busy-slots?id_medic=${booking.doctor.id}&date=${booking.date}`)
        .then(res => setBusySlots(res.data));
      
      axios.get(`http://localhost:5000/appointments/recommend-slots?id_medic=${booking.doctor.id}&date=${booking.date}`)
        .then(res => setRecommendedSlots(res.data));
    }
  }, [booking.doctor, booking.date]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => d.specializare === booking.specialty);
  }, [doctors, booking.specialty]);

  const set = (key, val) => setBooking(b => ({ ...b, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/appointments/book", {
        id_medic: booking.doctor.id,
        specializare: booking.specialty,
        tip_vizita: booking.visitType,
        data_programare: booking.date,
        ora_programare: booking.time,
        notes: booking.notes
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error booking appointment");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="bk-success">
      <div className="bk-success-card">
        <div className="bk-success-ring">✓</div>
        <h2 className="bk-success-title">Programare <em>confirmată!</em></h2>
        <p className="bk-success-sub">Rezervarea dvs. a fost salvată în sistem.</p>
        <div className="bk-success-btns">
          <button className="bk-success-btn-primary" onClick={() => navigate("/my-appointments")}>Vezi programările mele</button>
          <button className="bk-success-btn-ghost" onClick={() => navigate("/")}>Acasă</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="bk-nav">
        <a href="/" className="bk-nav-logo">
          <div className="bk-logo-mark">V</div>
          <span className="bk-logo-text">Vita<span>Med</span></span>
        </a>
      </nav>
      <div className="bk-page">
        <div className="bk-left">
          <div className="bk-stepper">
            {STEPS.map((label, i) => (
              <div key={label} className={`bk-step ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}>
                <div className="bk-step-circle">{i < step ? "✓" : i + 1}</div>
                <div className="bk-step-label">{label}</div>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="bk-panel">
              <h2 className="bk-section-title">Alege o <em>specialitate</em></h2>
              <div className="bk-specialty-grid">
                {SPECIALTIES.map(s => (
                  <div key={s.name} className={`bk-specialty-card ${booking.specialty === s.name ? "selected" : ""}`} onClick={() => { set("specialty", s.name); set("doctor", null); }}>
                    <span className="bk-spec-icon">{s.icon}</span>
                    <div className="bk-spec-name">{s.name}</div>
                    <div className="bk-spec-count">{s.price} Lei</div>
                  </div>
                ))}
              </div>
              <div className="bk-nav-btns"><button className="bk-btn-next" disabled={!booking.specialty} onClick={() => setStep(1)}>Continuă →</button></div>
            </div>
          )}

          {step === 1 && (
            <div className="bk-panel">
              <h2 className="bk-section-title">Selectează un <em>doctor</em></h2>
              <div className="bk-doctor-list">
                {filteredDoctors.map(d => (
                  <div key={d.id} className={`bk-doctor-card ${booking.doctor?.id === d.id ? "selected" : ""}`} onClick={() => set("doctor", d)}>
                    <div className="bk-doc-avatar">{d.User.firstName[0]}{d.User.lastName[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="bk-doc-name">Dr. {d.User.firstName} {d.User.lastName}</div>
                      <div className="bk-doc-spec">{booking.specialty}</div>
                    </div>
                    <div className="bk-check">✓</div>
                  </div>
                ))}
              </div>
              <div className="bk-nav-btns">
                <button className="bk-btn-back" onClick={() => setStep(0)}>← Înapoi</button>
                <button className="bk-btn-next" disabled={!booking.doctor} onClick={() => setStep(2)}>Continuă →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bk-panel">
              <h2 className="bk-section-title">Selectează o <em>dată & oră</em></h2>
              <div className="bk-visit-types" style={{ marginBottom: 28 }}>
                {VISIT_TYPES.map(t => (
                  <div key={t.name} className={`bk-visit-type ${booking.visitType === t.name ? "selected" : ""}`} onClick={() => set("visitType", t.name)}>
                    <span className="bk-visit-type-icon">{t.icon}</span>
                    <div className="bk-visit-type-name">{t.name}</div>
                  </div>
                ))}
              </div>
              <Calendar selected={booking.date} onSelect={d => { set("date", d); set("time", ""); }} />
              {booking.date && (
                <>
                  <div className="bk-slots-grid" style={{ marginTop: 20 }}>
                    {TIMES.map(t => {
                      const isBusy = busySlots.includes(t);
                      const isRecommended = recommendedSlots.includes(t);
                      return (
                        <div key={t} className={`bk-slot ${isBusy ? "unavailable" : ""} ${isRecommended ? "recom" : ""} ${booking.time === t ? "selected" : ""}`} onClick={() => !isBusy && set("time", t)}>
                          {isRecommended && <span className="bk-recom-icon">⭐</span>}
                          {t}
                        </div>
                      );
                    })}
                  </div>
                  {recommendedSlots.length > 0 && (
                    <p className="bk-recom-hint">Orele marcate cu ⭐ sunt recomandate pentru o programare mai rapidă și echilibrarea încărcării medicului.</p>
                  )}
                </>
              )}
              <div className="bk-nav-btns">
                <button className="bk-btn-back" onClick={() => setStep(1)}>← Înapoi</button>
                <button className="bk-btn-next" disabled={!booking.date || !booking.time} onClick={() => setStep(3)}>Continuă →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bk-panel">
              <h2 className="bk-section-title">Detalii <em>suplimentare</em></h2>
              <div className="bk-field full">
                <label>Note (opțional)</label>
                <textarea placeholder="Descrieți simptomele sau orice detalii pe care doriți să le știe medicul..." value={booking.notes} onChange={e => set("notes", e.target.value)} />
              </div>
              <div className="bk-nav-btns">
                <button className="bk-btn-back" onClick={() => setStep(2)}>← Înapoi</button>
                <button className="bk-btn-submit" disabled={loading} onClick={handleSubmit}>{loading ? "Se trimite..." : "Confirmă programarea ✓"}</button>
              </div>
            </div>
          )}
        </div>
        <SummaryPanel booking={booking} />
      </div>
    </>
  );
}
