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
  Search,
  Plus,
  Camera,
  Send,
  Palette,
  Briefcase,
  X,
  MessageSquare,
  CheckCircle,
  PlayCircle,
  ShoppingCart,
  Truck,
} from "lucide-react";

/**
 * ✅ Vercel 배포용 단일 파일 버전 (모바일 최적화 완료)
 * - 100dvh 적용으로 모바일 브라우저 주소창 문제 해결
 * - 텍스트 선택 방지, 터치 액션 최적화
 * - Firebase 없이 localStorage로 즉시 실행 가능
 */

// ------------------------------
// localStorage helpers (내 폰에 저장하는 기능)
// ------------------------------
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

// ------------------------------
// 초기 데모 데이터 (앱 처음 켤 때 보이는 가짜 데이터)
// ------------------------------
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
// 1. 로그인 화면
// ------------------------------
const LoginView = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (mode === "login") {
        if (empId && password) {
          onLogin({ name: "김반장", role: "현장소장", id: empId });
        } else {
          setError("사번과 비밀번호를 입력해주세요.");
        }
      } else {
        if (name && phone && password) {
          alert("가입 신청이 완료되었습니다.\n관리자 승인 후 로그인 가능합니다.(현재는 데모 화면)");
          setMode("login");
        } else {
          setError("모든 정보를 입력해주세요.");
        }
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            <Hammer className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">931인테리어</h2>
        <p className="text-center text-slate-500 mb-8">{mode === "login" ? "현장 관리 시스템" : "신규 직원 가입 신청"}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">휴대폰 번호</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="010-0000-0000"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{mode === "login" ? "사원번호" : "희망 사원번호(아이디)"}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="사원번호 입력"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="비밀번호 입력"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md transform active:scale-95 flex justify-center items-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === "login" ? "로그인" : "가입 신청하기"}
          </button>
        </form>

        <div className="mt-6 flex justify-center text-sm">
          {mode === "login" ? (
            <button onClick={() => setMode("signup")} className="text-slate-500 hover:text-blue-600 transition">
              새로 오셨나요? <span className="font-bold underline">가입 신청</span>
            </button>
          ) : (
            <button onClick={() => setMode("login")} className="text-slate-500 hover:text-blue-600 transition">
              이미 계정이 있나요? <span className="font-bold underline">로그인</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------------------
// 2. 대시보드
// ------------------------------
const Dashboard = ({ user, sites, asList, setView, setCurrentSite }) => {
  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });
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
          <div className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200 transition">
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setView("sites")}
            className="bg-blue-50 p-4 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition shadow-sm hover:shadow-md"
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
            className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition shadow-sm hover:shadow-md"
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
          <h2 className="text-lg font-bold text-slate-800">진행중인 현장 (오늘)</h2>
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
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer active:scale-98 transition hover:bg-slate-50"
            >
              <div>
                <h3 className="font-bold text-slate-800">{site.name}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" /> {site.address}
                </p>
              </div>
              <ChevronRight className="text-slate-300 w-5 h-5" />
            </div>
          ))}
          {ongoingSites.length === 0 && <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed">진행중인 현장이 없습니다.</div>}
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
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-md font-medium">{a.time}</span>
                <span className="text-xs text-slate-400">{a.customerName}</span>
              </div>
              <h3 className="font-bold text-slate-800">{a.siteName}</h3>
              <p className="text-sm text-slate-600 mt-1">{a.issue}</p>
            </div>
          ))}
          {todayAs.length === 0 && <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed">금일 예정된 AS가 없습니다.</div>}
        </div>
      </div>
    </div>
  );
};

// ------------------------------
// 3. 현장 목록
// ------------------------------
const SiteList = ({ sites, setCurrentSite, setView }) => {
  const [filter, setFilter] = useState("all");

  const filteredSites = sites.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

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
            className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer active:scale-98 transition border border-slate-100 hover:shadow-md"
          >
            <div className="h-24 bg-slate-200 relative">
              <img src={site.imageUrl || "https://placehold.co/600x200/e2e8f0/94a3b8?text=Site+Photo"} alt="Site" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-bold rounded-md ${site.status === "ongoing" ? "bg-blue-500 text-white" : "bg-slate-500 text-white"}`}>
                  {site.status === "ongoing" ? "시공중" : "완료"}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-slate-800">{site.name}</h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" /> {site.address}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
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
};

// ------------------------------
// 4. 현장 상세 (로컬저장소 기반)
// ------------------------------
const SiteDetail = ({ site, user, onBack, store, setStore }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const logs = store.siteLogsBySite?.[site.id] ?? [];
  const workers = store.siteWorkersBySite?.[site.id] ?? [];
  const materials = store.siteMaterialsBySite?.[site.id] ?? [];

  const [newLogText, setNewLogText] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [openCommentId, setOpenCommentId] = useState(null);

  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState("");
  const [newWorkerPhone, setNewWorkerPhone] = useState("");

  const [newMaterialLoc, setNewMaterialLoc] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);

  const updateStore = (next) => {
    setStore(next);
    saveStore(next);
  };

  const handleAddLog = () => {
    if (!newLogText.trim()) return;

    const hasImageCamera = cameraInputRef.current?.files?.length > 0;
    const hasImageGallery = galleryInputRef.current?.files?.length > 0;

    const newLog = {
      id: uid("log"),
      siteId: site.id,
      text: newLogText,
      author: user.name,
      createdAt: new Date().toISOString(),
      hasImage: Boolean(hasImageCamera || hasImageGallery),
      checks: [],
      comments: [],
    };

    const next = {
      ...store,
      siteLogsBySite: {
        ...store.siteLogsBySite,
        [site.id]: [newLog, ...(store.siteLogsBySite?.[site.id] ??