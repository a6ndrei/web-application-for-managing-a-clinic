import { useState, useMemo, useEffect, useCallback } from "react";
import "../styles/AdminAppointments.css";

const SEED = [
  {
    id: "APT-1001",
    patient: {
      name: "Margaret Liu",
      email: "m.liu@email.com",
      initials: "ML",
      color: "#D9C49A",
    },
    doctor: { name: "Dr. Elena Marchetti", spec: "Cardiology" },
    date: "2026-05-18",
    time: "10:00 AM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 3B",
    note: "Chest tightness, EKG review needed.",
  },
  {
    id: "APT-1002",
    patient: {
      name: "Thomas Bauer",
      email: "t.bauer@email.com",
      initials: "TB",
      color: "#A8C4D9",
    },
    doctor: { name: "Dr. James Okafor", spec: "Neurology" },
    date: "2026-05-18",
    time: "11:30 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "accepted",
    room: "Suite 1A",
    note: "Post-MRI, discuss April scan findings.",
  },
  {
    id: "APT-1003",
    patient: {
      name: "Isabelle Fontaine",
      email: "i.fontaine@email.com",
      initials: "IF",
      color: "#D4A8C7",
    },
    doctor: { name: "Dr. Sophia Reyes", spec: "Orthopedics" },
    date: "2026-05-19",
    time: "2:00 PM",
    duration: "60 min",
    type: "Consultation",
    status: "accepted",
    room: "Suite 5C",
    note: "Knee replacement pre-op assessment.",
  },
  {
    id: "APT-1004",
    patient: {
      name: "David Osei",
      email: "d.osei@email.com",
      initials: "DO",
      color: "#A8D4B8",
    },
    doctor: { name: "Dr. Alan Voss", spec: "Int. Medicine" },
    date: "2026-05-19",
    time: "9:00 AM",
    duration: "45 min",
    type: "Annual Check-up",
    status: "accepted",
    room: "Suite 2D",
    note: "Routine annual exam, blood panel ordered.",
  },
  {
    id: "APT-1005",
    patient: {
      name: "Priya Nair",
      email: "p.nair@email.com",
      initials: "PN",
      color: "#F0C8A0",
    },
    doctor: { name: "Dr. Elena Marchetti", spec: "Cardiology" },
    date: "2026-05-20",
    time: "3:30 PM",
    duration: "45 min",
    type: "Consultation",
    status: "declined",
    room: "Suite 3B",
    note: "Rescheduling requested for May 25.",
  },
  {
    id: "APT-1006",
    patient: {
      name: "Carlos Mendez",
      email: "c.mendez@email.com",
      initials: "CM",
      color: "#C8B4E8",
    },
    doctor: { name: "Dr. James Okafor", spec: "Neurology" },
    date: "2026-05-20",
    time: "10:30 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "pending",
    room: "Suite 1A",
    note: "Insurance pre-auth pending.",
  },
  {
    id: "APT-1007",
    patient: {
      name: "Saoirse Kelly",
      email: "s.kelly@email.com",
      initials: "SK",
      color: "#F0D4A8",
    },
    doctor: { name: "Dr. Sophia Reyes", spec: "Orthopedics" },
    date: "2026-05-21",
    time: "1:00 PM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 5C",
    note: "New patient referral. L4-L5 disc involvement.",
  },
  {
    id: "APT-1008",
    patient: {
      name: "Wei Zhang",
      email: "w.zhang@email.com",
      initials: "WZ",
      color: "#A8D4D0",
    },
    doctor: { name: "Dr. Alan Voss", spec: "Int. Medicine" },
    date: "2026-05-22",
    time: "8:00 AM",
    duration: "20 min",
    type: "Lab Review",
    status: "accepted",
    room: "Suite 2D",
    note: "Q2 blood panel and thyroid review.",
  },
  {
    id: "APT-1009",
    patient: {
      name: "Nadia Petrov",
      email: "n.petrov@email.com",
      initials: "NP",
      color: "#EAD4A8",
    },
    doctor: { name: "Dr. Claire Dupont", spec: "Ophthalmology" },
    date: "2026-05-22",
    time: "4:00 PM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 6A",
    note: "Vision decline, possible early glaucoma.",
  },
  {
    id: "APT-1010",
    patient: {
      name: "Luca Ferretti",
      email: "l.ferretti@email.com",
      initials: "LF",
      color: "#C8D4E8",
    },
    doctor: { name: "Dr. Nadia Petrov", spec: "Dermatology" },
    date: "2026-05-23",
    time: "11:00 AM",
    duration: "30 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 4B",
    note: "Persistent forearm rash, possible psoriasis.",
  },
  {
    id: "APT-1011",
    patient: {
      name: "Amara Okonkwo",
      email: "a.okonkwo@email.com",
      initials: "AO",
      color: "#B8D4C8",
    },
    doctor: { name: "Dr. Yuki Tanaka", spec: "Int. Medicine" },
    date: "2026-05-23",
    time: "9:30 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "accepted",
    room: "Suite 2D",
    note: "Hypertension management, medication review.",
  },
  {
    id: "APT-1012",
    patient: {
      name: "François Dubois",
      email: "f.dubois@email.com",
      initials: "FD",
      color: "#D4C8E8",
    },
    doctor: { name: "Dr. Lena Hoffmann", spec: "Neurology" },
    date: "2026-05-24",
    time: "10:00 AM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 1A",
    note: "Recurring migraines, trigger assessment.",
  },
  {
    id: "APT-1013",
    patient: {
      name: "Yuki Nakamura",
      email: "y.nakamura@email.com",
      initials: "YN",
      color: "#E8D4C8",
    },
    doctor: { name: "Dr. Sophia Reyes", spec: "Orthopedics" },
    date: "2026-05-24",
    time: "2:30 PM",
    duration: "60 min",
    type: "Procedure",
    status: "accepted",
    room: "Suite 5C",
    note: "Cortisone injection, right shoulder.",
  },
  {
    id: "APT-1014",
    patient: {
      name: "Elena Rossi",
      email: "e.rossi@email.com",
      initials: "ER",
      color: "#C8E8D4",
    },
    doctor: { name: "Dr. Elena Marchetti", spec: "Cardiology" },
    date: "2026-05-25",
    time: "8:30 AM",
    duration: "30 min",
    type: "Results Review",
    status: "declined",
    room: "Suite 3B",
    note: "Stress test results review, rescheduled.",
  },
  {
    id: "APT-1015",
    patient: {
      name: "Omar Hassan",
      email: "o.hassan@email.com",
      initials: "OH",
      color: "#E8C8D4",
    },
    doctor: { name: "Dr. Marcus Webb", spec: "Orthopedics" },
    date: "2026-05-25",
    time: "11:30 AM",
    duration: "45 min",
    type: "Consultation",
    status: "pending",
    room: "Suite 5C",
    note: "Chronic knee pain, MRI referral requested.",
  },
];

const DOCTORS = [
  "Dr. Elena Marchetti",
  "Dr. James Okafor",
  "Dr. Sophia Reyes",
  "Dr. Alan Voss",
  "Dr. Claire Dupont",
  "Dr. Nadia Petrov",
  "Dr. Yuki Tanaka",
  "Dr. Lena Hoffmann",
  "Dr. Marcus Webb",
];
const ROOMS = [
  "Suite 1A",
  "Suite 2D",
  "Suite 3B",
  "Suite 4B",
  "Suite 5C",
  "Suite 6A",
];
const TYPES = [
  "Consultation",
  "Follow-up",
  "Annual Check-up",
  "Lab Review",
  "Procedure",
  "Results Review",
];
const STATUSES = ["pending", "accepted", "declined"];
const FILTERS = ["all", "pending", "accepted", "declined"];
const PAGE_SIZE = 8;

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", badge: null },
  { icon: "📋", label: "Appointments", badge: "5", active: true },
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
const fmtDateInput = (d) => d; 

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
    `${target.length} appointment${target.length > 1 ? "s" : ""}`
  ) : (
    <>
      <span className="ad-modal-name">{target.patient.name}</span> on{" "}
      {fmtDate(target.date)} at {target.time}
    </>
  );
  return (
    <div className="ad-modal-overlay" onClick={onCancel}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-icon">🗑️</div>
        <div className="ad-modal-title">
          {Array.isArray(target) ? "Bulk delete" : "Delete appointment"}
        </div>
        <p className="ad-modal-sub">
          This will permanently remove {names}. This action cannot be undone.
        </p>
        <div className="ad-modal-btns">
          <button className="ad-mc" onClick={onCancel}>
            Cancel
          </button>
          <button className="ad-mok" onClick={onConfirm}>
            Delete
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
    duration: appt.duration,
    doctor: appt.doctor.name,
    room: appt.room,
    type: appt.type,
    status: appt.status,
    note: appt.note,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="ad-overlay" onClick={onClose} />
      <aside className="ad-drawer">
        <div className="ad-drawer-head">
          <div>
            <div className="ad-drawer-title">Edit Appointment</div>
            <div className="ad-drawer-sub">{appt.id}</div>
          </div>
          <button className="ad-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ad-drawer-body">
          <div className="ad-ds">
            <div className="ad-ds-title">Patient</div>
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
                <div className="ad-pat-info-id">
                  Read-only · to reassign, delete and rebook
                </div>
              </div>
            </div>
          </div>

          <div className="ad-ds">
            <div className="ad-ds-title">Schedule</div>
            <div className="ad-form-row">
              <div className="ad-field">
                <label>Date</label>
                <input
                  className="ad-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="ad-field">
                <label>Time</label>
                <select
                  className="ad-input"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                >
                  {[
                    "8:00 AM",
                    "8:30 AM",
                    "9:00 AM",
                    "9:30 AM",
                    "10:00 AM",
                    "10:30 AM",
                    "11:00 AM",
                    "11:30 AM",
                    "12:00 PM",
                    "1:00 PM",
                    "1:30 PM",
                    "2:00 PM",
                    "2:30 PM",
                    "3:00 PM",
                    "3:30 PM",
                    "4:00 PM",
                    "4:30 PM",
                    "5:00 PM",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ad-form-row">
              <div className="ad-field">
                <label>Duration</label>
                <select
                  className="ad-input"
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                >
                  {[
                    "15 min",
                    "20 min",
                    "30 min",
                    "45 min",
                    "60 min",
                    "90 min",
                  ].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="ad-field">
                <label>Room</label>
                <select
                  className="ad-input"
                  value={form.room}
                  onChange={(e) => set("room", e.target.value)}
                >
                  {ROOMS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="ad-ds">
            <div className="ad-ds-title">Appointment</div>
            <div className="ad-form-row">
              <div className="ad-field">
                <label>Type</label>
                <select
                  className="ad-input"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="ad-field">
                <label>Status</label>
                <select
                  className="ad-input"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ad-form-row full">
              <div className="ad-field">
                <label>Assigned Doctor</label>
                <select
                  className="ad-input"
                  value={form.doctor}
                  onChange={(e) => set("doctor", e.target.value)}
                >
                  {DOCTORS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ad-form-row full">
              <div className="ad-field">
                <label>Clinical Notes</label>
                <textarea
                  className="ad-input ad-textarea"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ad-drawer-foot">
          <button className="ad-df-btn save" onClick={() => onSave(form)}>
            Save Changes
          </button>
          <button className="ad-df-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="ad-df-btn del" onClick={onDelete}>
            Delete
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

export default function AdminAppointments() {
  const [appts, setAppts] = useState(SEED);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "date", dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set()); 
  const [editing, setEditing] = useState(null); 
  const [delTarget, setDelTarget] = useState(null); 
  const [toast, setToast] = useState(null);

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
          a.id.toLowerCase().includes(q) ||
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
        case "type":
          va = a.type;
          vb = b.type;
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

  const saveEdit = (form) => {
    setAppts((prev) =>
      prev.map((a) => {
        if (a.id !== editing.id) return a;
        return {
          ...a,
          date: form.date,
          time: form.time,
          duration: form.duration,
          room: form.room,
          type: form.type,
          status: form.status,
          note: form.note,
          doctor: { ...a.doctor, name: form.doctor },
        };
      }),
    );
    setEditing(null);
    setToast({ msg: "Appointment updated successfully", icon: "edit" });
  };

  const doDelete = () => {
    if (Array.isArray(delTarget)) {
      const ids = new Set(delTarget.map((id) => id));
      setAppts((prev) => prev.filter((a) => !ids.has(a.id)));
      setSelected(new Set());
      setToast({
        msg: `${delTarget.length} appointment${delTarget.length > 1 ? "s" : ""} deleted`,
        icon: "del",
      });
    } else {
      setAppts((prev) => prev.filter((a) => a.id !== delTarget.id));
      setEditing(null);
      setToast({ msg: "Appointment deleted", icon: "del" });
    }
    setDelTarget(null);
  };

  const bulkStatus = (status) => {
    setAppts((prev) =>
      prev.map((a) => (selected.has(a.id) ? { ...a, status } : a)),
    );
    setToast({
      msg: `${selected.size} appointment${selected.size > 1 ? "s" : ""} marked as ${status}`,
      icon: "edit",
    });
    setSelected(new Set());
  };

  return (
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <a href="/" className="ad-sidebar-logo">
          <div className="ad-logo-mark">V</div>
          <span className="ad-logo-text">
            Vita<span>Med</span>
          </span>
        </a>
        <nav className="ad-nav">
          <div className="ad-nav-lbl">Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`ad-nav-item ${item.active ? "active" : ""}`}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="ad-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <div className="ad-nav-lbl">System</div>
          <button className="ad-nav-item">
            <span className="ad-nav-icon">🔒</span>Audit Log
          </button>
          <button className="ad-nav-item">
            <span className="ad-nav-icon">🚪</span>Sign Out
          </button>
        </nav>
        <div className="ad-sidebar-user">
          <div className="ad-user-av">SA</div>
          <div>
            <div className="ad-user-name">System Admin</div>
            <div className="ad-user-role">Full access</div>
          </div>
          <div className="ad-user-dot" />
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <div className="ad-topbar-title">Appointment Management</div>
            <div className="ad-topbar-sub">
              View, edit, or remove any appointment across all doctors
            </div>
          </div>
          <div className="ad-topbar-right">
            <div className="ad-search-wrap">
              <span className="ad-search-icon">🔍</span>
              <input
                className="ad-search"
                placeholder="Search patient, doctor, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="ad-btn ghost" onClick={() => setSearch("")}>
              Reset
            </button>
          </div>
        </header>

        <div className="ad-content">
          <div className="ad-stats">
            {[
              {
                cls: "s1",
                icon: "📋",
                label: "Total",
                num: counts.all,
                sub: "all records",
              },
              {
                cls: "s2",
                icon: "⏳",
                label: "Pending",
                num: counts.pending || 0,
                sub: "awaiting action",
              },
              {
                cls: "s3",
                icon: "✅",
                label: "Accepted",
                num: counts.accepted || 0,
                sub: "confirmed",
              },
              {
                cls: "s4",
                icon: "❌",
                label: "Declined",
                num: counts.declined || 0,
                sub: "not confirmed",
              },
              {
                cls: "s5",
                icon: "👥",
                label: "Patients",
                num: [...new Set(appts.map((a) => a.patient.email))].length,
                sub: "unique patients",
              },
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
                {f.charAt(0).toUpperCase() + f.slice(1)}
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
                <option value="date-asc">Date: earliest</option>
                <option value="date-desc">Date: latest</option>
                <option value="patient-asc">Patient A–Z</option>
                <option value="doctor-asc">Doctor A–Z</option>
                <option value="status-asc">Status A–Z</option>
              </select>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="ad-bulk-bar">
              <span className="ad-bulk-count">{selected.size} selected</span>
              <div className="ad-bulk-divider" />
              <button
                className="ad-bulk-btn"
                onClick={() => bulkStatus("accepted")}
              >
                ✓ Accept all
              </button>
              <button
                className="ad-bulk-btn"
                onClick={() => bulkStatus("declined")}
              >
                ✕ Decline all
              </button>
              <button
                className="ad-bulk-btn red"
                onClick={() => setDelTarget([...selected])}
              >
                🗑 Delete all
              </button>
              <span
                className="ad-bulk-clear"
                onClick={() => setSelected(new Set())}
              >
                ✕ Clear
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
                { col: "patient", label: "Patient" },
                { col: "doctor", label: "Doctor" },
                { col: "date", label: "Date & Time" },
                { col: "type", label: "Type" },
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
                Actions
              </div>
            </div>

            {pageSlice.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon">📭</div>
                <div className="ad-empty-title">No appointments found</div>
                <div className="ad-empty-sub">
                  Try adjusting your search or filters.
                </div>
              </div>
            ) : (
              pageSlice.map((a, i) => (
                <div
                  key={a.id}
                  className={`ad-row ${selected.has(a.id) ? "selected" : ""}`}
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
                      {a.time} · {a.duration}
                    </div>
                  </div>

                  <div className="ad-cell">
                    <span className="ad-type">{a.type}</span>
                  </div>

                  <div className="ad-cell">
                    <span className={`ad-badge ${a.status}`}>
                      <span className="ad-dot" />
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>

                  <div className="ad-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="ad-row-acts">
                      <button
                        className="ad-ra"
                        title="Edit"
                        onClick={() => setEditing(a)}
                      >
                        ✏️
                      </button>
                      <button
                        className="ad-ra del"
                        title="Delete"
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
                  Showing{" "}
                  {Math.min((page - 1) * PAGE_SIZE + 1, processed.length)}–
                  {Math.min(page * PAGE_SIZE, processed.length)} of{" "}
                  {processed.length} appointments
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
