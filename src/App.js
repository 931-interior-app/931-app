import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  Lock,
  MapPin,
  Phone,
  Calendar,
  FileText,
  ChevronRight,
  Image as ImageIcon,
  Hammer,
  ClipboardList,
  Home,
  Bell,
  Plus,
  Camera,
  Send,
  Palette,
  Briefcase,
  X,
  MessageSquare,
  CheckCircle,
  ShoppingCart,
  Truck,
  Shield,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * ✅ "내일부터 바로 쓰는" 로컬 저장형 MVP
 * - 관리자/권한(ADMIN / MANAGER / WORKER)
 * - 현장 등록/수정/삭제
 * - AS 등록/수정/상태 변경
 * - 사용자(직원) 계정 생성/비번 설정
 * - Tailwind + Kakao-ish UI
 *
 * ⚠️ 저장소가 localStorage라서
 *   - 같은 폰/브라우저에서만 데이터 유지됩니다.
 *   - 나중에 서버/파이어베이스로 쉽게 옮기도록 구조화해뒀습니다.
 */

const LS_KEY = "931_APP_DATA_V2"; // V2로 올려서 기존 깨진 데이터 영향 최소화

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveStore(store) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

function nowISO() {
  return new Date().toISOString();
}

function fmtKR(iso) {
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return "";
  }
}

/** 간단한 해시(보안용 아님: 로컬 MVP용) */
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h);
}

const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  WORKER: "WORKER",
};

const ROLE_LABEL = {
  ADMIN: "관리자",
  MANAGER: "현장소장",
  WORKER: "작업자",
};

const DEMO_SITES = [
  {
    id: "s1",
    name: "천안 불당동 푸르지오 304호",
    address: "충남 천안시 서북구 불당동",
    status: "ongoing",
    startDate: "2026-01-10",
    endDate: "2026-02-15",
    managerId: "u_manager_demo",
    memo: "현관/주방 집중",
    createdAt: nowISO(),
  },
  {
    id: "s2",
    name: "아산 탕정 아파트",
    address: "충남 아산시 탕정면",
    status: "ongoing",
    startDate: "2026-01-05",
    endDate: "2026-02-20",
    managerId: "u_manager_demo",
    memo: "타일 수급 체크",
    createdAt: nowISO(),
  },
];

const DEMO_AS = [
  {
    id: "a1",
    siteId: "s1",
    issue: "주방 수전 물샘 현상",
    status: "scheduled", // scheduled | done
    date: "2026-01-12",
    time: "14:00",
    assignedTo: "u_worker_demo",
    customerName: "이수진",
    customerPhone: "010-0000-0000",
    note: "",
    createdAt: nowISO(),
  },
];

function ensureInitialStore() {
  const existing = loadStore();
  if (existing) return existing;

  const admin = {
    id: "u_admin",
    empId: "admin",
    name: "관리자",
    phone: "",
    role: ROLES.ADMIN,
    pwHash: hash("931931"),
    active: true,
    createdAt: nowISO(),
  };

  const managerDemo = {
    id: "u_manager_demo",
    empId: "manager",
    name: "김반장",
    phone: "010-0000-0000",
    role: ROLES.MANAGER,
    pwHash: hash("1234"),
    active: true,
    createdAt: nowISO(),
  };

  const workerDemo = {
    id: "u_worker_demo",
    empId: "worker",
    name: "최목수",
    phone: "010-0000-0000",
    role: ROLES.WORKER,
    pwHash: hash("1234"),
    active: true,
    createdAt: nowISO(),
  };

  const initial = {
    users: [admin, managerDemo, workerDemo],
    sites: DEMO_SITES,
    asList: DEMO_AS,
    siteLogsBySite: { s1: [], s2: [] },
    siteWorkersBySite: { s1: [], s2: [] },
    siteMaterialsBySite: { s1: [], s2: [] },
  };

  saveStore(initial);
  return initial;
}

/* ------------------------------
   UI Helpers
-------------------------------- */
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md k-card rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function TopBar({ title, right, onBack }) {
  return (
    <div className="sticky top-0 z-30 bg-[var(--bg)]">
      <div className="px-4 pt-3 pb-3 flex items-center gap-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border"
            style={{ borderColor: "var(--line)" }}
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex-1">
          <div className="k-title">{title}</div>
        </div>
        <div>{right}</div>
      </div>
      <div className="k-divider" />
    </div>
  );
}

/* ------------------------------
   Auth
-------------------------------- */
function LoginView({ onLogin }) {
  const [empId, setEmpId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const store = useMemo(() => ensureInitialStore(), []);
  const users = store.users ?? [];

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const u = users.find((x) => x.empId === empId && x.active);
    if (!u) return setError("아이디를 확인해 주세요.");
    if (u.pwHash !== hash(pw)) return setError("비밀번호를 확인해 주세요.");

    onLogin({ id: u.id, empId: u.empId, name: u.name, role: u.role });
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md k-card p-6">
        <div className="flex items-center justify-center mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--kakao-yellow)" }}
          >
            <Hammer className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="k-title">931인테리어</div>
          <div className="k-subtitle mt-1">현장 · AS 관리</div>
          <div className="mt-2 text-[12px] text-slate-500">
            기본 관리자: <b>admin</b> / <b>931931</b>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-[12px] font-bold text-slate-700">아이디</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                className="k-input pl-9"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="예: admin"
                autoCapitalize="none"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-slate-700">비밀번호</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="k-input pl-9"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호"
              />
            </div>
          </div>

          {error && <div className="text-[12px] text-red-600 font-bold">{error}</div>}

          <button className="k-btn k-btn-primary" type="submit">
            로그인
          </button>

          <div className="text-[12px] text-slate-500 leading-5">
            ※ 지금 버전은 로컬 저장형이라, 같은 기기/브라우저에서만 데이터가 유지됩니다.
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------
   Dashboard
-------------------------------- */
function Dashboard({ me, sites, asList, users, go }) {
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const ongoing = sites.filter((s) => s.status === "ongoing").length;
  const scheduled = asList.filter((a) => a.status === "scheduled").length;

  return (
    <div className="pb-20">
      <TopBar
        title="홈"
        right={
          <div className="flex items-center gap-2">
            <div className="k-chip">
              {me.role === ROLES.ADMIN ? <Shield className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
              {ROLE_LABEL[me.role]}
            </div>
            <button className="p-2 rounded-xl bg-white border" style={{ borderColor: "var(--line)" }}>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4">
        <div className="k-card p-4">
          <div className="text-[18px] font-extrabold tracking-[-0.02em]">
            안녕하세요, {me.name}님
          </div>
          <div className="k-subtitle mt-1">{today}</div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => go("sites")}
              className="k-card p-4 text-left active:scale-[0.99] transition"
            >
              <div className="text-[12px] font-bold text-slate-600 flex items-center gap-2">
                <Home className="w-4 h-4" /> 진행중 현장
              </div>
              <div className="mt-2 text-[28px] font-extrabold">{ongoing}<span className="text-[14px] font-bold text-slate-500 ml-1">곳</span></div>
            </button>

            <button
              onClick={() => go("as")}
              className="k-card p-4 text-left active:scale-[0.99] transition"
            >
              <div className="text-[12px] font-bold text-slate-600 flex items-center gap-2">
                <Hammer className="w-4 h-4" /> AS 예정
              </div>
              <div className="mt-2 text-[28px] font-extrabold">{scheduled}<span className="text-[14px] font-bold text-slate-500 ml-1">건</span></div>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[14px] font-extrabold">오늘 현장</div>
          <button onClick={() => go("sites")} className="text-[12px] font-bold text-slate-600">전체</button>
        </div>

        <div className="space-y-2">
          {sites.filter((s) => s.status === "ongoing").slice(0, 3).map((s) => (
            <button
              key={s.id}
              onClick={() => go("siteDetail", { siteId: s.id })}
              className="w-full k-card p-4 text-left flex items-center justify-between"
            >
              <div>
                <div className="text-[15px] font-extrabold">{s.name}</div>
                <div className="k-subtitle mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {s.address}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------
   Sites (List/Create/Edit)
-------------------------------- */
function SiteList({ me, sites, users, onCreate, onEdit, go }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim();
    if (!t) return sites;
    return sites.filter((s) => `${s.name} ${s.address}`.includes(t));
  }, [q, sites]);

  return (
    <div className="pb-20">
      <TopBar
        title="현장"
        right={
          (me.role === ROLES.ADMIN || me.role === ROLES.MANAGER) && (
            <button
              onClick={onCreate}
              className="p-2 rounded-xl bg-white border"
              style={{ borderColor: "var(--line)" }}
            >
              <Plus className="w-5 h-5" />
            </button>
          )
        }
      />

      <div className="px-4 pt-4">
        <input
          className="k-input"
          placeholder="현장 검색 (이름/주소)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="px-4 mt-3 space-y-2">
        {list.map((s) => {
          const managerName = users.find((u) => u.id === s.managerId)?.name ?? "미지정";
          return (
            <div key={s.id} className="k-card p-4">
              <button onClick={() => go("siteDetail", { siteId: s.id })} className="w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[15px] font-extrabold">{s.name}</div>
                    <div className="k-subtitle mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {s.address}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="k-chip">
                        <Calendar className="w-4 h-4" />
                        {s.startDate} ~ {s.endDate}
                      </span>
                      <span className="k-chip">
                        <Briefcase className="w-4 h-4" />
                        {managerName}
                      </span>
                      <span className="k-chip">
                        {s.status === "ongoing" ? "진행" : "완료"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 mt-1" />
                </div>
              </button>

              {(me.role === ROLES.ADMIN || me.role === ROLES.MANAGER) && (
                <div className="mt-3 flex gap-2">
                  <button className="k-btn k-btn-ghost py-2" onClick={() => onEdit(s)}>
                    수정
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SiteUpsertModal({ open, onClose, users, initial, onSave, onDelete }) {
  const isEdit = Boolean(initial?.id);
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [status, setStatus] = useState(initial?.status ?? "ongoing");
  const [managerId, setManagerId] = useState(initial?.managerId ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  useEffect(() => {
    setName(initial?.name ?? "");
    setAddress(initial?.address ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setStatus(initial?.status ?? "ongoing");
    setManagerId(initial?.managerId ?? "");
    setMemo(initial?.memo ?? "");
  }, [initial, open]);

  const managers = users.filter((u) => u.active && (u.role === ROLES.MANAGER || u.role === ROLES.ADMIN));

  const save = () => {
    if (!name.trim() || !address.trim() || !startDate || !endDate) return alert("필수값(이름/주소/기간)을 입력해 주세요.");
    const data = {
      id: initial?.id ?? uid("s"),
      name: name.trim(),
      address: address.trim(),
      startDate,
      endDate,
      status,
      managerId: managerId || "",
      memo: memo.trim(),
      createdAt: initial?.createdAt ?? nowISO(),
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4">
        <div className="text-[16px] font-extrabold">{isEdit ? "현장 수정" : "현장 등록"}</div>
        <div className="k-subtitle mt-1">내일부터 바로 현장 추가/관리 가능합니다.</div>

        <div className="mt-4 space-y-3">
          <input className="k-input" placeholder="현장명" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="k-input" placeholder="주소" value={address} onChange={(e) => setAddress(e.target.value)} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-1">시작일</div>
              <input type="date" className="k-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-700 mb-1">종료일</div>
              <input type="date" className="k-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select className="k-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ongoing">진행</option>
              <option value="completed">완료</option>
            </select>

            <select className="k-input" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
              <option value="">담당 소장(선택)</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({ROLE_LABEL[m.role]})
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="k-input"
            rows={3}
            placeholder="메모(선택) 예: 타일/가구 일정 주의"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          <button className="k-btn k-btn-primary" onClick={save}>
            {isEdit ? "수정 저장" : "등록"}
          </button>

          {isEdit && (
            <button
              className="k-btn k-btn-ghost"
              onClick={() => {
                if (window.confirm("이 현장을 삭제할까요? (연결된 AS/일지도 함께 정리됩니다)")) {
                  onDelete(initial.id);
                  onClose();
                }
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------
   AS (List/Create/Edit)
-------------------------------- */
function ASManager({ me, asList, sites, users, onCreate, onEdit }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim();
    if (!t) return asList;
    return asList.filter((a) => {
      const siteName = sites.find((s) => s.id === a.siteId)?.name ?? "";
      return `${siteName} ${a.issue} ${a.customerName}`.includes(t);
    });
  }, [q, asList, sites]);

  return (
    <div className="pb-20">
      <TopBar
        title="AS"
        right={
          (me.role === ROLES.ADMIN || me.role === ROLES.MANAGER) && (
            <button
              onClick={onCreate}
              className="p-2 rounded-xl bg-white border"
              style={{ borderColor: "var(--line)" }}
            >
              <Plus className="w-5 h-5" />
            </button>
          )
        }
      />

      <div className="px-4 pt-4">
        <input
          className="k-input"
          placeholder="AS 검색 (현장/내용/고객명)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="px-4 mt-3 space-y-2">
        {list.map((a) => {
          const siteName = sites.find((s) => s.id === a.siteId)?.name ?? "현장 미지정";
          const workerName = users.find((u) => u.id === a.assignedTo)?.name ?? "미지정";
          const badge =
            a.status === "scheduled"
              ? { text: "방문예정", bg: "bg-emerald-50", fg: "text-emerald-700" }
              : { text: "처리완료", bg: "bg-slate-100", fg: "text-slate-600" };

          return (
            <div key={a.id} className="k-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-[12px] font-extrabold ${badge.bg} ${badge.fg}`}>
                    {badge.text}
                  </div>
                  <div className="mt-2 text-[15px] font-extrabold">{siteName}</div>
                  <div className="k-subtitle mt-1">{a.issue}</div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="k-chip">
                      <Calendar className="w-4 h-4" />
                      {a.date} {a.time}
                    </span>
                    <span className="k-chip">
                      <Briefcase className="w-4 h-4" />
                      {workerName}
                    </span>
                    <span className="k-chip">
                      <User className="w-4 h-4" />
                      {a.customerName}
                    </span>
                  </div>
                </div>

                {(me.role === ROLES.ADMIN || me.role === ROLES.MANAGER) && (
                  <button
                    onClick={() => onEdit(a)}
                    className="p-2 rounded-xl bg-white border"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${a.customerPhone}`}
                  className="k-btn k-btn-ghost py-2 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> 고객 전화
                </a>

                {(me.role === ROLES.ADMIN || me.role === ROLES.MANAGER) && (
                  <button
                    onClick={() => onEdit(a)}
                    className="k-btn k-btn-primary py-2 flex items-center justify-center gap-2"
                  >
                    <Hammer className="w-4 h-4" /> 상세/수정
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ASUpsertModal({ open, onClose, sites, users, initial, onSave, onDelete }) {
  const isEdit = Boolean(initial?.id);

  const [siteId, setSiteId] = useState(initial?.siteId ?? (sites[0]?.id ?? ""));
  const [issue, setIssue] = useState(initial?.issue ?? "");
  const [status, setStatus] = useState(initial?.status ?? "scheduled");
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? "");
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone ?? "");
  const [note, setNote] = useState(initial?.note ?? "");

  useEffect(() => {
    setSiteId(initial?.siteId ?? (sites[0]?.id ?? ""));
    setIssue(initial?.issue ?? "");
    setStatus(initial?.status ?? "scheduled");
    setDate(initial?.date ?? "");
    setTime(initial?.time ?? "");
    setAssignedTo(initial?.assignedTo ?? "");
    setCustomerName(initial?.customerName ?? "");
    setCustomerPhone(initial?.customerPhone ?? "");
    setNote(initial?.note ?? "");
  }, [initial, open, sites]);

  const workers = users.filter((u) => u.active && u.role !== ROLES.ADMIN);

  const save = () => {
    if (!siteId || !issue.trim() || !date || !time || !customerName.trim() || !customerPhone.trim()) {
      return alert("필수값(현장/내용/일시/고객명/고객전화)을 입력해 주세요.");
    }
    const data = {
      id: initial?.id ?? uid("a"),
      siteId,
      issue: issue.trim(),
      status,
      date,
      time,
      assignedTo: assignedTo || "",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      note: note.trim(),
      createdAt: initial?.createdAt ?? nowISO(),
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4">
        <div className="text-[16px] font-extrabold">{isEdit ? "AS 수정" : "AS 등록"}</div>
        <div className="k-subtitle mt-1">현장 선택 → 일정 → 담당자 지정</div>

        <div className="mt-4 space-y-3">
          <select className="k-input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input className="k-input" placeholder="접수 내용 (예: 안방 문 걸림)" value={issue} onChange={(e) => setIssue(e.target.value)} />

          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="k-input" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" className="k-input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select className="k-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="scheduled">방문예정</option>
              <option value="done">처리완료</option>
            </select>

            <select className="k-input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">담당자(선택)</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({ROLE_LABEL[w.role]})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input className="k-input" placeholder="고객명" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className="k-input" placeholder="고객 전화번호" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>

          <textarea className="k-input" rows={3} placeholder="메모(선택)" value={note} onChange={(e) => setNote(e.target.value)} />

          <button className="k-btn k-btn-primary" onClick={save}>
            {isEdit ? "수정 저장" : "등록"}
          </button>

          {isEdit && (
            <button
              className="k-btn k-btn-ghost"
              onClick={() => {
                if (window.confirm("이 AS를 삭제할까요?")) {
                  onDelete(initial.id);
                  onClose();
                }
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------
   Admin (Users & Permissions)
-------------------------------- */
function AdminPanel({ me, users, onUpsertUser, onResetPw }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(ROLES.WORKER);
  const [active, setActive] = useState(true);
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (!open) return;
    const u = editing;
    setEmpId(u?.empId ?? "");
    setName(u?.name ?? "");
    setPhone(u?.phone ?? "");
    setRole(u?.role ?? ROLES.WORKER);
    setActive(u?.active ?? true);
    setPw("");
  }, [open, editing]);

  const save = () => {
    if (!empId.trim() || !name.trim()) return alert("아이디/이름은 필수입니다.");
    if (!editing && !pw.trim()) return alert("신규 생성은 비밀번호가 필요합니다.");

    onUpsertUser({
      id: editing?.id ?? uid("u"),
      empId: empId.trim(),
      name: name.trim(),
      phone: phone.trim(),
      role,
      active,
      pwHash: pw.trim() ? hash(pw.trim()) : editing?.pwHash,
      createdAt: editing?.createdAt ?? nowISO(),
    });

    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="pb-20">
      <TopBar title="관리자" right={<div className="k-chip"><Shield className="w-4 h-4" /> ADMIN</div>} />

      <div className="px-4 pt-4">
        <button
          className="k-btn k-btn-primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + 직원 계정 추가
        </button>
      </div>

      <div className="px-4 mt-3 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="k-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[15px] font-extrabold flex items-center gap-2">
                  {u.name}
                  <span className="k-chip">{ROLE_LABEL[u.role]}</span>
                  {!u.active && <span className="k-chip">비활성</span>}
                </div>
                <div className="k-subtitle mt-1">ID: {u.empId} · {u.phone || "전화 없음"}</div>
              </div>
              <button
                onClick={() => {
                  setEditing(u);
                  setOpen(true);
                }}
                className="p-2 rounded-xl bg-white border"
                style={{ borderColor: "var(--line)" }}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                className="k-btn k-btn-ghost py-2"
                onClick={() => {
                  const npw = prompt("새 비밀번호를 입력하세요(직원에게 전달):");
                  if (!npw) return;
                  onResetPw(u.id, npw);
                  alert("비밀번호가 변경되었습니다.");
                }}
              >
                비밀번호 재설정
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-4">
          <div className="text-[16px] font-extrabold">{editing ? "직원 수정" : "직원 추가"}</div>
          <div className="k-subtitle mt-1">권한 부여/비활성/비번 설정</div>

          <div className="mt-4 space-y-3">
            <input className="k-input" placeholder="아이디(사번)" value={empId} onChange={(e) => setEmpId(e.target.value)} />
            <input className="k-input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="k-input" placeholder="전화번호(선택)" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <select className="k-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value={ROLES.ADMIN}>관리자</option>
              <option value={ROLES.MANAGER}>현장소장</option>
              <option value={ROLES.WORKER}>작업자</option>
            </select>

            <label className="flex items-center gap-2 text-[13px] font-bold">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              계정 활성
            </label>

            <input
              className="k-input"
              placeholder={editing ? "비밀번호 변경 시에만 입력" : "초기 비밀번호"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type="password"
            />

            <button className="k-btn k-btn-primary" onClick={save}>
              저장
            </button>
            <button className="k-btn k-btn-ghost" onClick={() => setOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ------------------------------
   Site Detail (기존 기능 유지 + 확장 여지)
-------------------------------- */
function SiteDetail({ me, site, users, onBack }) {
  const managerName = users.find((u) => u.id === site.managerId)?.name ?? "미지정";
  return (
    <div className="pb-20">
      <TopBar title="현장 상세" onBack={onBack} />
      <div className="px-4 pt-4 space-y-3">
        <div className="k-card p-4">
          <div className="text-[16px] font-extrabold">{site.name}</div>
          <div className="k-subtitle mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {site.address}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="k-chip">
              <Calendar className="w-4 h-4" />
              {site.startDate} ~ {site.endDate}
            </span>
            <span className="k-chip">
              <Briefcase className="w-4 h-4" />
              {managerName}
            </span>
            <span className="k-chip">{site.status === "ongoing" ? "진행" : "완료"}</span>
          </div>
          {site.memo ? <div className="mt-3 text-[13px] text-slate-700">메모: {site.memo}</div> : null}
        </div>

        <div className="k-card p-4">
          <div className="text-[14px] font-extrabold">다음 단계(확장)</div>
          <div className="k-subtitle mt-1">
            작업일지/사진 실제 저장, 작업자/자재를 현장별로 “실제 입력”으로 더 확장 가능합니다.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------
   App Root
-------------------------------- */
export default function App() {
  const [store, setStore] = useState(() => ensureInitialStore());
  const [me, setMe] = useState(null);

  // navigation state
  const [view, setView] = useState("dashboard");
  const [params, setParams] = useState({});

  // modals
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [siteEditing, setSiteEditing] = useState(null);

  const [asModalOpen, setAsModalOpen] = useState(false);
  const [asEditing, setAsEditing] = useState(null);

  const users = store.users ?? [];
  const sites = store.sites ?? [];
  const asList = store.asList ?? [];

  const persist = (next) => {
    setStore(next);
    saveStore(next);
  };

  const go = (nextView, nextParams = {}) => {
    setView(nextView);
    setParams(nextParams);
  };

  // ---- Site CRUD
  const saveSite = (site) => {
    const nextSites = sites.some((s) => s.id === site.id)
      ? sites.map((s) => (s.id === site.id ? site : s))
      : [site, ...sites];

    const next = {
      ...store,
      sites: nextSites,
      siteLogsBySite: { ...(store.siteLogsBySite ?? {}), [site.id]: store.siteLogsBySite?.[site.id] ?? [] },
      siteWorkersBySite: { ...(store.siteWorkersBySite ?? {}), [site.id]: store.siteWorkersBySite?.[site.id] ?? [] },
      siteMaterialsBySite: { ...(store.siteMaterialsBySite ?? {}), [site.id]: store.siteMaterialsBySite?.[site.id] ?? [] },
    };
    persist(next);
  };

  const deleteSite = (siteId) => {
    const nextSites = sites.filter((s) => s.id !== siteId);
    const nextAs = asList.filter((a) => a.siteId !== siteId);

    const logs = { ...(store.siteLogsBySite ?? {}) };
    const workers = { ...(store.siteWorkersBySite ?? {}) };
    const mats = { ...(store.siteMaterialsBySite ?? {}) };
    delete logs[siteId];
    delete workers[siteId];
    delete mats[siteId];

    persist({ ...store, sites: nextSites, asList: nextAs, siteLogsBySite: logs, siteWorkersBySite: workers, siteMaterialsBySite: mats });
  };

  // ---- AS CRUD
  const saveAS = (item) => {
    const nextAs = asList.some((a) => a.id === item.id)
      ? asList.map((a) => (a.id === item.id ? item : a))
      : [item, ...asList];

    persist({ ...store, asList: nextAs });
  };

  const deleteAS = (asId) => {
    persist({ ...store, asList: asList.filter((a) => a.id !== asId) });
  };

  // ---- Users admin
  const upsertUser = (u) => {
    // 아이디 중복 체크
    const dup = users.find((x) => x.empId === u.empId && x.id !== u.id);
    if (dup) return alert("이미 사용 중인 아이디(empId)입니다.");

    const nextUsers = users.some((x) => x.id === u.id) ? users.map((x) => (x.id === u.id ? u : x)) : [u, ...users];
    persist({ ...store, users: nextUsers });
  };

  const resetPw = (userId, newPw) => {
    const nextUsers = users.map((u) => (u.id === userId ? { ...u, pwHash: hash(newPw) } : u));
    persist({ ...store, users: nextUsers });
  };

  // logout clears session only
  const logout = () => {
    setMe(null);
    setView("dashboard");
    setParams({});
  };

  const currentSite = useMemo(() => {
    const siteId = params.siteId;
    if (!siteId) return null;
    return sites.find((s) => s.id === siteId) ?? null;
  }, [params, sites]);

  const content = useMemo(() => {
    if (!me) return <LoginView onLogin={(u) => { setMe(u); setView("dashboard"); }} />;

    if (view === "dashboard")
      return <Dashboard me={me} sites={sites} asList={asList} users={users} go={go} />;

    if (view === "sites")
      return (
        <SiteList
          me={me}
          sites={sites}
          users={users}
          go={go}
          onCreate={() => { setSiteEditing(null); setSiteModalOpen(true); }}
          onEdit={(s) => { setSiteEditing(s); setSiteModalOpen(true); }}
        />
      );

    if (view === "siteDetail" && currentSite)
      return <SiteDetail me={me} site={currentSite} users={users} onBack={() => go("sites")} />;

    if (view === "as")
      return (
        <ASManager
          me={me}
          asList={asList}
          sites={sites}
          users={users}
          onCreate={() => { setAsEditing(null); setAsModalOpen(true); }}
          onEdit={(a) => { setAsEditing(a); setAsModalOpen(true); }}
        />
      );

    if (view === "admin" && me.role === ROLES.ADMIN)
      return <AdminPanel me={me} users={users} onUpsertUser={upsertUser} onResetPw={resetPw} />;

    return <Dashboard me={me} sites={sites} asList={asList} users={users} go={go} />;
  }, [me, view, params, sites, asList, users, currentSite]);

  const showNav = Boolean(me);

  return (
    <div className="bg-[var(--bg)] w-full min-h-[100dvh] text-slate-900 flex flex-col">
      <main className="flex-1 overflow-y-auto pb-20">{content}</main>

      {/* Modals */}
      <SiteUpsertModal
        open={siteModalOpen}
        onClose={() => setSiteModalOpen(false)}
        users={users}
        initial={siteEditing}
        onSave={saveSite}
        onDelete={deleteSite}
      />

      <ASUpsertModal
        open={asModalOpen}
        onClose={() => setAsModalOpen(false)}
        sites={sites}
        users={users}
        initial={asEditing}
        onSave={saveAS}
        onDelete={deleteAS}
      />

      {/* Bottom Nav */}
      {showNav && (
        <nav
          className="fixed bottom-0 left-0 w-full h-16 bg-white border-t flex justify-around items-center px-2 z-40"
          style={{ borderColor: "var(--line)" }}
        >
          <NavBtn
            active={view === "dashboard"}
            label="홈"
            icon={<Home className="w-6 h-6" />}
            onClick={() => go("dashboard")}
          />
          <NavBtn
            active={view === "sites"}
            label="현장"
            icon={<ClipboardList className="w-6 h-6" />}
            onClick={() => go("sites")}
          />
          <NavBtn
            active={view === "as"}
            label="AS"
            icon={<Hammer className="w-6 h-6" />}
            onClick={() => go("as")}
          />
          {me.role === ROLES.ADMIN ? (
            <NavBtn
              active={view === "admin"}
              label="관리자"
              icon={<Users className="w-6 h-6" />}
              onClick={() => go("admin")}
            />
          ) : (
            <NavBtn
              active={false}
              label="로그아웃"
              icon={<LogOut className="w-6 h-6" />}
              onClick={logout}
            />
          )}
        </nav>
      )}
    </div>
  );
}

function NavBtn({ active, label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
        active ? "text-black" : "text-slate-400"
      }`}
      style={active ? { color: "var(--kakao-black)" } : {}}
    >
      <div className={`${active ? "" : ""}`}>{icon}</div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
