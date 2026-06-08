import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from "recharts";
import "../styles/AdminPage.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const ROOMS = [
  "Suite 1A",
  "Suite 2D",
  "Suite 3B",
  "Suite 4B",
  "Suite 5C",
  "Suite 6A",
];
const TYPES = [
  "Consultație",
  "Control",
  "Urgență",
];
const STATUSES = ["Programată", "Anulată", "Finalizată"];
const FILTERS = ["all", "Programată", "Anulată", "Finalizată"];
const PAGE_SIZE = 8;

const NAV_ITEMS = [
  { icon: "🏠", label: "Tablou de bord", badge: null },
  { icon: "📋", label: "Programări", badge: null, active: true },
  { icon: "👥", label: "Pacienți", badge: null },
  { icon: "👨‍⚕️", label: "Medici", badge: null },
];

const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return d;
  }
};

function Toast({ msg, icon, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="ad-toast">
      <span className={`ad-toast-icon ${icon}`}>
        {icon === "ok" ? "✅" : icon === "del" ? "🗑️" : "✏️"}
      </span>
      {msg}
    </div>
  );
}

function DeleteModal({ target, onConfirm, onCancel }) {
  const names = Array.isArray(target) ? (
    `${target.length} programări`
  ) : (
    <>
      <span className="ad-modal-name">{target.patient.name}</span> pe data de{" "}
      {fmtDate(target.date)} la {target.time}
    </>
  );
  return (
    <div className="ad-modal-overlay" onClick={onCancel}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-icon">🗑️</div>
        <div className="ad-modal-title">
          {Array.isArray(target) ? "Ștergere multiplă" : "Șterge programarea"}
        </div>
        <p className="ad-modal-sub">
          Sigur doriți să ștergeți {names}? Această acțiune este permanentă.
        </p>
        <div className="ad-modal-btns">
          <button className="ad-mc" onClick={onCancel}>
            Anulează
          </button>
          <button className="ad-mok" onClick={onConfirm}>
            Șterge
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDrawer({ appt, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    date: appt.date,
    time: appt.time,
    status: appt.status,
    note: appt.note || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="ad-overlay" onClick={onClose} />
      <aside className="ad-drawer">
        <div className="ad-drawer-head">
          <div>
            <div className="ad-drawer-title">Gestionează Programarea</div>
            <div className="ad-drawer-sub">ID: #{appt.id}</div>
          </div>
          <button className="ad-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ad-drawer-body">
          <div className="ad-ds">
            <div className="ad-ds-title">Pacient</div>
            <div className="ad-pat-info-card">
              <div
                className="ad-pat-info-av"
                style={{ background: appt.patient.color }}
              >
                {appt.patient.initials}
              </div>
              <div>
                <div className="ad-pat-info-name">{appt.patient.name}</div>
                <div className="ad-pat-info-email">{appt.patient.email}</div>
              </div>
            </div>
          </div>

          <div className="ad-ds">
            <div className="ad-ds-title">Status Programare</div>
            <div className="ad-form-row">
              <div className="ad-field">
                <label>Status</label>
                <select
                  className="ad-input"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ad-form-row full">
              <div className="ad-field">
                <label>Note Administrative</label>
                <textarea
                  className="ad-input ad-textarea"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Note interne despre această programare..."
                />
              </div>
            </div>
          </div>
          
          <div className="ad-ds">
            <div className="ad-ds-title">Detalii (Citire)</div>
            <div className="ad-form-row">
              <div className="ad-field">
                <label>Medic</label>
                <input className="ad-input" value={appt.doctor.name} readOnly />
              </div>
              <div className="ad-field">
                <label>Data/Ora</label>
                <input className="ad-input" value={`${fmtDate(appt.date)} - ${appt.time}`} readOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="ad-drawer-foot">
          <button className="ad-df-btn save" onClick={() => onSave(form)}>
            Actualizează Status
          </button>
          <button className="ad-df-btn cancel" onClick={onClose}>
            Închide
          </button>
          <button className="ad-df-btn del" onClick={onDelete}>
            Șterge
          </button>
        </div>
      </aside>
    </>
  );
}

function SortIcon({ col, sort }) {
  if (sort.col !== col) return <span className="ad-sort-icon">↕</span>;
  return <span className="ad-sort-icon">{sort.dir === "asc" ? "↑" : "↓"}</span>;
}

function DashboardView({ stats, predictions }) {
  if (!stats) return <div className="ad-empty">Se încarcă statisticile...</div>;

  const statusData = stats.byStatus.map(s => ({ name: s.status, value: parseInt(s.count) }));
  const specData = stats.bySpecialty.map(s => ({ name: s.specializare, value: parseInt(s.count) }));
  const hourData = stats.byHour.map(h => ({ hour: h.ora_programare, count: parseInt(h.count) }));
  const predictionData = predictions?.next7Days.map(p => ({ day: p.dayName, predicted: p.predictedCount })) || [];

  return (
    <div className="ad-dashboard-grid">
      <div className="ad-dash-card full">
        <div className="ad-dash-card-title">Previziuni Volum Programări (Săptămâna Viitoare)</div>
        <div className="ad-dash-card-sub">Bazat pe media istorică: {predictions?.dailyAverage} programări/zi</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1d21', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="predicted" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Nr. Estimat" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ad-dash-card">
        <div className="ad-dash-card-title">Distribuție Specializări</div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={specData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {specData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ad-dash-card">
        <div className="ad-dash-card-title">Status Programări</div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ad-dash-card full">
        <div className="ad-dash-card-title">Activitate pe Ore (Istoric)</div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1d21', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Total Programări" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function AdminAppointments() {
  const [activeTab, setActiveTab] = useState("Programări");
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "date", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set()); 
  const [editing, setEditing] = useState(null); 
  const [delTarget, setDelTarget] = useState(null); 
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchAppts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/appointments/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mapped = res.data.map(a => ({
        id: a.id,
        patient: {
          name: `${a.Pacient?.User?.firstName} ${a.Pacient?.User?.lastName}`,
          email: a.Pacient?.User?.email,
          initials: (a.Pacient?.User?.firstName?.[0] || "") + (a.Pacient?.User?.lastName?.[0] || ""),
          color: "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
        },
        doctor: { 
          name: `Dr. ${a.Medic?.User?.firstName} ${a.Medic?.User?.lastName}`,
          spec: a.specializare 
        },
        date: a.data_programare,
        time: a.ora_programare,
        type: a.tip_vizita,
        status: a.status,
        note: a.notes,
      }));
      
      setAppts(mapped);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [sRes, pRes] = await Promise.all([
        axios.get("http://localhost:5000/stats/global", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/stats/predictions", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(sRes.data);
      setPredictions(pRes.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAppts();
    fetchStats();
  }, [fetchAppts, fetchStats]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const counts = useMemo(() => {
    const c = { all: appts.length };
    appts.forEach((a) => {
      c[a.status] = (c[a.status] || 0) + 1;
    });
    return c;
  }, [appts]);

  const processed = useMemo(() => {
    let list = [...appts];
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(q) ||
          a.doctor.name.toLowerCase().includes(q) ||
          a.doctor.spec.toLowerCase().includes(q) ||
          a.id.toString().includes(q) ||
          a.type.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      let va, vb;
      switch (sort.col) {
        case "date":
          va = new Date(a.date + " " + a.time);
          vb = new Date(b.date + " " + b.time);
          break;
        case "patient":
          va = a.patient.name;
          vb = b.patient.name;
          break;
        case "doctor":
          va = a.doctor.name;
          vb = b.doctor.name;
          break;
        case "status":
          va = a.status;
          vb = b.status;
          break;
        default:
          va = a.id;
          vb = b.id;
      }
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [appts, filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageSlice = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [filter, search, sort]);

  const toggleSort = (col) =>
    setSort((s) =>
      s.col === col
        ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" },
    );

  const allPageSelected =
    pageSlice.length > 0 && pageSlice.every((a) => selected.has(a.id));
  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((s) => {
        const n = new Set(s);
        pageSlice.forEach((a) => n.delete(a.id));
        return n;
      });
    } else {
      setSelected((s) => {
        const n = new Set(s);
        pageSlice.forEach((a) => n.add(a.id));
        return n;
      });
    }
  };
  const toggleOne = useCallback((id) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const saveEdit = async (form) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/appointments/status/${editing.id}`, 
        { status: form.status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAppts((prev) =>
        prev.map((a) => {
          if (a.id !== editing.id) return a;
          return { ...a, status: form.status };
        }),
      );
      setEditing(null);
      setToast({ msg: "Statusul programării a fost actualizat", icon: "edit" });
    } catch (err) {
      console.error(err);
      setToast({ msg: "Eroare la actualizare", icon: "del" });
    }
  };

  const doDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      if (Array.isArray(delTarget)) {
        for (const id of delTarget) {
          await axios.delete(`http://localhost:5000/appointments/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        const ids = new Set(delTarget);
        setAppts((prev) => prev.filter((a) => !ids.has(a.id)));
        setSelected(new Set());
        setToast({
          msg: `${delTarget.length} programări șterse`,
          icon: "del",
        });
      } else {
        await axios.delete(`http://localhost:5000/appointments/admin/${delTarget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppts((prev) => prev.filter((a) => a.id !== delTarget.id));
        setEditing(null);
        setToast({ msg: "Programare ștearsă", icon: "del" });
      }
    } catch (err) {
      console.error(err);
      setToast({ msg: "Eroare la ștergere", icon: "del" });
    }
    setDelTarget(null);
  };

  const bulkStatus = async (status) => {
    const token = localStorage.getItem("token");
    try {
      for (const id of selected) {
        await axios.put(`http://localhost:5000/appointments/status/${id}`, 
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setAppts((prev) =>
        prev.map((a) => (selected.has(a.id) ? { ...a, status } : a)),
      );
      setToast({
        msg: `${selected.size} programări marcate ca ${status}`,
        icon: "edit",
      });
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo">
          <div className="ad-logo-mark">V</div>
          <span className="ad-logo-text">
            Vita<span>Med</span>
          </span>
        </div>
        <nav className="ad-nav">
          <div className="ad-nav-lbl">Meniu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`ad-nav-item ${activeTab === item.label ? "active" : ""}`}
              onClick={() => {
                if (item.label === "Dashboard" || item.label === "Programări") {
                  setActiveTab(item.label);
                }
              }}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="ad-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="ad-nav-lbl">Sistem</div>
          <button className="ad-nav-item" onClick={handleLogout}>
            <span className="ad-nav-icon">🚪</span>Ieșire Cont
          </button>
        </nav>
        <div className="ad-sidebar-user">
          <div className="ad-user-av">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <div className="ad-user-name">{user.firstName} {user.lastName}</div>
            <div className="ad-user-role">Administrator</div>
          </div>
          <div className="ad-user-dot" />
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <div className="ad-topbar-title">{activeTab === "Dashboard" ? "Panou Control & Statistici" : "Gestiune Programări"}</div>
            <div className="ad-topbar-sub">
              {activeTab === "Dashboard" 
                ? "Analiza datelor, previziuni de volum și performanța platformei" 
                : "Vizualizează, editează sau anulează orice programare din sistem"}
            </div>
          </div>
          {activeTab === "Programări" && (
            <div className="ad-topbar-right">
              <div className="ad-search-wrap">
                <span className="ad-search-icon">🔍</span>
                <input
                  className="ad-search"
                  placeholder="Caută pacient, medic, ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="ad-btn ghost" onClick={() => setSearch("")}>
                Resetare
              </button>
            </div>
          )}
        </header>

        <div className="ad-content">
          {activeTab === "Dashboard" ? (
            <DashboardView stats={stats} predictions={predictions} />
          ) : (
            <>
              <div className="ad-stats">
                {[
                  {
                    cls: "s1",
                    icon: "📋",
                    label: "Total",
                    num: counts.all,
                    sub: "toate înregistrările",
                  },
                  // ... rest of stats items
                ].map((s) => (
                  <div key={s.label} className={`ad-stat ${s.cls}`}>
                    <div className="ad-stat-bg">{s.icon}</div>
                    <div className="ad-stat-lbl">{s.label}</div>
                    <div className="ad-stat-num">{s.num}</div>
                    <div className="ad-stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="ad-toolbar">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    className={`ad-filter ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "Toate" : f}
                    <span className="ad-filter-n">{counts[f] || 0}</span>
                  </button>
                ))}
                <div className="ad-toolbar-right">
                  <select
                    className="ad-sort"
                    value={`${sort.col}-${sort.dir}`}
                    onChange={(e) => {
                      const [col, dir] = e.target.value.split("-");
                      setSort({ col, dir });
                    }}
                  >
                    <option value="date-desc">Data: Cele mai noi</option>
                    <option value="date-asc">Data: Cele mai vechi</option>
                    <option value="patient-asc">Pacient A–Z</option>
                    <option value="doctor-asc">Medic A–Z</option>
                    <option value="status-asc">Status A–Z</option>
                  </select>
                </div>
              </div>

              {selected.size > 0 && (
                <div className="ad-bulk-bar">
                  <span className="ad-bulk-count">{selected.size} selectate</span>
                  <div className="ad-bulk-divider" />
                  <button
                    className="ad-bulk-btn"
                    onClick={() => bulkStatus("Finalizată")}
                  >
                    ✓ Finalizează toate
                  </button>
                  <button
                    className="ad-bulk-btn"
                    onClick={() => bulkStatus("Anulată")}
                  >
                    ✕ Anulează toate
                  </button>
                  <button
                    className="ad-bulk-btn red"
                    onClick={() => setDelTarget([...selected])}
                  >
                    🗑 Șterge toate
                  </button>
                  <span
                    className="ad-bulk-clear"
                    onClick={() => setSelected(new Set())}
                  >
                    ✕ Anulează selecția
                  </span>
                </div>
              )}

              <div className="ad-table-wrap">
                <div className="ad-table-head">
                  <div className="ad-th">
                    <input
                      type="checkbox"
                      className="ad-cb"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {[
                    { col: "patient", label: "Pacient" },
                    { col: "doctor", label: "Medic" },
                    { col: "date", label: "Data & Ora" },
                    { col: "type", label: "Tip" },
                    { col: "status", label: "Status" },
                  ].map((h) => (
                    <div
                      key={h.col}
                      className={`ad-th ${sort.col === h.col ? "sorted" : ""}`}
                      onClick={() => toggleSort(h.col)}
                    >
                      {h.label}
                      <SortIcon col={h.col} sort={sort} />
                    </div>
                  ))}
                  <div className="ad-th" style={{ justifyContent: "flex-end" }}>
                    Acțiuni
                  </div>
                </div>

                {loading ? (
                  <div className="ad-empty">Se încarcă datele...</div>
                ) : pageSlice.length === 0 ? (
                  <div className="ad-empty">
                    <div className="ad-empty-icon">📭</div>
                    <div className="ad-empty-title">Nu am găsit programări</div>
                    <div className="ad-empty-sub">
                      Încercați să ajustați căutarea sau filtrele.
                    </div>
                  </div>
                ) : (
                  pageSlice.map((a, i) => (
                    <div
                      key={a.id}
                      className={`ad-row ${i === 0 && page === 1 ? "first-row" : ""} ${selected.has(a.id) ? "selected" : ""} ${a.status === 'Anulată' ? 'cancelled' : ''}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                      onClick={() => setEditing(a)}
                    >
                      <div className="ad-cell" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="ad-cb"
                          checked={selected.has(a.id)}
                          onChange={() => toggleOne(a.id)}
                        />
                      </div>

                      <div className="ad-cell">
                        <div className="ad-pat">
                          <div
                            className="ad-pat-av"
                            style={{ background: a.patient.color }}
                          >
                            {a.patient.initials}
                          </div>
                          <div>
                            <div className="ad-pat-name">{a.patient.name}</div>
                            <div className="ad-pat-email">{a.patient.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="ad-cell">
                        <div className="ad-doc-name">{a.doctor.name}</div>
                        <div className="ad-doc-spec">{a.doctor.spec}</div>
                      </div>

                      <div className="ad-cell">
                        <div className="ad-date-val">{fmtDate(a.date)}</div>
                        <div className="ad-date-time">
                          {a.time}
                        </div>
                      </div>

                      <div className="ad-cell">
                        <span className="ad-type">{a.type}</span>
                      </div>

                      <div className="ad-cell">
                        <span className={`ad-badge ${a.status === 'Programată' ? 'pending' : a.status === 'Finalizată' ? 'accepted' : 'declined'}`}>
                          <span className="ad-dot" />
                          {a.status}
                        </span>
                      </div>

                      <div className="ad-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="ad-row-acts">
                          <button
                            className="ad-ra"
                            title="Editare"
                            onClick={() => setEditing(a)}
                          >
                            ✏️
                          </button>
                          <button
                            className="ad-ra del"
                            title="Ștergere"
                            onClick={() => setDelTarget(a)}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {processed.length > 0 && (
                  <div className="ad-pagination">
                    <span className="ad-page-info">
                      Afișare{" "}
                      {Math.min((page - 1) * PAGE_SIZE + 1, processed.length)}–
                      {Math.min(page * PAGE_SIZE, processed.length)} din{" "}
                      {processed.length} programări
                    </span>
                    <div className="ad-page-btns">
                      <button
                        className="ad-page-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (n) => (
                          <button
                            key={n}
                            className={`ad-page-btn ${page === n ? "active" : ""}`}
                            onClick={() => setPage(n)}
                          >
                            {n}
                          </button>
                        ),
                      )}
                      <button
                        className="ad-page-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {editing && !delTarget && (
        <EditDrawer
          appt={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          onDelete={() => setDelTarget(editing)}
        />
      )}

      {delTarget && (
        <DeleteModal
          target={delTarget}
          onCancel={() => setDelTarget(null)}
          onConfirm={doDelete}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          icon={toast.icon}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
