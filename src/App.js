import React, { useMemo, useRef, useState } from "react";
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
} from "lucide-react";

/**
 * ✅ Vercel 배포용(빌드 에러 없이) 단일 App.js
 * - Firebase 없이 localStorage로 저장
 * - 모바일 화면 전체 폭(w-full) + 100dvh
 */

const LS_KEY = "931_APP_DATA_V1";

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
function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const DEMO_SITES = [
  {
    id: "s1",
    name: "천안 불당동 푸르지오 304호",
    address: "충남 천안시 서북구 불당동",
    status: "ongoing",
    startDate: "2026.01.10",
    endDate: "2026.02.15",
    manager: "김반장",
    imageUrl: "https://placehold.co/600x200/e2e8f0/94a3b8?text=Site+Photo",
  },
  {
    id: "s2",
    name: "아산 탕정 아파트",
    address: "충남 아산시 탕정면",
    status: "ongoing",
    startDate: "2026.01.05",
    endDate: "2026.02.20",
    manager: "박팀장",
    imageUrl: "https://placehold.co/600x200/e2e8f0/94a3b8?text=Site+Photo",
  },
  {
    id: "s3",
    name: "판교 봇들마을 7단지",
    address: "경기 성남시 분당구 삼평동",
    status: "completed",
    startDate: "2025.11.01",
    endDate: "2025.12.20",
    manager: "이실장",
    imageUrl: "https://placehold.co/600x200/e2e8f0/94a3b8?text=Site+Photo",
  },
];

const DEMO_AS = [
  {
    id: "a1",
    siteName: "판교 봇들마을 7단지",
    issue: "주방 수전 물샘 현상",
    status: "scheduled",
    date: "2026.01.12",
    time: "14:00",
    assignedTo: "김설비",
    customerName: "이수진",
    customerPhone: "010-0000-0000",
  },
  {
    id: "a2",
    siteName: "동탄 롯데캐슬",
    issue: "안방 문 걸림",
    status: "scheduled",
    date: "2026.01.12",
    time: "16:30",
    assignedTo: "최목수",
    customerName: "박준형",
    customerPhone: "010-0000-0000",
  },
];

function ensureInitialStore() {
  const existing = loadStore();
  if (existing) return existing;

  const initial = {
    sites: DEMO_SITES,
    asList: DEMO_AS,
    siteLogsBySite: { s1: [], s2: [], s3: [] },
    siteWorkersBySite: { s1: [], s2: [], s3: [] },
    siteMaterialsBySite: { s1: [], s2: [], s3: [] },
  };
  saveStore(initial);
  return initial;
}

// ------------------------------
// Login
// ------------------------------
function LoginView({ onLogin }) {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (mode === "login") {
        if (!empId || !password) {
          setError("사원번호와 비밀번호를 입력해주세요.");
          setLoading(false);
          return;
        }
        onLogin({ id: empId, name: "김반장", role: "현장소장" });
      } else {
        if (!name || !phone || !password) {
          setError("모든 정보를 입력해주세요.");
          setLoading(false);
          return;
        }
        alert("가입 신청이 완료되었습니다.\n(현재는 데모 모드라 승인 절차는 생략됩니다.)");
        setMode("login");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            <Hammer className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-800">931인테리어</h1>
        <p className="text-center text-slate-500 mt-1 mb-8">
          {mode === "login" ? "현장 관리 시스템" : "신규 직원 가입 신청"}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                <input
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">휴대폰 번호</label>
                <input
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {mode === "login" ? "사원번호" : "희망 사원번호(아이디)"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="사원번호 입력"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md active:scale-95 transition flex justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              "로그인"
            ) : (
              "가입 신청하기"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <button className="text-slate-500 hover:text-blue-600" onClick={() => setMode("signup")}>
              새로 오셨나요? <span className="font-bold underline">가입 신청</span>
            </button>
          ) : (
            <button className="text-slate-500 hover:text-blue-600" onClick={() => setMode("login")}>
              이미 계정이 있나요? <span className="font-bold underline">로그인</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------
// Dashboard
// ------------------------------
function Dashboard({ user, sites, asList, setView, setCurrentSite }) {
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const ongoingSites = sites.filter((s) => s.status === "ongoing");
  const todayAs = asList.filter((a) => a.status === "scheduled");

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">안녕하세요, {user.name}님</h1>
            <p className="text-slate-500 text-sm">{today}</p>
          </div>
          <div className="bg-slate-100 p-2 rounded-full">
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setView("sites")}
            className="bg-blue-50 p-4 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">진행중 현장</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {ongoingSites.length}
              <span className="text-base font-normal text-blue-500 ml-1">곳</span>
            </p>
          </div>

          <div
            onClick={() => setView("as")}
            className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Hammer className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">AS 일정</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">
              {todayAs.length}
              <span className="text-base font-normal text-emerald-500 ml-1">건</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-lg font-bold text-slate-800">진행중인 현장</h2>
          <button onClick={() => setView("sites")} className="text-sm text-blue-600 font-medium">
            전체보기
          </button>
        </div>

        <div className="space-y-3">
          {ongoingSites.slice(0, 3).map((site) => (
            <div
              key={site.id}
              onClick={() => {
                setCurrentSite(site);
                setView("siteDetail");
              }}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50"
            >
              <div>
                <h3 className="font-bold text-slate-800">{site.name}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {site.address}
                </p>
              </div>
              <ChevronRight className="text-slate-300 w-5 h-5" />
            </div>
          ))}
          {ongoingSites.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed">
              진행중인 현장이 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-lg font-bold text-slate-800">AS 예정</h2>
          <button onClick={() => setView("as")} className="text-sm text-blue-600 font-medium">
            전체보기
          </button>
        </div>

        <div className="space-y-3">
          {todayAs.slice(0, 3).map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-md font-medium">
                  {a.time}
                </span>
                <span className="text-xs text-slate-400">{a.customerName}</span>
              </div>
              <h3 className="font-bold text-slate-800">{a.siteName}</h3>
              <p className="text-sm text-slate-600 mt-1">{a.issue}</p>
            </div>
          ))}
          {todayAs.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed">
              금일 예정된 AS가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------
// Site list
// ------------------------------
function SiteList({ sites, setCurrentSite, setView }) {
  const [filter, setFilter] = useState("all");

  const filteredSites = sites.filter((s) => (filter === "all" ? true : s.status === filter));

  return (
    <div className="pb-20 pt-4 px-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">현장 목록</h2>

      <div className="flex space-x-2 mb-6">
        {["all", "ongoing", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {f === "all" ? "전체" : f === "ongoing" ? "진행중" : "완료됨"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredSites.map((site) => (
          <div
            key={site.id}
            onClick={() => {
              setCurrentSite(site);
              setView("siteDetail");
            }}
            className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border border-slate-100 hover:shadow-md"
          >
            <div className="h-24 bg-slate-200 relative">
              <img src={site.imageUrl} alt="Site" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-md ${
                    site.status === "ongoing" ? "bg-blue-500 text-white" : "bg-slate-500 text-white"
                  }`}
                >
                  {site.status === "ongoing" ? "시공중" : "완료"}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-slate-800">{site.name}</h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {site.address}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-400">터치하여 상세정보</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------
// Site detail (logs/workers/materials)
// ------------------------------
function SiteDetail({ site, user, onBack, store, setStore }) {
  const [activeTab, setActiveTab] = useState("info");
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const logs = store.siteLogsBySite?.[site.id] ?? [];
  const workers = store.siteWorkersBySite?.[site.id] ?? [];
  const materials = store.siteMaterialsBySite?.[site.id] ?? [];

  const [newLogText, setNewLogText] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [openCommentId, setOpenCommentId] = useState(null);

  const [newWorkerRole, setNewWorkerRole] = useState("");
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerPhone, setNewWorkerPhone] = useState("");

  const [newMaterialLoc, setNewMaterialLoc] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");

  const updateStore = (next) => {
    setStore(next);
    saveStore(next);
  };

  const addLog = () => {
    if (!newLogText.trim()) return;

    const hasImageCamera = cameraInputRef.current?.files?.length > 0;
    const hasImageGallery = galleryInputRef.current?.files?.length > 0;

    const newLog = {
      id: uid("log"),
      text: newLogText,
      author: user.name,
      createdAt: new Date().toISOString(),
      hasImage: Boolean(hasImageCamera || hasImageGallery),
      checks: [],
      comments: [],
    };

    const prev = store.siteLogsBySite?.[site.id] ?? [];
    const next = {
      ...store,
      siteLogsBySite: {
        ...store.siteLogsBySite,
        [site.id]: [newLog, ...prev],
      },
    };
    updateStore(next);

    setNewLogText("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const toggleCheck = (logId) => {
    const prevLogs = store.siteLogsBySite?.[site.id] ?? [];
    const nextLogs = prevLogs.map((l) => {
      if (l.id !== logId) return l;
      const checked = l.checks?.includes(user.name);
      const nextChecks = checked ? l.checks.filter((x) => x !== user.name) : [...(l.checks ?? []), user.name];
      return { ...l, checks: nextChecks };
    });

    const next = {
      ...store,
      siteLogsBySite: { ...store.siteLogsBySite, [site.id]: nextLogs },
    };
    updateStore(next);
  };

  const addComment = (logId) => {
    const text = (commentInputs[logId] ?? "").trim();
    if (!text) return;

    const prevLogs = store.siteLogsBySite?.[site.id] ?? [];
    const nextLogs = prevLogs.map((l) => {
      if (l.id !== logId) return l;
      const nextComments = [...(l.comments ?? []), { id: uid("c"), author: user.name, text, createdAt: new Date().toISOString() }];
      return { ...l, comments: nextComments };
    });

    const next = {
      ...store,
      siteLogsBySite: { ...store.siteLogsBySite, [site.id]: nextLogs },
    };
    updateStore(next);

    setCommentInputs((p) => ({ ...p, [logId]: "" }));
  };

  const addWorker = () => {
    if (!newWorkerRole.trim() || !newWorkerName.trim() || !newWorkerPhone.trim()) return;

    const prev = store.siteWorkersBySite?.[site.id] ?? [];
    const nextWorker = { id: uid("w"), role: newWorkerRole, name: newWorkerName, phone: newWorkerPhone };

    const next = {
      ...store,
      siteWorkersBySite: { ...store.siteWorkersBySite, [site.id]: [nextWorker, ...prev] },
    };
    updateStore(next);

    setNewWorkerRole("");
    setNewWorkerName("");
    setNewWorkerPhone("");
  };

  const addMaterial = () => {
    if (!newMaterialLoc.trim() || !newMaterialName.trim()) return;

    const prev = store.siteMaterialsBySite?.[site.id] ?? [];
    const nextMat = { id: uid("m"), location: newMaterialLoc, name: newMaterialName, status: "pending" };

    const next = {
      ...store,
      siteMaterialsBySite: { ...store.siteMaterialsBySite, [site.id]: [nextMat, ...prev] },
    };
    updateStore(next);

    setNewMaterialLoc("");
    setNewMaterialName("");
  };

  const toggleMaterial = (matId) => {
    const prev = store.siteMaterialsBySite?.[site.id] ?? [];
    const nextMats = prev.map((m) => (m.id === matId ? { ...m, status: m.status === "ordered" ? "pending" : "ordered" } : m));
    const next = { ...store, siteMaterialsBySite: { ...store.siteMaterialsBySite, [site.id]: nextMats } };
    updateStore(next);
  };

  const schedule = useMemo(() => {
    const out = [];
    const base = new Date();
    for (let i = -2; i <= 10; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" });
      let task = "현장 점검 및 양생";
      if (i === -2) task = "철거 공사";
      if (i === 0) task = "목공(가벽 설치) - 금일";
      if (i === 1) task = "목공(천장 덴조)";
      if (i === 2) task = "타일 시공";
      out.push({ date: dateStr, task, isToday: i === 0 });
    }
    return out;
  }, []);

  return (
    <div className="bg-slate-50 min-h-[100dvh] pb-20">
      <div className="relative h-48 bg-slate-800">
        <img src={site.imageUrl} className="w-full h-full object-cover opacity-60" alt="header" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
          <ChevronRight className="rotate-180 w-6 h-6" />
        </button>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-sm opacity-90">{site.address}</p>
        </div>
      </div>

      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 overflow-x-auto">
        {["info", "blueprint", "workers", "materials"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition min-w-[90px] ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
            }`}
          >
            {tab === "info" ? "현장정보" : tab === "blueprint" ? "도면" : tab === "workers" ? "작업자" : "마감재"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "info" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800">공사 개요</h3>
                <button
                  onClick={() => alert("일정표는 아래에 표시됩니다(데모).")}
                  className="flex items-center text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold border border-blue-100"
                >
                  <Calendar className="w-3 h-3 mr-1" /> 일정표 보기
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">기간</span>
                  <span className="text-slate-800 font-medium">
                    {site.startDate} ~ {site.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">담당자</span>
                  <span className="text-slate-800 font-medium">{site.manager}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">작업 일지</h3>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                <textarea
                  value={newLogText}
                  onChange={(e) => setNewLogText(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none resize-none mb-2"
                  rows={2}
                  placeholder="작업 내용/특이사항 입력..."
                />

                <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" />
                <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" />

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-slate-500 hover:text-blue-600 p-1.5 rounded bg-white border border-slate-200 flex items-center space-x-1"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-xs">촬영</span>
                    </button>
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="text-slate-500 hover:text-blue-600 p-1.5 rounded bg-white border border-slate-200 flex items-center space-x-1"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs">앨범</span>
                    </button>
                  </div>
                  <button
                    onClick={addLog}
                    disabled={!newLogText.trim()}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                      !newLogText.trim() ? "bg-slate-200 text-slate-400" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <Send className="w-3 h-3 mr-1" /> 등록
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {logs.map((log) => {
                  const checked = log.checks?.includes(user.name);
                  const isOpen = openCommentId === log.id;

                  return (
                    <div key={log.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-sm text-slate-800">{log.author}</div>
                          <div className="text-[10px] text-slate-400">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString("ko-KR") : ""}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{log.text}</p>

                      {log.hasImage && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-slate-100">
                          <img
                            src="https://placehold.co/400x300/e2e8f0/94a3b8?text=Photo"
                            alt="attachment"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          onClick={() => toggleCheck(log.id)}
                          className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-full transition ${
                            checked ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{checked ? "확인완료" : "확인"}</span>
                          {log.checks?.length ? <span className="text-[10px]">({log.checks.length})</span> : null}
                        </button>

                        <button
                          onClick={() => setOpenCommentId(isOpen ? null : log.id)}
                          className="flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>댓글</span>
                          {log.comments?.length ? <span>({log.comments.length})</span> : null}
                        </button>
                      </div>

                      {(isOpen || (log.comments?.length ?? 0) > 0) && (
                        <div className="mt-3 bg-slate-50 p-3 rounded-lg">
                          {(log.comments ?? []).map((c) => (
                            <div key={c.id} className="text-xs mb-2 last:mb-0">
                              <span className="font-bold text-slate-700 mr-1">{c.author}:</span>
                              <span className="text-slate-600">{c.text}</span>
                            </div>
                          ))}

                          {isOpen && (
                            <div className="flex mt-3 relative">
                              <input
                                className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                                placeholder="댓글 달기..."
                                value={commentInputs[log.id] ?? ""}
                                onChange={(e) => setCommentInputs((p) => ({ ...p, [log.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") addComment(log.id);
                                }}
                              />
                              <button
                                onClick={() => addComment(log.id)}
                                className="absolute right-1 top-1 p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3">공사 일정(데모)</h3>
                <div className="space-y-2">
                  {schedule.map((it, idx) => (
                    <div
                      key={idx}
                      className={`flex p-3 rounded-lg border ${
                        it.isToday ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className={`w-20 font-bold ${it.isToday ? "text-blue-200" : "text-slate-400"}`}>{it.date}</div>
                      <div className="flex-1 font-bold pl-4 border-l border-white/20">{it.task}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "blueprint" && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3">등록된 도면</h3>
            <div
              onClick={() => setShowBlueprintModal(true)}
              className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"
            >
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">전체 평면도 보기</span>
            </div>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center">
                <Plus className="w-4 h-4 mr-1 text-blue-600" />
                작업자 추가
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  className="p-2 bg-slate-50 rounded border text-sm"
                  placeholder="공정"
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                />
                <input
                  className="col-span-2 p-2 bg-slate-50 rounded border text-sm"
                  placeholder="이름"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <input
                  className="flex-1 p-2 bg-slate-50 rounded border text-sm"
                  placeholder="전화번호"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                />
                <button onClick={addWorker} className="bg-slate-800 text-white px-4 rounded font-bold text-sm">
                  등록
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {workers.map((w) => (
                <div key={w.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-800">{w.name}</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {w.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{w.phone}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${w.phone}`}
                    className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600 transition shadow-md"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center">
                <Plus className="w-4 h-4 mr-1 text-purple-600" />
                마감재 입력
              </h3>
              <div className="space-y-2">
                <input
                  className="w-full p-2 bg-slate-50 rounded border text-sm"
                  placeholder="위치 (예: 거실 아트월)"
                  value={newMaterialLoc}
                  onChange={(e) => setNewMaterialLoc(e.target.value)}
                />
                <div className="flex space-x-2">
                  <input
                    className="flex-1 p-2 bg-slate-50 rounded border text-sm"
                    placeholder="자재명 (예: 동화마루)"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                  />
                  <button onClick={addMaterial} className="bg-slate-800 text-white px-4 rounded font-bold text-sm">
                    저장
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {materials.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-1">{m.location}</p>
                      <h3 className="text-sm font-bold text-slate-800">{m.name}</h3>
                    </div>
                    <Palette className="w-5 h-5 text-purple-200" />
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-end">
                    <button
                      onClick={() => toggleMaterial(m.id)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        m.status === "ordered" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.status === "ordered" ? (
                        <>
                          <Truck className="w-3 h-3 mr-1" />
                          주문완료
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          주문대기
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showBlueprintModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-center items-center p-2"
          onClick={() => setShowBlueprintModal(false)}
        >
          <img
            src="https://placehold.co/1024x768/202020/ffffff?text=BLUEPRINT+VIEW"
            alt="blueprint"
            className="max-w-full max-h-screen object-contain"
          />
          <p className="text-white mt-4 text-sm">닫으려면 화면을 터치하세요</p>
        </div>
      )}
    </div>
  );
}

// ------------------------------
// AS manager
// ------------------------------
function ASManager({ asList }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="pb-20 pt-4 px-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">AS 관리</h2>

      <div className="space-y-4">
        {asList.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelected(a)}
            className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500 cursor-pointer hover:bg-emerald-50 transition"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                {a.status === "scheduled" ? "방문예정" : "처리완료"}
              </span>
              <span className="text-xs text-slate-400">
                {a.date} {a.time}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">{a.siteName}</h3>
            <p className="text-sm text-slate-600 mb-3">{a.issue}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                  {a.assignedTo?.[0] ?? "담"}
                </div>
                <span className="text-xs text-slate-500">담당: {a.assignedTo}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center">
                <ImageIcon className="w-3 h-3 mr-1" /> 미디어(데모)
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{selected.siteName}</h3>
                <p className="text-sm opacity-90">AS 접수 상세</p>
              </div>
              <button onClick={() => setSelected(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-400 mb-1 block">고객 정보</label>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-lg">{selected.customerName}</span>
                  <a
                    href={`tel:${selected.customerPhone}`}
                    className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center hover:bg-green-600"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    전화걸기
                  </a>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {selected.date} {selected.time} 방문예정
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">접수 내용</label>
                <p className="text-slate-800 bg-white border border-slate-100 p-3 rounded-lg text-sm">{selected.issue}</p>
              </div>

              <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700">
                처리 완료로 변경(데모)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------
// App root
// ------------------------------
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [currentSite, setCurrentSite] = useState(null);

  const [store, setStore] = useState(() => ensureInitialStore());

  const sites = store.sites ?? [];
  const asList = store.asList ?? [];

  const content = useMemo(() => {
    if (!user) return <LoginView onLogin={setUser} />;

    if (view === "dashboard") return <Dashboard user={user} sites={sites} asList={asList} setView={setView} setCurrentSite={setCurrentSite} />;
    if (view === "sites") return <SiteList sites={sites} setCurrentSite={setCurrentSite} setView={setView} />;
    if (view === "siteDetail" && currentSite)
      return <SiteDetail site={currentSite} user={user} onBack={() => setView("dashboard")} store={store} setStore={setStore} />;
    if (view === "as") return <ASManager asList={asList} />;

    return <Dashboard user={user} sites={sites} asList={asList} setView={setView} setCurrentSite={setCurrentSite} />;
  }, [user, view, currentSite, sites, asList, store]);

  return (
  <div className="bg-slate-100 w-full min-h-[100dvh] font-sans text-slate-900 flex flex-col">
    {/* 상태바 영역 */}
    <div className="h-2 bg-slate-900 w-full shrink-0" />

    {/* 메인 콘텐츠 (여기만 스크롤) */}
    <main className="flex-1 overflow-y-auto pb-20">
      {content}
    </main>

    {/* 하단 네비게이션 */}
    {user && view !== "siteDetail" && (
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-200 flex justify-around items-center px-2 z-40">
        <button
          onClick={() => setView("dashboard")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            view === "dashboard" ? "text-blue-600" : "text-slate-400"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">홈</span>
        </button>

        <button
          onClick={() => setView("sites")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            view === "sites" ? "text-blue-600" : "text-slate-400"
          }`}
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-[10px] font-medium">현장목록</span>
        </button>

        <button
          onClick={() => setView("as")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            view === "as" ? "text-blue-600" : "text-slate-400"
          }`}
        >
          <Hammer className="w-6 h-6" />
          <span className="text-[10px] font-medium">AS관리</span>
        </button>

        <button
          onClick={() => setUser(null)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">로그아웃</span>
        </button>
      </nav>
    )}
  </div>
);

