import { useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router";

const services = [
  {
    icon: "❤️",
    name: "Cardiologie",
    desc: "Îngrijire cardiacă completă, de la prevenție la proceduri intervenționale avansate și reabilitare cardiacă",
  },
  {
    icon: "🧠",
    name: "Neurologie",
    desc: "Diagnostic și tratament specializat al tulburărilor neurologice, programe de sănătate a creierului și bunăstare cognitivă.",
  },
  {
    icon: "👁️",
    name: "Oftalmologie",
    desc: "Diagnostic vizual avansat și excelență chirurgicală, protejând și restabilind vederea la orice vârstă.",
  },
  {
    icon: "🌿",
    name: "Dermatologie",
    desc: "Îngrijire medicală și cosmetică a pielii, abordând afecțiuni de la acnee la tulburări inflamatorii complexe.",
  },
];

const doctors = [
  {
    name: "Dr. Popescu Mihai",
    title: "Medic cardiolog",
    rating: "4.9",
    reviews: "312",
    initials: "PM",
  },
  {
    name: "Dr. Stoica Sebastian",
    title: "Medic neurolog",
    rating: "4.8",
    reviews: "274",
    initials: "SS",
  },
  {
    name: "Dr. Marinescu Ioana",
    title: "Medic dermatolog",
    rating: "5.0",
    reviews: "198",
    initials: "MI",
  },
  {
    name: "Dr. Dumitrescu Andreea",
    title: "Medic oftalmolog",
    rating: "4.7",
    reviews: "421",
    initials: "DA",
  },
];

const marqueeItems = [
  "Consultare generală",
  "Referire de specialitate",
  "Imagistică medicală",
  "Servicii de laborator",
  "Îngrijire preventivă",
  "Evaluări de sănătate",
];

const whyFeatures = [
  {
    icon: "🏆",
    title: "Specialiști certificați",
    text: "Fiecare medic deține acreditări de elită și participă la educație medicală continuă.",
  },
  {
    icon: "⚡",
    title: "Programări în aceeași zi",
    text: "Consultații urgente disponibile în câteva ore, nu în zile. Sănătatea ta nu poate aștepta.",
  },
  {
    icon: "🔒",
    title: "Privat și confidențial",
    text: "Sisteme conforme cu HIPAA și protocoale stricte de confidențialitate pentru fiecare interacțiune cu pacienții.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    specialty: "",
    date: "",
    time: "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.specialty && form.date)
      setSubmitted(true);
  };

  return (
    <>
      <nav className="nav">
        <a href="#" className="nav-logo">
          <div className="nav-logo-mark">V</div>
          <span className="nav-logo-text">
            Vita<span>Med</span>
          </span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#services">Servicii</a>
          </li>
          <li>
            <a href="#doctors">Doctorii noștri</a>
          </li>
          <li>
            <a href="#about">Despre noi</a>
          </li>
          <li>
            <Link to="/bookAppointment">Programează-te</Link>
          </li>
          <li>
            <Link to="/manageAppointments">Afișează programările</Link>
          </li>
        </ul>
        <button
          className="nav-cta"
          onClick={() =>
            document
              .getElementById("booking")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Programează o consultație
        </button>
      </nav>

      <section className="hero">
        <div className="hero-grain" />

        <div className="hero-left">
          <p className="hero-eyebrow">Clinică medicală privată · Est. 2009</p>
          <h1 className="hero-heading">
            Medicină cu
            <em>precizie &amp; grijă.</em>
          </h1>
          <p className="hero-sub">
            VitaMed reunește cei mai buni specialiști sub un singur acoperiș —
            oferind diagnostice, tratament și îngrijire preventivă de clasă
            mondială adaptate nevoilor dumneavoastră.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() =>
                document
                  .getElementById("booking")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Rezervă o consultație
            </button>
            <button
              className="btn-ghost"
              onClick={() =>
                document
                  .getElementById("services")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Explorează serviciile
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <div className="stat-num">
                18<span>k+</span>
              </div>
              <div className="stat-label">Pacienți tratați</div>
            </div>
            <div>
              <div className="stat-num">
                42<span>+</span>
              </div>
              <div className="stat-label">Specialiști</div>
            </div>
            <div>
              <div className="stat-num">
                15<span>ani</span>
              </div>
              <div className="stat-label">De Excelență</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-wrap">
            <div className="hero-image-card">
              <div className="hero-image-inner">
                <div className="doctor-silhouette" />
              </div>
              <div className="hero-image-placeholder" />
            </div>

            <div className="hero-badge">
              <div className="hero-badge-label">Timp mediu de așteptare</div>
              <div className="hero-badge-val">
                12 <span>min</span>
              </div>
            </div>

            <div className="hero-cert">
              <div className="hero-cert-label">Acreditare</div>
              <div className="hero-cert-val">JCI Certificat de aur ✓</div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-bar">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="marquee-item">
              {item} <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      <section className="services" id="services">
        <div className="section-header">
          <div className="section-tag">Ce oferim</div>
          <h2 className="section-title">
            Excelență clinică
            <br />
            în fiecare <em>specialitate</em>
          </h2>
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.name}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <p className="service-desc">{s.desc}</p>
              <a href="#booking" className="service-link">
                Află mai multe
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="why" id="about">
        <div className="why-left">
          <div className="section-tag">De ce VitaMed</div>
          <h2 className="section-title">
            Un nou standard pentru
            <br />
            medicina <em>privată</em>
          </h2>
          <p className="why-sub">
            Credem că medicina excepțională este inseparabilă de o experiență
            excepțională. Fiecare detaliu — de la prima până la ultima
            consultație — este conceput în jurul dumneavoastră.
          </p>
          <div className="why-features">
            {whyFeatures.map((f) => (
              <div className="why-feature" key={f.title}>
                <div className="why-feature-icon">{f.icon}</div>
                <div>
                  <div className="why-feature-title">{f.title}</div>
                  <div className="why-feature-text">{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="why-right">
          <div className="why-card-main">
            <div className="quote-mark">"</div>
            <p className="quote-text">
              VitaMed a schimbat complet modul în care am experimentat
              îngrijirea medicală. De la ușurința programării până la atenția
              incredibilă a detaliilor, totul a fost de neegalat. Mă simt cu
              adevărat îngrijită și în siguranță aici.
            </p>
            <div className="quote-author">
              <div className="quote-avatar">M</div>
              <div>
                <div className="quote-name">Maria L.</div>
                <div className="quote-role">Pacient din 2021</div>
              </div>
            </div>
            <div className="rating-pills">
              <span className="pill active">★ 4.9 Rating</span>
              <span className="pill">1,200+ Review-uri</span>
              <span className="pill">98% Recomandări</span>
            </div>
          </div>
        </div>
      </section>

      <section className="doctors" id="doctors">
        <div className="doctors-header">
          <div>
            <div className="section-tag">Echipa noastră</div>
            <h2 className="section-title">
              Întâlnește-i pe <em>specialiști</em>
            </h2>
          </div>
          <button
            className="btn-ghost"
            style={{ color: "var(--navy)", borderColor: "rgba(11,30,61,0.2)" }}
          >
            Vezi toți doctorii
          </button>
        </div>

        <div className="doctors-grid">
          {doctors.map((d) => (
            <div className="doctor-card" key={d.name}>
              <div className="doctor-img">
                <div className="doctor-avatar-lg">👨‍⚕️</div>
                <span className="doctor-specialty-tag">
                  {d.title.split(" ").slice(-1)}
                </span>
              </div>
              <div className="doctor-info">
                <div className="doctor-name">{d.name}</div>
                <div className="doctor-title">{d.title}</div>
                <div className="doctor-rating">
                  <span className="stars">★★★★★</span>
                  &nbsp;{d.rating} &nbsp;·&nbsp; {d.reviews} reviews
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="booking" id="booking">
        <div className="booking-left">
          <div className="section-tag">Rezervări</div>
          <h2 className="section-title">
            Rezervă-ți
            <br />
            consultația <em>astăzi</em>
          </h2>
          <p>
            Programați o consultație cu oricare dintre specialiștii noștri. Vom
            confirma rezervarea dumneavoastră în decurs de o oră și vă vom
            trimite toate detaliile de care aveți nevoie.
          </p>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {[
              "📍  Aleea Cămpul cu flori, nr.14, București",
              "📞 +40 734 832 256",
              "🕐  Luni–Vineri 8:00 – 20:00, Sâmbătă 9:00 – 14:00",
            ].map((item) => (
              <span key={item} style={{ fontSize: 14, color: "var(--muted)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <form className="booking-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 26,
                    color: "var(--navy)",
                    marginBottom: 10,
                  }}
                >
                  Appointment Requested
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  Thank you, {form.name}. We'll confirm your slot by email
                  within the hour.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 28 }}
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: "",
                      phone: "",
                      email: "",
                      specialty: "",
                      date: "",
                      time: "",
                      note: "",
                    });
                  }}
                >
                  Book Another
                </button>
              </div>
            ) : (
              <>
                <div className="form-title">Request an Appointment</div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Full Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Specialty *</label>
                  <select
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a department</option>
                    {services.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Preferred Date *</label>
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Preferred Time</label>
                    <select
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                    >
                      <option value="">Any time</option>
                      {[
                        "8:00 AM",
                        "9:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "1:00 PM",
                        "2:00 PM",
                        "3:00 PM",
                        "4:00 PM",
                        "5:00 PM",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Notes (optional)</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Symptoms, previous diagnoses, or any other details…"
                  />
                </div>

                <button type="submit" className="form-submit">
                  Confirm Reservation
                </button>
              </>
            )}
          </form>
        </div>
        <button
          className="reservation-button"
          onClick={() => navigate("/login")}
        >
          Programează o consultație
        </button>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-top">
          <div>
            <a href="#" className="nav-logo">
              <div className="nav-logo-mark">V</div>
              <span className="nav-logo-text">
                Vita<span>Med</span>
              </span>
            </a>
            <p className="footer-brand-text">
              O clinică privată de primă clasă dedicată medicinei excepționale,
              furnizată cu empatie și precizie din 2009.
            </p>
          </div>
          <div className="footer-col">
            <h4>Servicii</h4>
            <ul>
              {services.slice(0, 4).map((s) => (
                <li key={s.name}>
                  <a href="#services">{s.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Clinic</h4>
            <ul>
              {["About Us", "Our Doctors", "Research", "Careers", "Press"].map(
                (l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="footer-col footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>📍 Aleea Cămpul cu flori, nr.14, București</li>
              <li>+40 721 498 305</li>
              <li style={{ marginTop: 8, color: "var(--gold)", fontSize: 12 }}>
                Luni–Vineri 8:00–20:00
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © 2025 VitaMed. All rights reserved.
          </span>
          <div className="footer-socials">
            {["𝕏", "in", "f", "ig"].map((s) => (
              <a key={s} href="#" className="footer-social">
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
