import { useState, useEffect, useRef, useCallback } from "react";

// ─── BANCO DE DADOS LOCAL (simulado) ───────────────────────────────────────
const INITIAL_USERS = [
  {
    id: "u1", role: "gestor", nome: "Carlos Mendes", email: "gestor@acailog.com",
    senha: "1234", avatar: null, biometria: false,
    empresa: "CD Central AçaíLog", cargo: "Supervisor Geral",
    endereco: "Av. Industrial, 2500", bairro: "Distrito Industrial", cidade: "Belém",
    telefone: "(91) 98888-0001", cpf: "000.000.000-01", rg: null, fotoRg: null, fotoPerfil: null,
    ativo: true, criadoEm: "2024-01-10",
  },
  {
    id: "u2", role: "coletor", nome: "Raimundo Silva", email: "raimundo@acailog.com",
    senha: "1234", avatar: null, biometria: false,
    empresa: "Transportes AçaíLog", cargo: "Motorista Coletor",
    endereco: "Rua das Palmeiras, 98", bairro: "Cremação", cidade: "Belém",
    telefone: "(91) 99111-2222", cpf: "111.111.111-11", rg: "1234567", fotoRg: null, fotoPerfil: null,
    cnh: "AB123456", veiculo: "Caminhão Baú - BEL-1A23",
    ativo: true, criadoEm: "2024-02-15",
  },
  {
    id: "u3", role: "empresa", nome: "Dona Maria Santos", email: "maria@polpaverde.com",
    senha: "1234", avatar: null, biometria: false,
    empresa: "Polpa Verde LTDA", cargo: "Proprietária",
    endereco: "Av. Independência, 890", bairro: "Cremação", cidade: "Belém",
    telefone: "(91) 98765-4321", cpf: "222.222.222-22", rg: null, fotoRg: null, fotoPerfil: null,
    cnpj: "12.345.678/0001-99",
    ativo: true, criadoEm: "2024-03-01",
  },
  {
    id: "u4", role: "empresa", nome: "João Açaí", email: "joao@acaidoze.com",
    senha: "1234", avatar: null, biometria: false,
    empresa: "Açaí do Zé", cargo: "Proprietário",
    endereco: "Rua das Flores, 142", bairro: "Guamá", cidade: "Belém",
    telefone: "(91) 99123-4567", cpf: "333.333.333-33", rg: null, fotoRg: null, fotoPerfil: null,
    cnpj: "98.765.432/0001-11",
    ativo: true, criadoEm: "2024-03-20",
  },
];

const INITIAL_SACAS = [
  { id: "s1", empresaId: "u3", empresa: "Polpa Verde LTDA", endereco: "Av. Independência, 890", bairro: "Cremação", cidade: "Belém", telefone: "(91) 98765-4321", qtd: 15, status: "aguardando", horario: "09:30", obs: "Caroços limpos e secos", fotos: [], criadoEm: "2025-05-06T07:00:00", coletorId: null, canceladoMotivo: null },
  { id: "s2", empresaId: "u4", empresa: "Açaí do Zé", endereco: "Rua das Flores, 142", bairro: "Guamá", cidade: "Belém", telefone: "(91) 99123-4567", qtd: 8, status: "em_rota", horario: "08:00", obs: "", fotos: [], criadoEm: "2025-05-06T06:30:00", coletorId: "u2", canceladoMotivo: null },
  { id: "s3", empresaId: "u3", empresa: "Polpa Verde LTDA", endereco: "Av. Independência, 890", bairro: "Cremação", cidade: "Belém", telefone: "(91) 98765-4321", qtd: 5, status: "entregue_cd", horario: "07:00", obs: "", fotos: [], criadoEm: "2025-05-05T14:00:00", coletorId: "u2", canceladoMotivo: null },
  { id: "s4", empresaId: "u4", empresa: "Açaí do Zé", endereco: "Rua das Flores, 142", bairro: "Guamá", cidade: "Belém", telefone: "(91) 99123-4567", qtd: 12, status: "aguardando", horario: "10:00", obs: "Avisar antes de chegar", fotos: [], criadoEm: "2025-05-06T08:00:00", coletorId: null, canceladoMotivo: null },
  { id: "s5", empresaId: "u3", empresa: "Polpa Verde LTDA", endereco: "Av. Independência, 890", bairro: "Cremação", cidade: "Belém", telefone: "(91) 98765-4321", qtd: 3, status: "cancelado", horario: "06:00", obs: "", fotos: [], criadoEm: "2025-05-04T09:00:00", coletorId: null, canceladoMotivo: "Sacas molhadas, recoleta marcada" },
];

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const STATUS = {
  aguardando: { label: "Aguardando", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: "⏳" },
  em_rota:    { label: "Em Rota",    color: "#3b82f6", bg: "rgba(59,130,246,0.15)", icon: "🚛" },
  coletado:   { label: "Coletado",   color: "#a855f7", bg: "rgba(168,85,247,0.15)", icon: "✅" },
  entregue_cd:{ label: "No CD",      color: "#10b981", bg: "rgba(16,185,129,0.15)", icon: "🏭" },
  cancelado:  { label: "Cancelado",  color: "#ef4444", bg: "rgba(239,68,68,0.15)",  icon: "✕" },
};

const ROLE_LABELS = { gestor: "Gestor / CD", coletor: "Motorista Coletor", empresa: "Batedeira de Açaí" };
const ROLE_ICONS  = { gestor: "🏭", coletor: "🚛", empresa: "🏪" };

// ─── UTILITIES ───────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2);
const fmt = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

// ─── ESTILOS GLOBAIS ─────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080a0f}
  :root{
    --br:#8B4513;--br2:#C25A1C;--bg:#080a0f;--s1:#0e1018;--s2:#161922;--s3:#1e2230;
    --t1:#f0ebe3;--t2:#9a9090;--t3:#5a5252;--acc:#f59e0b;--ok:#10b981;--err:#ef4444;--info:#3b82f6;
    --r:14px;--r2:20px;--sh:0 8px 32px rgba(139,69,19,0.18);
  }
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a2030;border-radius:4px}
  .f{font-family:'Plus Jakarta Sans',sans-serif}
  .mono{font-family:'Space Mono',monospace}
  .card{background:var(--s2);border:1px solid var(--s3);border-radius:var(--r2);transition:all .2s}
  .card-hover:hover{border-color:rgba(139,69,19,.5);transform:translateY(-2px);box-shadow:var(--sh)}
  .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;border:none;cursor:pointer;border-radius:var(--r);transition:all .2s;font-size:14px;padding:13px 20px;display:flex;align-items:center;justify-content:center;gap:8px}
  .btn-p{background:linear-gradient(135deg,var(--br),var(--br2));color:#fff}
  .btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(139,69,19,.4)}
  .btn-p:active{transform:translateY(0)}
  .btn-o{background:transparent;border:1.5px solid var(--br);color:var(--br2)}
  .btn-o:hover{background:rgba(139,69,19,.1)}
  .btn-d{background:rgba(239,68,68,.12);border:1.5px solid rgba(239,68,68,.3);color:#ef4444}
  .btn-d:hover{background:rgba(239,68,68,.2)}
  .btn-g{background:rgba(16,185,129,.12);border:1.5px solid rgba(16,185,129,.3);color:#10b981}
  .btn-g:hover{background:rgba(16,185,129,.2)}
  .inp{font-family:'Plus Jakarta Sans',sans-serif;background:var(--s1);border:1.5px solid var(--s3);color:var(--t1);padding:13px 16px;border-radius:var(--r);font-size:14px;width:100%;outline:none;transition:border .2s}
  .inp:focus{border-color:var(--br)}
  .inp::placeholder{color:var(--t3)}
  .inp:disabled{opacity:.5;cursor:not-allowed}
  .lbl{display:block;color:var(--t2);font-size:11px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.8px}
  .tab{padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s;border:none;background:transparent;color:var(--t3);font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap}
  .tab.on{background:linear-gradient(135deg,var(--br),var(--br2));color:#fff}
  .badge{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700}
  .sep{height:1px;background:var(--s3);margin:16px 0}
  .pill{background:var(--s3);border-radius:8px;padding:6px 12px;font-size:12px;color:var(--t2);font-weight:600}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:0}
  .sheet{background:var(--s1);border-radius:24px 24px 0 0;width:100%;max-height:92vh;overflow-y:auto;padding:24px 20px 40px;border-top:1px solid var(--s3)}
  .drag-handle{width:40px;height:4px;background:var(--s3);border-radius:4px;margin:0 auto 20px}
  .notif{position:fixed;top:16px;right:16px;left:16px;background:linear-gradient(135deg,var(--br),var(--br2));color:#fff;padding:14px 18px;border-radius:14px;font-size:14px;font-weight:600;z-index:9999;animation:slideIn .3s ease;box-shadow:0 8px 32px rgba(139,69,19,.5)}
  @keyframes slideIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  .bio-ring{width:80px;height:80px;border-radius:50%;border:3px solid var(--br);display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;transition:all .3s;margin:0 auto}
  .bio-ring:hover{border-color:var(--br2);transform:scale(1.05);box-shadow:0 0 24px rgba(139,69,19,.4)}
  .bio-ring.scanning{animation:pulse 1.2s infinite;border-color:var(--acc)}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 12px rgba(245,158,11,0)}}
  .bio-ring.success{border-color:var(--ok);animation:none;box-shadow:0 0 24px rgba(16,185,129,.4)}
  .avatar-circle{border-radius:50%;object-fit:cover;background:linear-gradient(135deg,var(--br),var(--br2));display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0}
  .photo-slot{background:var(--s1);border:2px dashed var(--s3);border-radius:14px;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;overflow:hidden;position:relative}
  .photo-slot:hover{border-color:var(--br)}
  .map-bg{background:var(--s1);border:1.5px dashed var(--s3);border-radius:var(--r2);overflow:hidden;position:relative}
  .pin{position:absolute;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;box-shadow:0 4px 12px rgba(0,0,0,.4)}
  .pin:hover{transform:rotate(-45deg) scale(1.15)}
  .pin span{transform:rotate(45deg);font-size:11px}
  .stat-box{background:var(--s1);border:1px solid var(--s3);border-radius:16px;padding:18px;text-align:center}
  .section-title{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:var(--t3);font-weight:700;margin-bottom:12px}
  .row{display:flex;align-items:center;gap:10px}
  .flex{display:flex}
  .col{display:flex;flex-direction:column}
  .g4{gap:4px}.g8{gap:8px}.g12{gap:12px}.g16{gap:16px}.g20{gap:20px}
  .jb{justify-content:space-between}.jc{justify-content:center}.ac{align-items:center}
  .w100{width:100%}.mb4{margin-bottom:4px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.mb20{margin-bottom:20px}.mb24{margin-bottom:24px}
  .mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
  input[type=file]{display:none}
  .camera-preview{width:100%;border-radius:12px;object-fit:cover}
  .timeline-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;border:2px solid var(--bg)}
  .timeline-line{width:2px;background:var(--s3);flex:1;min-height:20px;margin-left:5px}
`;

// ─── HOOK: STORAGE ────────────────────────────────────────────────────────────
function useAppState() {
  const [users, setUsers]   = useState(INITIAL_USERS);
  const [sacas, setSacas]   = useState(INITIAL_SACAS);
  const [currentUser, setCurrentUser] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const login = (email, senha) => {
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.senha === senha && x.ativo);
    if (u) { setCurrentUser(u); return { ok: true, user: u }; }
    return { ok: false };
  };

  const loginBio = (userId) => {
    const u = users.find(x => x.id === userId && x.biometria);
    if (u) { setCurrentUser(u); return true; }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const updateUser = (id, data) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser?.id === id) setCurrentUser(prev => ({ ...prev, ...data }));
  };

  const registerUser = (data) => {
    const novo = { ...data, id: "u" + uid(), criadoEm: new Date().toISOString(), biometria: false };
    setUsers(prev => [...prev, novo]);
    return novo;
  };

  const addSaca = (data) => {
    const nova = { ...data, id: "s" + uid(), criadoEm: new Date().toISOString(), fotos: [], canceladoMotivo: null };
    setSacas(prev => [...prev, nova]);
    return nova;
  };

  const updateSaca = (id, data) => setSacas(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

  const addFotoSaca = (sacaId, foto) => setSacas(prev => prev.map(s => s.id === sacaId ? { ...s, fotos: [...s.fotos, foto] } : s));

  return { users, sacas, currentUser, login, loginBio, logout, updateUser, registerUser, addSaca, updateSaca, addFotoSaca, biometricEnabled, setBiometricEnabled };
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────

function Notif({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className="notif f">{msg}</div>;
}

function Avatar({ user, size = 40 }) {
  if (user?.fotoPerfil) return <img src={user.fotoPerfil} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = user?.nome?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
  return (
    <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet f">
        <div className="drag-handle" />
        {title && <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "var(--t1)" }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

function PhotoCapture({ label, value, onChange, aspectRatio = "4/3", icon = "📷" }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {label && <label className="lbl">{label}</label>}
      <div className="photo-slot" style={{ aspectRatio }} onClick={() => ref.current.click()}>
        {value ? (
          <>
            <img src={value} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.7)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
              Trocar
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
            <div style={{ color: "var(--t3)", fontSize: 13, fontWeight: 600 }}>Toque para fotografar</div>
            <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 4 }}>ou escolher da galeria</div>
          </>
        )}
        <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handleFile} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  if (!s) return null;
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.icon} {s.label}</span>;
}

function SacaCard({ saca, currentUser, onAction, onCancel, onFoto, onDetail }) {
  const s = STATUS[saca.status];
  const isOwn = currentUser?.role === "empresa" && saca.empresaId === currentUser.id;
  const isColetor = currentUser?.role === "coletor";
  const isGestor = currentUser?.role === "gestor";

  const nextAction = saca.status === "aguardando" && isColetor ? { label: "🚛 Iniciar Coleta", fn: () => onAction(saca.id, "em_rota") }
    : saca.status === "em_rota" && isColetor ? { label: "✅ Marcar Coletado", fn: () => onAction(saca.id, "coletado") }
    : saca.status === "coletado" && (isColetor || isGestor) ? { label: "🏭 Entregar no CD", fn: () => onAction(saca.id, "entregue_cd") }
    : null;

  const canCancel = (isOwn && saca.status === "aguardando") || (isGestor && saca.status !== "entregue_cd" && saca.status !== "cancelado");

  return (
    <div className="card card-hover" style={{ padding: 16, marginBottom: 12 }}>
      <div className="flex jb ac mb8">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--t1)", marginBottom: 2 }}>{saca.empresa}</div>
          <div style={{ color: "var(--t2)", fontSize: 12 }}>{saca.endereco}, {saca.bairro}</div>
        </div>
        <StatusBadge status={saca.status} />
      </div>

      <div className="flex g8 mb8" style={{ flexWrap: "wrap" }}>
        <span className="pill">📦 {saca.qtd} sacas</span>
        {saca.horario && <span className="pill">⏰ {saca.horario}</span>}
        {saca.fotos?.length > 0 && <span className="pill" style={{ color: "var(--ok)" }}>📸 {saca.fotos.length} foto{saca.fotos.length > 1 ? "s" : ""}</span>}
        <span className="pill mono" style={{ fontSize: 10 }}>{fmt(saca.criadoEm)}</span>
      </div>

      {saca.obs && <div style={{ color: "var(--t2)", fontSize: 12, marginBottom: 8, fontStyle: "italic" }}>💬 {saca.obs}</div>}
      {saca.canceladoMotivo && <div style={{ color: "var(--err)", fontSize: 12, marginBottom: 8 }}>⛔ {saca.canceladoMotivo}</div>}

      <div className="flex g8 mt8" style={{ flexWrap: "wrap" }}>
        <button className="btn btn-o" style={{ flex: 1, padding: "9px 12px", fontSize: 12 }} onClick={() => onDetail(saca)}>🔍 Detalhes</button>
        {isColetor && saca.status !== "cancelado" && saca.status !== "entregue_cd" && (
          <button className="btn" style={{ flex: 1, padding: "9px 12px", fontSize: 12, background: "rgba(59,130,246,.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,.3)" }} onClick={() => onFoto(saca)}>📸 Foto</button>
        )}
        {nextAction && (
          <button className="btn btn-p" style={{ flex: 2, padding: "9px 12px", fontSize: 12 }} onClick={nextAction.fn}>{nextAction.label}</button>
        )}
        {canCancel && (
          <button className="btn btn-d" style={{ padding: "9px 12px", fontSize: 12 }} onClick={() => onCancel(saca)}>✕</button>
        )}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function AcaiLogApp() {
  const app = useAppState();
  const [screen, setScreen] = useState("login"); // login | register | app
  const [notif, setNotif] = useState(null);
  const [sheet, setSheet] = useState(null); // null | "newSaca" | "cancel" | "foto" | "detail" | "profile" | "editProfile" | "registerUser"
  const [sheetData, setSheetData] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [bioState, setBioState] = useState("idle"); // idle | scanning | success | fail
  const [lastUserId, setLastUserId] = useState(null);

  // New saca
  const [newSaca, setNewSaca] = useState({ qtd: "", horario: "", obs: "" });

  // Cancel
  const [cancelMotivo, setCancelMotivo] = useState("");

  // Foto saca
  const [fotoCap, setFotoCap] = useState(null);

  // Register user
  const [regForm, setRegForm] = useState({ role: "empresa", nome: "", email: "", senha: "", telefone: "", empresa: "", endereco: "", bairro: "", cidade: "Belém", cpf: "", cnpj: "", cnh: "", veiculo: "", cargo: "", fotoPerfil: null, fotoRg: null, rg: "" });

  // Edit profile
  const [editForm, setEditForm] = useState({});

  const push = (msg) => { setNotif(msg); };

  const closeSheet = () => { setSheet(null); setSheetData(null); setFotoCap(null); setCancelMotivo(""); };

  // ─ LOGIN ─
  const handleLogin = () => {
    if (!loginEmail || !loginSenha) return push("⚠️ Preencha e-mail e senha");
    const r = app.login(loginEmail, loginSenha);
    if (r.ok) {
      setLastUserId(r.user.id);
      setScreen("app");
      setActiveTab(r.user.role === "empresa" ? "home" : r.user.role === "coletor" ? "map" : "dash");
      push(`👋 Bem-vindo(a), ${r.user.nome.split(" ")[0]}!`);
    } else push("❌ E-mail ou senha incorretos");
  };

  // ─ BIOMETRIA ─
  const handleBio = () => {
    if (!lastUserId) return push("⚠️ Faça login com senha primeiro para ativar biometria");
    const u = app.users.find(x => x.id === lastUserId);
    if (!u?.biometria) return push("⚠️ Biometria não cadastrada. Ative nas configurações de perfil.");
    setBioState("scanning");
    setTimeout(() => {
      const ok = app.loginBio(lastUserId);
      if (ok) {
        setBioState("success");
        setTimeout(() => { setScreen("app"); setBioState("idle"); push("🔐 Acesso biométrico autorizado!"); }, 700);
      } else { setBioState("fail"); setTimeout(() => setBioState("idle"), 1500); }
    }, 1400);
  };

  // ─ CADASTRO SACA ─
  const handleAddSaca = () => {
    if (!newSaca.qtd) return push("⚠️ Informe a quantidade de sacas");
    const u = app.currentUser;
    app.addSaca({
      empresaId: u.id, empresa: u.empresa, endereco: u.endereco,
      bairro: u.bairro, cidade: u.cidade, telefone: u.telefone,
      qtd: parseInt(newSaca.qtd), horario: newSaca.horario, obs: newSaca.obs, status: "aguardando", coletorId: null,
    });
    setNewSaca({ qtd: "", horario: "", obs: "" });
    closeSheet();
    push("✅ Saca cadastrada! Coletor será notificado.");
  };

  // ─ CANCELAR COLETA ─
  const handleCancel = () => {
    if (!cancelMotivo.trim()) return push("⚠️ Informe o motivo do cancelamento");
    app.updateSaca(sheetData.id, { status: "cancelado", canceladoMotivo: cancelMotivo });
    closeSheet();
    push("🚫 Coleta cancelada.");
  };

  // ─ FOTO SACA ─
  const handleAddFoto = () => {
    if (!fotoCap) return push("⚠️ Capture uma foto antes de salvar");
    app.addFotoSaca(sheetData.id, { url: fotoCap, ts: new Date().toISOString() });
    setFotoCap(null);
    closeSheet();
    push("📸 Foto registrada com sucesso!");
  };

  // ─ AVANÇO DE STATUS ─
  const handleAction = (id, novoStatus) => {
    app.updateSaca(id, { status: novoStatus, coletorId: novoStatus === "em_rota" ? app.currentUser.id : undefined });
    const msgs = { em_rota: "🚛 Coleta iniciada!", coletado: "✅ Marcado como coletado!", entregue_cd: "🏭 Entregue no CD com sucesso!" };
    push(msgs[novoStatus]);
  };

  // ─ CADASTRO USUÁRIO ─
  const handleRegisterUser = () => {
    if (!regForm.nome || !regForm.email || !regForm.senha || !regForm.empresa) return push("⚠️ Preencha os campos obrigatórios");
    if (app.users.find(u => u.email.toLowerCase() === regForm.email.toLowerCase())) return push("❌ E-mail já cadastrado");
    if (!regForm.fotoPerfil) return push("⚠️ Adicione uma foto de perfil");
    if (regForm.role !== "gestor" && !regForm.fotoRg) return push("⚠️ Adicione a foto do RG");
    const novo = app.registerUser({ ...regForm, ativo: true });
    closeSheet();
    push(`✅ ${novo.nome} cadastrado(a) com sucesso!`);
    setRegForm({ role: "empresa", nome: "", email: "", senha: "", telefone: "", empresa: "", endereco: "", bairro: "", cidade: "Belém", cpf: "", cnpj: "", cnh: "", veiculo: "", cargo: "", fotoPerfil: null, fotoRg: null, rg: "" });
  };

  // ─ SALVAR PERFIL ─
  const handleSaveProfile = () => {
    app.updateUser(app.currentUser.id, editForm);
    closeSheet();
    push("✅ Perfil atualizado!");
  };

  // ─ ATIVAR BIOMETRIA ─
  const handleToggleBio = () => {
    const val = !app.currentUser.biometria;
    app.updateUser(app.currentUser.id, { biometria: val });
    setLastUserId(app.currentUser.id);
    push(val ? "🔐 Biometria ativada! Use na próxima entrada." : "🔓 Biometria desativada.");
  };

  // ─ DADOS FILTRADOS ─
  const u = app.currentUser;
  const allSacas = app.sacas;
  const mySacas = u?.role === "empresa" ? allSacas.filter(s => s.empresaId === u.id) : allSacas;
  const visibleSacas = filterStatus === "todos" ? mySacas : mySacas.filter(s => s.status === filterStatus);

  // ─ TABS POR ROLE ─
  const tabs = {
    empresa: [
      { id: "home", icon: "🏠", label: "Início" },
      { id: "sacas", icon: "📦", label: "Minhas Sacas" },
      { id: "profile", icon: "👤", label: "Perfil" },
    ],
    coletor: [
      { id: "map", icon: "🗺️", label: "Mapa" },
      { id: "sacas", icon: "📋", label: "Coletas" },
      { id: "rota", icon: "🛣️", label: "Rota" },
      { id: "profile", icon: "👤", label: "Perfil" },
    ],
    gestor: [
      { id: "dash", icon: "📊", label: "Dashboard" },
      { id: "map", icon: "🗺️", label: "Mapa" },
      { id: "sacas", icon: "📋", label: "Sacas" },
      { id: "cd", icon: "🏭", label: "CD" },
      { id: "team", icon: "👥", label: "Equipe" },
    ],
  };
  const currentTabs = u ? (tabs[u.role] || []) : [];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="f" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--t1)", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <style>{CSS}</style>
      {notif && <Notif msg={notif} onClose={() => setNotif(null)} />}

      {/* ══ LOGIN ══════════════════════════════════════════════════════════ */}
      {screen === "login" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "0 24px", background: "radial-gradient(ellipse at 50% -20%, rgba(139,69,19,.25) 0%, transparent 65%), var(--bg)" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 60 }}>
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🫘</div>
              <h1 style={{ fontSize: 34, fontWeight: 800, background: "linear-gradient(135deg, #C25A1C, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>AçaíLog</h1>
              <p style={{ color: "var(--t3)", fontSize: 13 }}>Logística de caroços · Economia circular</p>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label className="lbl">E-mail</label>
                <input className="inp" type="email" placeholder="seu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <div>
                <label className="lbl">Senha</label>
                <div style={{ position: "relative" }}>
                  <input className="inp" type={showSenha ? "text" : "password"} placeholder="••••••••" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ paddingRight: 48 }} />
                  <button onClick={() => setShowSenha(!showSenha)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 16 }}>
                    {showSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button className="btn btn-p w100" style={{ padding: 16, fontSize: 15, marginTop: 4 }} onClick={handleLogin}>Entrar</button>
            </div>

            {/* Biometria */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ color: "var(--t3)", fontSize: 12, marginBottom: 16 }}>ou acesse com biometria</div>
              <div
                className={`bio-ring ${bioState === "scanning" ? "scanning" : bioState === "success" ? "success" : ""}`}
                onClick={handleBio}
                title="Login biométrico"
              >
                {bioState === "scanning" ? "⏳" : bioState === "success" ? "✅" : bioState === "fail" ? "❌" : "👆"}
              </div>
              <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 10 }}>
                {bioState === "scanning" ? "Verificando biometria..." : bioState === "success" ? "Autorizado!" : bioState === "fail" ? "Biometria não reconhecida" : "Toque para usar biometria"}
              </div>
            </div>

            {/* Usuários demo */}
            <div style={{ background: "var(--s2)", border: "1px solid var(--s3)", borderRadius: 16, padding: 16 }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Acesso rápido (demo)</div>
              {INITIAL_USERS.slice(0, 3).map(u => (
                <div key={u.id} onClick={() => { setLoginEmail(u.email); setLoginSenha(u.senha); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--s3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Avatar user={u} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{u.nome}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>{ROLE_LABELS[u.role]}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>{u.email}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24, paddingBottom: 40 }}>
              <button className="btn btn-o" onClick={() => { setSheet("registerUser"); }} style={{ fontSize: 13 }}>
                ➕ Cadastrar novo usuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ APP ════════════════════════════════════════════════════════════ */}
      {screen === "app" && u && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--s3)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--s1)", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🫘</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, background: "linear-gradient(135deg, #C25A1C, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AçaíLog</div>
                <div style={{ color: "var(--t3)", fontSize: 10, textTransform: "uppercase", letterSpacing: .5 }}>{ROLE_LABELS[u.role]}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {u.role === "gestor" && (
                <button className="btn btn-p" style={{ padding: "8px 14px", fontSize: 12 }} onClick={() => { setSheet("registerUser"); }}>
                  ➕ Cadastrar
                </button>
              )}
              <div onClick={() => setSheet("profile")} style={{ cursor: "pointer" }}>
                <Avatar user={u} size={36} />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", paddingBottom: 80 }}>

            {/* ── HOME EMPRESA ── */}
            {activeTab === "home" && u.role === "empresa" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Olá, {u.nome.split(" ")[0]}! 👋</div>
                  <div style={{ color: "var(--t2)", fontSize: 13 }}>{u.empresa}</div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  {[
                    { icon: "📦", label: "Total de sacas", value: allSacas.filter(s => s.empresaId === u.id).reduce((a, b) => a + b.qtd, 0), color: "var(--br2)" },
                    { icon: "⏳", label: "Aguardando", value: allSacas.filter(s => s.empresaId === u.id && s.status === "aguardando").length, color: "var(--acc)" },
                    { icon: "🚛", label: "Em rota", value: allSacas.filter(s => s.empresaId === u.id && s.status === "em_rota").length, color: "var(--info)" },
                    { icon: "🏭", label: "No CD", value: allSacas.filter(s => s.empresaId === u.id && s.status === "entregue_cd").length, color: "var(--ok)" },
                  ].map(({ icon, label, value, color }) => (
                    <div key={label} className="stat-box">
                      <div style={{ fontSize: 22 }}>{icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                      <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Endereço cadastrado */}
                <div style={{ background: "rgba(139,69,19,.1)", border: "1px solid rgba(139,69,19,.25)", borderRadius: 16, padding: 16, marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--br2)" }}>📍 Endereço de coleta cadastrado</div>
                  <div style={{ color: "var(--t1)", fontSize: 14, fontWeight: 600 }}>{u.endereco}</div>
                  <div style={{ color: "var(--t2)", fontSize: 13 }}>{u.bairro}, {u.cidade}</div>
                  <div style={{ color: "var(--t2)", fontSize: 12, marginTop: 4 }}>📞 {u.telefone}</div>
                  <button className="btn btn-o" style={{ marginTop: 12, fontSize: 12, padding: "8px 14px" }} onClick={() => { setEditForm({ endereco: u.endereco, bairro: u.bairro, cidade: u.cidade, telefone: u.telefone }); setSheet("editProfile"); }}>
                    ✏️ Atualizar endereço
                  </button>
                </div>

                <button className="btn btn-p w100" style={{ padding: 16, fontSize: 15 }} onClick={() => setSheet("newSaca")}>
                  ➕ Solicitar Nova Coleta
                </button>

                {/* Recentes */}
                {mySacas.filter(s => s.status !== "entregue_cd").length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div className="section-title">Coletas recentes</div>
                    {mySacas.filter(s => s.status !== "entregue_cd").slice(0, 3).map(s => (
                      <SacaCard key={s.id} saca={s} currentUser={u} onAction={handleAction} onCancel={(saca) => { setSheetData(saca); setSheet("cancel"); }} onFoto={(saca) => { setSheetData(saca); setSheet("foto"); }} onDetail={(saca) => { setSheetData(saca); setSheet("detail"); }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SACAS (todos os roles) ── */}
            {activeTab === "sacas" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {u.role === "empresa" ? "Minhas Sacas" : u.role === "coletor" ? "Coletas" : "Todas as Sacas"}
                  </div>
                  {u.role === "empresa" && (
                    <button className="btn btn-p" style={{ padding: "9px 14px", fontSize: 12 }} onClick={() => setSheet("newSaca")}>➕ Nova</button>
                  )}
                </div>

                {/* Filtros */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                  {["todos", ...Object.keys(STATUS)].map(s => (
                    <button key={s} className={`tab ${filterStatus === s ? "on" : ""}`} onClick={() => setFilterStatus(s)}>
                      {s === "todos" ? "Todos" : STATUS[s].label}
                    </button>
                  ))}
                </div>

                {visibleSacas.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--t3)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div style={{ fontWeight: 600 }}>Nenhuma saca encontrada</div>
                  </div>
                ) : (
                  visibleSacas.map(s => (
                    <SacaCard key={s.id} saca={s} currentUser={u} onAction={handleAction} onCancel={(saca) => { setSheetData(saca); setSheet("cancel"); }} onFoto={(saca) => { setSheetData(saca); setSheet("foto"); }} onDetail={(saca) => { setSheetData(saca); setSheet("detail"); }} />
                  ))
                )}
              </div>
            )}

            {/* ── MAPA ── */}
            {activeTab === "map" && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Mapa de Coletas</div>
                <div className="map-bg" style={{ height: 280, marginBottom: 16 }}>
                  {/* Grade decorativa */}
                  <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(0deg,#8B4513 0px,transparent 1px,transparent 36px),repeating-linear-gradient(90deg,#8B4513 0px,transparent 1px,transparent 36px)" }} />
                  {/* CD */}
                  <div style={{ position: "absolute", bottom: "12%", right: "12%", background: "var(--ok)", borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>🏭 CD Central</div>
                  {/* Legenda */}
                  <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(14,16,24,.93)", border: "1px solid var(--s3)", borderRadius: 10, padding: 10 }}>
                    {Object.entries(STATUS).filter(([k]) => k !== "cancelado").map(([k, v]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--t2)", fontSize: 10 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: v.color, display: "inline-block" }} />
                        {v.label}
                      </div>
                    ))}
                  </div>
                  {/* Pins */}
                  {allSacas.filter(s => s.status !== "cancelado").map((s, i) => {
                    const st = STATUS[s.status];
                    const x = (12 + (i % 4) * 20) + "%";
                    const y = (15 + Math.floor(i / 4) * 28) + "%";
                    return (
                      <div key={s.id} className="pin" style={{ left: x, top: y, background: st.color }} onClick={() => { setSheetData(s); setSheet("detail"); }}>
                        <span>{st.icon}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="section-title">Pontos ativos</div>
                {allSacas.filter(s => ["aguardando", "em_rota"].includes(s.status)).map(s => (
                  <SacaCard key={s.id} saca={s} currentUser={u} onAction={handleAction} onCancel={(saca) => { setSheetData(saca); setSheet("cancel"); }} onFoto={(saca) => { setSheetData(saca); setSheet("foto"); }} onDetail={(saca) => { setSheetData(saca); setSheet("detail"); }} />
                ))}
              </div>
            )}

            {/* ── ROTA COLETOR ── */}
            {activeTab === "rota" && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Minha Rota</div>
                <div style={{ color: "var(--t2)", fontSize: 13, marginBottom: 20 }}>Sequência otimizada de coletas</div>

                <div style={{ background: "linear-gradient(135deg, rgba(139,69,19,.18), rgba(194,90,28,.1))", border: "1px solid rgba(139,69,19,.3)", borderRadius: 16, padding: 18, marginBottom: 20, display: "flex", gap: 0 }}>
                  {[
                    { label: "Paradas", value: allSacas.filter(s => ["aguardando","em_rota"].includes(s.status)).length },
                    { label: "Total sacas", value: allSacas.filter(s => ["aguardando","em_rota"].includes(s.status)).reduce((a,b) => a+b.qtd, 0) },
                    { label: "Concluídas", value: allSacas.filter(s => ["coletado","entregue_cd"].includes(s.status)).length },
                  ].map(({ label, value }, i) => (
                    <div key={label} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(139,69,19,.2)" : "none" }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--br2)" }}>{value}</div>
                      <div style={{ color: "var(--t3)", fontSize: 11 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ position: "relative", paddingLeft: 26 }}>
                  <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, var(--br), transparent)" }} />
                  {allSacas.filter(s => s.status !== "entregue_cd" && s.status !== "cancelado").map((s, i) => {
                    const st = STATUS[s.status];
                    return (
                      <div key={s.id} style={{ marginBottom: 16, position: "relative" }}>
                        <div style={{ position: "absolute", left: -22, top: 18, width: 12, height: 12, borderRadius: "50%", background: st.color, border: "2px solid var(--bg)" }} />
                        <SacaCard saca={s} currentUser={u} onAction={handleAction} onCancel={(saca) => { setSheetData(saca); setSheet("cancel"); }} onFoto={(saca) => { setSheetData(saca); setSheet("foto"); }} onDetail={(saca) => { setSheetData(saca); setSheet("detail"); }} />
                      </div>
                    );
                  })}
                  <div style={{ marginLeft: -26, background: "var(--s2)", border: "2px dashed var(--ok)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>🏭</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--ok)" }}>Centro de Distribuição</div>
                      <div style={{ color: "var(--t2)", fontSize: 12 }}>Destino final · Av. Industrial, 2500</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DASHBOARD GESTOR ── */}
            {activeTab === "dash" && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Dashboard</div>
                <div style={{ color: "var(--t2)", fontSize: 13, marginBottom: 20 }}>Visão geral das operações</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { icon: "📦", label: "Total sacas", value: allSacas.filter(s => s.status !== "cancelado").reduce((a, b) => a + b.qtd, 0), color: "var(--br2)" },
                    { icon: "⏳", label: "Aguardando", value: allSacas.filter(s => s.status === "aguardando").length, color: "var(--acc)" },
                    { icon: "🚛", label: "Em rota", value: allSacas.filter(s => s.status === "em_rota").length, color: "var(--info)" },
                    { icon: "🏭", label: "No CD hoje", value: allSacas.filter(s => s.status === "entregue_cd").reduce((a, b) => a + b.qtd, 0), color: "var(--ok)" },
                    { icon: "✕", label: "Canceladas", value: allSacas.filter(s => s.status === "cancelado").length, color: "var(--err)" },
                    { icon: "🏪", label: "Empresas ativas", value: app.users.filter(u => u.role === "empresa" && u.ativo).length, color: "#a855f7" },
                  ].map(({ icon, label, value, color }) => (
                    <div key={label} className="stat-box">
                      <div style={{ fontSize: 20 }}>{icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                      <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "var(--s2)", border: "1px solid var(--s3)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
                  <div className="section-title">Progresso por status</div>
                  {Object.entries(STATUS).map(([key, cfg]) => {
                    const count = allSacas.filter(s => s.status === key).length;
                    const pct = allSacas.length ? Math.round((count / allSacas.length) * 100) : 0;
                    return (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div className="flex jb ac" style={{ marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: "var(--t1)" }}>{cfg.icon} {cfg.label}</span>
                          <span style={{ fontWeight: 800, color: cfg.color, fontSize: 13 }}>{count}</span>
                        </div>
                        <div style={{ height: 5, background: "var(--s3)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: 4, transition: "width .5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 16, padding: 18 }}>
                  <div style={{ fontWeight: 700, color: "var(--ok)", marginBottom: 8 }}>🌱 Impacto Ambiental</div>
                  <div className="flex g12">
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ok)" }}>~{Math.round(allSacas.filter(s => s.status === "entregue_cd").reduce((a, b) => a + b.qtd, 0) * 25)}kg</div>
                      <div style={{ color: "var(--t3)", fontSize: 11 }}>Resíduos aproveitados</div>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ok)" }}>CO₂ ↓</div>
                      <div style={{ color: "var(--t3)", fontSize: 11 }}>Emissão reduzida</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CD GESTOR ── */}
            {activeTab === "cd" && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Recebimento no CD</div>
                <div style={{ background: "linear-gradient(135deg, var(--br), var(--br2))", borderRadius: 18, padding: 22, marginBottom: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 11, opacity: .8, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Sacas recebidas</div>
                  <div style={{ fontSize: 52, fontWeight: 800 }}>{allSacas.filter(s => s.status === "entregue_cd").reduce((a, b) => a + b.qtd, 0)}</div>
                  <div style={{ opacity: .7, fontSize: 13 }}>de {allSacas.filter(s => s.status !== "cancelado").reduce((a, b) => a + b.qtd, 0)} registradas</div>
                </div>
                <div className="section-title">Aguardando confirmação</div>
                {allSacas.filter(s => s.status === "coletado").map(s => (
                  <SacaCard key={s.id} saca={s} currentUser={u} onAction={handleAction} onCancel={(saca) => { setSheetData(saca); setSheet("cancel"); }} onFoto={(saca) => { setSheetData(saca); setSheet("foto"); }} onDetail={(saca) => { setSheetData(saca); setSheet("detail"); }} />
                ))}
                <div className="section-title" style={{ marginTop: 20 }}>Entregues no CD</div>
                {allSacas.filter(s => s.status === "entregue_cd").map(s => (
                  <SacaCard key={s.id} saca={s} currentUser={u} onAction={handleAction} onCancel={() => {}} onFoto={() => {}} onDetail={(saca) => { setSheetData(saca); setSheet("detail"); }} />
                ))}
              </div>
            )}

            {/* ── EQUIPE GESTOR ── */}
            {activeTab === "team" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>Equipe</div>
                  <button className="btn btn-p" style={{ padding: "9px 14px", fontSize: 12 }} onClick={() => setSheet("registerUser")}>➕ Cadastrar</button>
                </div>
                {["gestor", "coletor", "empresa"].map(role => {
                  const group = app.users.filter(u => u.role === role);
                  if (!group.length) return null;
                  return (
                    <div key={role} style={{ marginBottom: 20 }}>
                      <div className="section-title">{ROLE_ICONS[role]} {ROLE_LABELS[role]}s ({group.length})</div>
                      {group.map(user => (
                        <div key={user.id} className="card card-hover" style={{ padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar user={user} size={44} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{user.nome}</div>
                            <div style={{ color: "var(--t2)", fontSize: 12 }}>{user.empresa}</div>
                            <div style={{ color: "var(--t3)", fontSize: 11 }}>{user.email}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: user.ativo ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)", color: user.ativo ? "var(--ok)" : "var(--err)", fontWeight: 700 }}>
                              {user.ativo ? "Ativo" : "Inativo"}
                            </span>
                            {user.biometria && <span style={{ fontSize: 9, color: "var(--acc)" }}>🔐 Bio ativo</span>}
                            {user.fotoPerfil && <span style={{ fontSize: 9, color: "var(--info)" }}>📸 Foto OK</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PERFIL ── */}
            {activeTab === "profile" && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Meu Perfil</div>

                {/* Avatar grande */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <Avatar user={u} size={80} />
                  <div style={{ fontWeight: 800, fontSize: 18, marginTop: 12 }}>{u.nome}</div>
                  <div style={{ color: "var(--t2)", fontSize: 13 }}>{u.empresa}</div>
                  <div style={{ color: "var(--t3)", fontSize: 12 }}>{ROLE_LABELS[u.role]}</div>
                </div>

                {/* Info */}
                <div style={{ background: "var(--s2)", border: "1px solid var(--s3)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
                  {[
                    { icon: "📧", label: "E-mail", value: u.email },
                    { icon: "📞", label: "Telefone", value: u.telefone },
                    { icon: "📍", label: "Endereço", value: `${u.endereco}, ${u.bairro}` },
                    { icon: "🏙️", label: "Cidade", value: u.cidade },
                    ...(u.cpf ? [{ icon: "🪪", label: "CPF", value: u.cpf }] : []),
                    ...(u.cnpj ? [{ icon: "🏢", label: "CNPJ", value: u.cnpj }] : []),
                    ...(u.cnh ? [{ icon: "🚗", label: "CNH", value: u.cnh }] : []),
                    ...(u.veiculo ? [{ icon: "🚛", label: "Veículo", value: u.veiculo }] : []),
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: "flex", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--s3)" }}>
                      <span style={{ fontSize: 16, width: 24 }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "var(--t3)", fontSize: 11, marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{value || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Biometria toggle */}
                <div style={{ background: "var(--s2)", border: "1px solid var(--s3)", borderRadius: 16, padding: 18, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>🔐 Login Biométrico</div>
                    <div style={{ color: "var(--t2)", fontSize: 12 }}>{u.biometria ? "Ativo — use o toque digital na tela de login" : "Ative para acessar sem senha"}</div>
                  </div>
                  <div onClick={handleToggleBio} style={{ width: 48, height: 26, borderRadius: 13, background: u.biometria ? "var(--ok)" : "var(--s3)", cursor: "pointer", transition: "background .2s", position: "relative" }}>
                    <div style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: "#fff", top: 3, left: u.biometria ? 25 : 3, transition: "left .2s" }} />
                  </div>
                </div>

                {/* Fotos cadastradas */}
                {(u.fotoPerfil || u.fotoRg) && (
                  <div style={{ background: "var(--s2)", border: "1px solid var(--s3)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>Fotos cadastradas</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {u.fotoPerfil && (
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "var(--t3)", fontSize: 11, marginBottom: 6 }}>FOTO DE PERFIL</div>
                          <img src={u.fotoPerfil} style={{ width: "100%", borderRadius: 10, objectFit: "cover", aspectRatio: "1" }} />
                        </div>
                      )}
                      {u.fotoRg && (
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "var(--t3)", fontSize: 11, marginBottom: 6 }}>FOTO DO RG</div>
                          <img src={u.fotoRg} style={{ width: "100%", borderRadius: 10, objectFit: "cover", aspectRatio: "4/3" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button className="btn btn-o w100" style={{ marginBottom: 12 }} onClick={() => { setEditForm({ nome: u.nome, telefone: u.telefone, endereco: u.endereco, bairro: u.bairro, cidade: u.cidade, fotoPerfil: u.fotoPerfil, fotoRg: u.fotoRg }); setSheet("editProfile"); }}>
                  ✏️ Editar Perfil
                </button>
                <button className="btn btn-d w100" onClick={() => { app.logout(); setScreen("login"); push("👋 Você saiu com segurança."); }}>
                  🚪 Sair da Conta
                </button>
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--s1)", borderTop: "1px solid var(--s3)", padding: "10px 8px 20px", display: "flex", justifyContent: "space-around" }}>
            {currentTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0" }}>
                <span style={{ fontSize: 20 }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: activeTab === tab.id ? "var(--br2)" : "var(--t3)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{tab.label}</span>
                {activeTab === tab.id && <div style={{ width: 20, height: 2, background: "var(--br2)", borderRadius: 2 }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ SHEETS ══════════════════════════════════════════════════════════ */}

      {/* Nova Saca */}
      {sheet === "newSaca" && (
        <Sheet title="➕ Solicitar Coleta" onClose={closeSheet}>
          <div style={{ background: "rgba(139,69,19,.1)", border: "1px solid rgba(139,69,19,.2)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--br2)", marginBottom: 4 }}>📍 Coleta no seu endereço cadastrado</div>
            <div style={{ color: "var(--t1)", fontSize: 14 }}>{u?.endereco}</div>
            <div style={{ color: "var(--t2)", fontSize: 13 }}>{u?.bairro}, {u?.cidade}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="lbl">Quantidade de sacas *</label>
              <input className="inp" type="number" min="1" placeholder="Ex: 10" value={newSaca.qtd} onChange={e => setNewSaca({ ...newSaca, qtd: e.target.value })} />
            </div>
            <div>
              <label className="lbl">Horário disponível para coleta</label>
              <input className="inp" type="time" value={newSaca.horario} onChange={e => setNewSaca({ ...newSaca, horario: e.target.value })} />
            </div>
            <div>
              <label className="lbl">Observações (opcional)</label>
              <textarea className="inp" rows={3} placeholder="Ex: Caroços limpos, ligar antes de chegar..." value={newSaca.obs} onChange={e => setNewSaca({ ...newSaca, obs: e.target.value })} style={{ resize: "none" }} />
            </div>
            <div style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 12, padding: 12, fontSize: 12, color: "var(--ok)" }}>
              🌱 Os caroços serão destinados à produção de cimento ecológico.
            </div>
            <button className="btn btn-p w100" style={{ padding: 16, fontSize: 15 }} onClick={handleAddSaca}>📦 Confirmar Solicitação</button>
          </div>
        </Sheet>
      )}

      {/* Cancelar */}
      {sheet === "cancel" && sheetData && (
        <Sheet title="⛔ Cancelar Coleta" onClose={closeSheet}>
          <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{sheetData.empresa}</div>
            <div style={{ color: "var(--t2)", fontSize: 13 }}>{sheetData.qtd} sacas · {sheetData.bairro}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Motivo do cancelamento *</label>
            <textarea className="inp" rows={4} placeholder="Descreva o motivo do cancelamento..." value={cancelMotivo} onChange={e => setCancelMotivo(e.target.value)} style={{ resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-o" style={{ flex: 1 }} onClick={closeSheet}>Voltar</button>
            <button className="btn btn-d" style={{ flex: 1 }} onClick={handleCancel}>⛔ Confirmar Cancelamento</button>
          </div>
        </Sheet>
      )}

      {/* Foto de saca */}
      {sheet === "foto" && sheetData && (
        <Sheet title="📸 Registrar Foto das Sacas" onClose={closeSheet}>
          <div style={{ marginBottom: 8, color: "var(--t2)", fontSize: 13 }}>
            Fotografe as sacas de caroço em {sheetData.empresa}
          </div>
          <PhotoCapture value={fotoCap} onChange={setFotoCap} label="Foto das sacas" icon="📷" />
          {sheetData.fotos?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="section-title">Fotos já registradas ({sheetData.fotos.length})</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {sheetData.fotos.map((f, i) => (
                  <img key={i} src={f.url} style={{ height: 80, width: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-o" style={{ flex: 1 }} onClick={closeSheet}>Cancelar</button>
            <button className="btn btn-g" style={{ flex: 1 }} onClick={handleAddFoto}>💾 Salvar Foto</button>
          </div>
        </Sheet>
      )}

      {/* Detalhe da saca */}
      {sheet === "detail" && sheetData && (
        <Sheet title="🔍 Detalhes da Coleta" onClose={closeSheet}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{sheetData.empresa}</div>
              <div style={{ color: "var(--t2)", fontSize: 13 }}>{sheetData.endereco}, {sheetData.bairro}</div>
            </div>
            <StatusBadge status={sheetData.status} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Sacas", value: `${sheetData.qtd} un.`, icon: "📦" },
              { label: "Horário", value: sheetData.horario || "—", icon: "⏰" },
              { label: "Telefone", value: sheetData.telefone, icon: "📞" },
              { label: "Criado em", value: fmt(sheetData.criadoEm), icon: "📅" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background: "var(--s3)", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>{icon} {label}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{value}</div>
              </div>
            ))}
          </div>

          {sheetData.obs && (
            <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--acc)", marginBottom: 4 }}>OBSERVAÇÕES</div>
              <div style={{ fontSize: 13 }}>{sheetData.obs}</div>
            </div>
          )}

          {sheetData.canceladoMotivo && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--err)", marginBottom: 4 }}>MOTIVO DO CANCELAMENTO</div>
              <div style={{ fontSize: 13 }}>{sheetData.canceladoMotivo}</div>
            </div>
          )}

          {sheetData.fotos?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-title">Fotos registradas ({sheetData.fotos.length})</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sheetData.fotos.map((f, i) => (
                  <img key={i} src={f.url} style={{ width: "calc(50% - 4px)", borderRadius: 12, objectFit: "cover", aspectRatio: "4/3" }} />
                ))}
              </div>
            </div>
          )}

          {u?.role === "coletor" && sheetData.status !== "entregue_cd" && sheetData.status !== "cancelado" && (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" style={{ flex: 1, background: "rgba(59,130,246,.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,.3)" }} onClick={() => { setSheet("foto"); }}>
                📸 Foto
              </button>
              {sheetData.status === "aguardando" && <button className="btn btn-p" style={{ flex: 2 }} onClick={() => { handleAction(sheetData.id, "em_rota"); closeSheet(); }}>🚛 Iniciar Coleta</button>}
              {sheetData.status === "em_rota" && <button className="btn btn-p" style={{ flex: 2 }} onClick={() => { handleAction(sheetData.id, "coletado"); closeSheet(); }}>✅ Marcar Coletado</button>}
              {sheetData.status === "coletado" && <button className="btn btn-p" style={{ flex: 2 }} onClick={() => { handleAction(sheetData.id, "entregue_cd"); closeSheet(); }}>🏭 Entregar no CD</button>}
            </div>
          )}
        </Sheet>
      )}

      {/* Cadastro de usuário */}
      {sheet === "registerUser" && (
        <Sheet title="👤 Cadastrar Usuário" onClose={closeSheet}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="lbl">Tipo de usuário *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.entries(ROLE_LABELS).map(([r, l]) => (
                  <button key={r} onClick={() => setRegForm({ ...regForm, role: r })} className="btn" style={{ flex: 1, padding: "9px 6px", fontSize: 11, fontWeight: 700, background: regForm.role === r ? "linear-gradient(135deg,var(--br),var(--br2))" : "var(--s3)", color: regForm.role === r ? "#fff" : "var(--t2)", border: "none" }}>
                    {ROLE_ICONS[r]}<br />{l.split(" / ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Foto de perfil (obrigatória) */}
            <PhotoCapture label="Foto de perfil (obrigatória) *" value={regForm.fotoPerfil} onChange={v => setRegForm({ ...regForm, fotoPerfil: v })} aspectRatio="1/1" icon="🤳" />

            {/* Foto do RG (exceto gestor) */}
            {regForm.role !== "gestor" && (
              <PhotoCapture label="Foto do RG (frente obrigatória) *" value={regForm.fotoRg} onChange={v => setRegForm({ ...regForm, fotoRg: v })} aspectRatio="16/9" icon="🪪" />
            )}

            {[
              { label: "Nome completo *", field: "nome", placeholder: "Nome Sobrenome" },
              { label: "E-mail *", field: "email", placeholder: "email@exemplo.com", type: "email" },
              { label: "Senha *", field: "senha", placeholder: "Mínimo 4 caracteres", type: "password" },
              { label: "Empresa / Nome da Batedeira *", field: "empresa", placeholder: "Nome da empresa" },
              { label: "Cargo", field: "cargo", placeholder: "Ex: Proprietário, Motorista..." },
              { label: "Telefone", field: "telefone", placeholder: "(91) 99999-9999", type: "tel" },
              { label: "Endereço", field: "endereco", placeholder: "Rua, número" },
              { label: "Bairro", field: "bairro", placeholder: "Bairro" },
              { label: "Cidade", field: "cidade", placeholder: "Cidade" },
              { label: "CPF", field: "cpf", placeholder: "000.000.000-00" },
              ...(regForm.role === "empresa" ? [{ label: "CNPJ", field: "cnpj", placeholder: "00.000.000/0001-00" }, { label: "Nº do RG", field: "rg", placeholder: "0000000" }] : []),
              ...(regForm.role === "coletor" ? [{ label: "CNH", field: "cnh", placeholder: "Número CNH" }, { label: "Veículo", field: "veiculo", placeholder: "Modelo - Placa" }, { label: "Nº do RG", field: "rg", placeholder: "0000000" }] : []),
            ].map(({ label, field, placeholder, type }) => (
              <div key={field}>
                <label className="lbl">{label}</label>
                <input className="inp" type={type || "text"} placeholder={placeholder} value={regForm[field] || ""} onChange={e => setRegForm({ ...regForm, [field]: e.target.value })} />
              </div>
            ))}

            <button className="btn btn-p w100" style={{ padding: 16, marginTop: 4 }} onClick={handleRegisterUser}>
              ✅ Cadastrar Usuário
            </button>
          </div>
        </Sheet>
      )}

      {/* Editar perfil */}
      {sheet === "editProfile" && (
        <Sheet title="✏️ Editar Perfil" onClose={closeSheet}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PhotoCapture label="Foto de perfil" value={editForm.fotoPerfil} onChange={v => setEditForm({ ...editForm, fotoPerfil: v })} aspectRatio="1/1" icon="🤳" />
            {u?.role !== "gestor" && (
              <PhotoCapture label="Foto do RG" value={editForm.fotoRg} onChange={v => setEditForm({ ...editForm, fotoRg: v })} aspectRatio="16/9" icon="🪪" />
            )}
            {[
              { label: "Nome", field: "nome" },
              { label: "Telefone", field: "telefone", type: "tel" },
              { label: "Endereço", field: "endereco" },
              { label: "Bairro", field: "bairro" },
              { label: "Cidade", field: "cidade" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="lbl">{label}</label>
                <input className="inp" type={type || "text"} value={editForm[field] || ""} onChange={e => setEditForm({ ...editForm, [field]: e.target.value })} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-o" style={{ flex: 1 }} onClick={closeSheet}>Cancelar</button>
              <button className="btn btn-p" style={{ flex: 1 }} onClick={handleSaveProfile}>💾 Salvar</button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}