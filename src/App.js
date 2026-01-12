import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, MapPin, Phone, Calendar, FileText, 
  CheckSquare, LogOut, ChevronRight, Image as ImageIcon,
  Hammer, ClipboardList, Home, Bell, Search, Plus, Camera, Send,
  Palette, Briefcase, X, MessageSquare, ThumbsUp, CheckCircle,
  Video, PlayCircle, FolderOpen, ShoppingCart, Truck
} from 'lucide-react';

// Firebase Imports (실제 배포 시 사용됨)
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

// --- Firebase Initialization ---
// 이 부분은 캔버스 환경에서 자동으로 주입되는 설정입니다.
// 실제 배포 시에는 본인의 Firebase 프로젝트 설정으로 교체해야 합니다.
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Components ---

// 1. 로그인 & 회원가입 화면
const LoginView = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 데모 로직: 실제로는 Firebase Auth로 처리
    setTimeout(() => {
        if (mode === 'login') {
            if (empId && password) {
               // 데모: 어떤 아이디든 로그인 허용
               onLogin({ name: '김반장', role: '현장소장', id: empId });
            } else {
              setError('사번과 비밀번호를 입력해주세요.');
            }
        } else {
            // 회원가입 신청 시뮬레이션
            if(name && phone && password) {
                alert("가입 신청이 완료되었습니다.\n관리자(대표님) 승인 후 로그인 가능합니다.");
                setMode('login');
            } else {
                setError("모든 정보를 입력해주세요.");
            }
        }
        setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            <Hammer className="w-8 h-8 text-white" />
          </div>
        </div>
        {/* 회사명 931인테리어 적용 */}
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">931인테리어</h2>
        <p className="text-center text-slate-500 mb-8">
            {mode === 'login' ? '현장 관리 시스템' : '신규 직원 가입 신청'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
              <>
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="홍길동"/>
                </div>
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-1">휴대폰 번호</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="010-0000-0000"/>
                </div>
              </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{mode === 'login' ? '사원번호' : '희망 사원번호(아이디)'}</label>
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
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (mode === 'login' ? '로그인' : '가입 신청하기')}
          </button>
        </form>

        <div className="mt-6 flex justify-center text-sm">
            {mode === 'login' ? (
                <button onClick={() => setMode('signup')} className="text-slate-500 hover:text-blue-600 transition">
                    새로 오셨나요? <span className="font-bold underline">가입 신청</span>
                </button>
            ) : (
                <button onClick={() => setMode('login')} className="text-slate-500 hover:text-blue-600 transition">
                    이미 계정이 있나요? <span className="font-bold underline">로그인</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

// 2. 대시보드 화면
const Dashboard = ({ user, sites, asList, setView, setCurrentSite }) => {
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  const ongoingSites = sites.filter(s => s.status === 'ongoing');
  const todayAs = asList.filter(as => as.status === 'scheduled');

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setView('sites')}
            className="bg-blue-50 p-4 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition shadow-sm hover:shadow-md"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">진행중 현장</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{ongoingSites.length}<span className="text-base font-normal text-blue-500 ml-1">곳</span></p>
          </div>
          <div 
            onClick={() => setView('as')}
            className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition shadow-sm hover:shadow-md"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Hammer className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">AS 일정</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{todayAs.length}<span className="text-base font-normal text-emerald-500 ml-1">건</span></p>
          </div>
        </div>
      </div>

      {/* Ongoing Sites Preview */}
      <div className="px-4">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-lg font-bold text-slate-800">진행중인 현장 (오늘)</h2>
          <button onClick={() => setView('sites')} className="text-sm text-blue-600 font-medium">전체보기</button>
        </div>
        <div className="space-y-3">
          {ongoingSites.slice(0, 3).map(site => (
            <div 
              key={site.id} 
              onClick={() => { setCurrentSite(site); setView('siteDetail'); }}
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
          {ongoingSites.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed">
              진행중인 현장이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* AS List Preview */}
      <div className="px-4">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-lg font-bold text-slate-800">AS 예정</h2>
          <button onClick={() => setView('as')} className="text-sm text-blue-600 font-medium">전체보기</button>
        </div>
        <div className="space-y-3">
          {todayAs.slice(0, 3).map(as => (
            <div key={as.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-md font-medium">
                  {as.time}
                </span>
                <span className="text-xs text-slate-400">{as.customerName}</span>
              </div>
              <h3 className="font-bold text-slate-800">{as.siteName}</h3>
              <p className="text-sm text-slate-600 mt-1">{as.issue}</p>
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
};

// 3. 현장 목록 화면
const SiteList = ({ sites, setCurrentSite, setView }) => {
  const [filter, setFilter] = useState('all'); // all, ongoing, completed

  const filteredSites = sites.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="pb-20 pt-4 px-4 h-full overflow-y-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">현장 목록</h2>
      
      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {['all', 'ongoing', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {f === 'all' ? '전체' : f === 'ongoing' ? '진행중' : '완료됨'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredSites.map(site => (
          <div 
            key={site.id}
            onClick={() => { setCurrentSite(site); setView('siteDetail'); }}
            className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer active:scale-98 transition border border-slate-100 hover:shadow-md"
          >
            <div className="h-24 bg-slate-200 relative">
               <img src={site.imageUrl || "https://placehold.co/600x200/e2e8f0/94a3b8?text=Site+Photo"} alt="Site" className="w-full h-full object-cover" />
               <div className="absolute top-2 right-2">
                 <span className={`px-2 py-1 text-xs font-bold rounded-md ${site.status === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'}`}>
                   {site.status === 'ongoing' ? '시공중' : '완료'}
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
                   {[1,2,3].map(i => (
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

// 4. 현장 상세 화면
const SiteDetail = ({ site, user, onBack }) => {
  const [activeTab, setActiveTab] = useState('info'); // info, blueprint, workers, materials
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [newLogText, setNewLogText] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [openCommentId, setOpenCommentId] = useState(null);

  // Workers & Materials State
  const [workers, setWorkers] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  // Inputs
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState(''); 
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newMaterialLoc, setNewMaterialLoc] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  
  // Material Loading State
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);

  // Refs for two types of inputs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // --- Fetch Logs, Workers, Materials ---
  useEffect(() => {
      const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'site_logs');
      const q = query(logsRef, where('siteId', '==', site.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          loadedLogs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setLogs(loadedLogs);
      });
      return () => unsubscribe();
  }, [site.id]);

  useEffect(() => {
      const workersRef = collection(db, 'artifacts', appId, 'public', 'data', 'site_workers');
      const q = query(workersRef, where('siteId', '==', site.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedWorkers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setWorkers(loadedWorkers);
      });
      return () => unsubscribe();
  }, [site.id]);

  useEffect(() => {
      const materialsRef = collection(db, 'artifacts', appId, 'public', 'data', 'site_materials');
      const q = query(materialsRef, where('siteId', '==', site.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedMaterials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMaterials(loadedMaterials);
      });
      return () => unsubscribe();
  }, [site.id]);

  // --- Handlers ---
  const handleAddLog = async () => {
      if (!newLogText.trim()) return;
      setIsSubmittingLog(true);
      try {
          const hasImageCamera = cameraInputRef.current?.files?.length > 0;
          const hasImageGallery = galleryInputRef.current?.files?.length > 0;
          
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'site_logs'), {
              siteId: site.id,
              text: newLogText,
              author: user.name,
              createdAt: serverTimestamp(),
              hasImage: hasImageCamera || hasImageGallery,
              checks: [],
              comments: []
          });
          setNewLogText('');
          if(cameraInputRef.current) cameraInputRef.current.value = '';
          if(galleryInputRef.current) galleryInputRef.current.value = '';
      } catch (e) { console.error(e); }
      setIsSubmittingLog(false);
  };

  const handleToggleCheck = async (log) => {
      const logRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_logs', log.id);
      const isChecked = log.checks?.includes(user.name);
      try {
          if (isChecked) await updateDoc(logRef, { checks: arrayRemove(user.name) });
          else await updateDoc(logRef, { checks: arrayUnion(user.name) });
      } catch (e) { console.error(e); }
  };

  const handleAddComment = async (logId) => {
      const text = commentInputs[logId];
      if (!text || !text.trim()) return;
      const logRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_logs', logId);
      const newComment = { author: user.name, text: text, createdAt: new Date().toISOString() };
      try {
          await updateDoc(logRef, { comments: arrayUnion(newComment) });
          setCommentInputs(prev => ({ ...prev, [logId]: '' }));
      } catch (e) { console.error(e); }
  };

  const handleAddWorker = async () => {
    if(!newWorkerName || !newWorkerPhone || !newWorkerRole) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'site_workers'), {
      siteId: site.id, name: newWorkerName, role: newWorkerRole, phone: newWorkerPhone, createdAt: serverTimestamp()
    });
    setNewWorkerName(''); setNewWorkerRole(''); setNewWorkerPhone('');
  };

  const handleAddMaterial = async () => {
    if(!newMaterialLoc || !newMaterialName) {
        alert("위치와 자재명을 모두 입력해주세요.");
        return;
    }
    setIsSubmittingMaterial(true);
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'site_materials'), {
          siteId: site.id, location: newMaterialLoc, name: newMaterialName, status: 'pending', createdAt: serverTimestamp()
        });
        setNewMaterialLoc(''); setNewMaterialName('');
    } catch(e) {
        console.error(e);
        alert("저장에 실패했습니다.");
    }
    setIsSubmittingMaterial(false);
  };

  const toggleMaterialStatus = async (mat) => {
      const matRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_materials', mat.id);
      const newStatus = mat.status === 'ordered' ? 'pending' : 'ordered';
      await updateDoc(matRef, { status: newStatus });
  };

  const generateSchedule = () => {
    const schedule = [];
    const today = new Date();
    for(let i=-2; i<12; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' });
        let task = '';
        if(i === -2) task = '철거 공사'; else if(i === 0) task = '목공 (가벽 설치) - 금일'; else if(i === 1) task = '목공 (천장 덴조)'; else if(i === 2) task = '타일 시공';
        schedule.push({ date: dateStr, task: task || '현장 점검 및 양생', isToday: i === 0 });
    }
    return schedule;
  };
  const siteSchedule = generateSchedule();

  return (
    <div className="bg-slate-50 min-h-screen pb-20 flex flex-col animate-fade-in">
      {/* Header Image */}
      <div className="relative h-48 bg-slate-800">
        <img src={site.imageUrl || "https://placehold.co/600x300/e2e8f0/94a3b8?text=Site+Photo"} className="w-full h-full object-cover opacity-60" alt="Site Header" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30"><ChevronRight className="rotate-180 w-6 h-6" /></button>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-sm opacity-90">{site.address}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 overflow-x-auto">
        {['info', 'blueprint', 'workers', 'materials'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-medium border-b-2 transition min-w-[80px] ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {tab === 'info' ? '현장정보' : tab === 'blueprint' ? '도면' : tab === 'workers' ? '작업자' : '마감재'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-slate-800">공사 개요</h3>
                 <button onClick={() => setShowScheduleModal(true)} className="flex items-center text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold border border-blue-100 hover:bg-blue-100 transition"><Calendar className="w-3 h-3 mr-1" /> 일정표 보기</button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">기간</span><span className="text-slate-800 font-medium">{site.startDate} ~ {site.endDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">담당자</span><span className="text-slate-800 font-medium">{site.manager}</span></div>
              </div>
            </div>
            
             <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">작업 일지</h3>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                  <textarea value={newLogText} onChange={(e) => setNewLogText(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none resize-none mb-2" rows="2" placeholder="작업 내용이나 특이사항 입력..."></textarea>
                  
                  {/* Separate Inputs for Camera and Gallery */}
                  <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={() => alert("카메라 촬영이 실행됩니다.")}/>
                  <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={() => alert("갤러리가 열립니다.")}/>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <div className="flex space-x-2">
                        <button onClick={() => cameraInputRef.current?.click()} className="text-slate-500 hover:text-blue-600 p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center space-x-1">
                            <Camera className="w-4 h-4" /><span className="text-xs">촬영</span>
                        </button>
                        <button onClick={() => galleryInputRef.current?.click()} className="text-slate-500 hover:text-blue-600 p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center space-x-1">
                            <ImageIcon className="w-4 h-4" /><span className="text-xs">앨범</span>
                        </button>
                      </div>
                      <button onClick={handleAddLog} disabled={isSubmittingLog || !newLogText.trim()} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center ${!newLogText.trim() ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          <Send className="w-3 h-3 mr-1" /> 등록
                      </button>
                  </div>
              </div>

              <div className="space-y-4">
                  {logs.map(log => {
                      const isChecked = log.checks?.includes(user.name);
                      const checkCount = log.checks?.length || 0;
                      const hasComments = log.comments?.length > 0;
                      const isOpen = openCommentId === log.id;

                      return (
                      <div key={log.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">{log.author[0]}</div>
                                  <div><span className="font-bold text-sm text-slate-800 block">{log.author}</span><span className="text-[10px] text-slate-400 block">{log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '방금 전'}</span></div>
                              </div>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{log.text}</p>
                          {log.hasImage && (<div className="mb-3 rounded-lg overflow-hidden border border-slate-100"><img src="https://placehold.co/400x300/e2e8f0/94a3b8?text=Uploaded+Photo" alt="Log attachment" className="w-full h-auto object-cover"/></div>)}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <button onClick={() => handleToggleCheck(log)} className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-full transition ${isChecked ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><CheckCircle className="w-4 h-4" /><span>{isChecked ? '확인완료' : '확인'}</span>{checkCount > 0 && <span className="ml-1 text-[10px] opacity-80">({checkCount})</span>}</button>
                              <button onClick={() => setOpenCommentId(isOpen ? null : log.id)} className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-full transition ${isOpen || hasComments ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'}`}><MessageSquare className="w-4 h-4" /><span>댓글</span>{hasComments && <span className="ml-1">({log.comments.length})</span>}</button>
                          </div>
                          {checkCount > 0 && (<div className="mt-2 text-[10px] text-blue-600 font-medium px-1">{log.checks.join(', ')}님이 확인했습니다.</div>)}
                          {(isOpen || hasComments) && (
                              <div className="mt-3 bg-slate-50 p-3 rounded-lg">
                                  {log.comments && log.comments.map((comment, idx) => (<div key={idx} className="mb-2 last:mb-0 text-xs"><span className="font-bold text-slate-700 mr-1">{comment.author}:</span><span className="text-slate-600">{comment.text}</span></div>))}
                                  {isOpen && (<div className="flex mt-3 relative"><input type="text" value={commentInputs[log.id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [log.id]: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleAddComment(log.id)} placeholder="댓글 달기..." className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"/><button onClick={() => handleAddComment(log.id)} className="absolute right-1 top-1 p-1 text-blue-600 hover:bg-blue-50 rounded"><Send className="w-4 h-4" /></button></div>)}
                              </div>
                          )}
                      </div>
                  )})}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blueprint' && (
          <div className="flex flex-col h-full">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
               <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800">등록된 도면</h3></div>
               <div onClick={() => setShowBlueprintModal(true)} className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"><FileText className="w-8 h-8 text-slate-400 mb-2" /><span className="text-sm text-slate-500">전체 평면도 보기</span></div>
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center"><Plus className="w-4 h-4 mr-1 text-blue-600"/>작업자 추가</h3>
               <div className="grid grid-cols-3 gap-2 mb-2"><input className="p-2 bg-slate-50 rounded border text-sm" placeholder="공정" value={newWorkerRole} onChange={e => setNewWorkerRole(e.target.value)}/><input className="col-span-2 p-2 bg-slate-50 rounded border text-sm" placeholder="이름" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)}/></div>
               <div className="flex space-x-2"><input className="flex-1 p-2 bg-slate-50 rounded border text-sm" placeholder="전화번호" value={newWorkerPhone} onChange={e => setNewWorkerPhone(e.target.value)}/><button onClick={handleAddWorker} className="bg-slate-800 text-white px-4 rounded font-bold text-sm">등록</button></div>
             </div>
             <div className="space-y-3">{workers.map(worker => (<div key={worker.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"><div className="flex items-center space-x-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0"><Briefcase className="w-5 h-5" /></div><div><div className="flex items-center space-x-2"><h3 className="font-bold text-slate-800">{worker.name}</h3><span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{worker.role}</span></div><p className="text-xs text-slate-500">{worker.phone}</p></div></div><a href={`tel:${worker.phone}`} className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600 transition shadow-md"><Phone className="w-5 h-5" /></a></div>))}</div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center"><Plus className="w-4 h-4 mr-1 text-purple-600"/>마감재 입력</h3>
               <div className="space-y-2"><input className="w-full p-2 bg-slate-50 rounded border text-sm" placeholder="위치 (예: 거실 아트월)" value={newMaterialLoc} onChange={e => setNewMaterialLoc(e.target.value)}/><div className="flex space-x-2"><input className="flex-1 p-2 bg-slate-50 rounded border text-sm" placeholder="자재명 (예: 동화마루)" value={newMaterialName} onChange={e => setNewMaterialName(e.target.value)}/><button onClick={handleAddMaterial} disabled={isSubmittingMaterial} className="bg-slate-800 text-white px-4 rounded font-bold text-sm">{isSubmittingMaterial ? '저장중...' : '저장'}</button></div></div>
             </div>
             <div className="grid grid-cols-1 gap-3">
               {materials.map(mat => (
                 <div key={mat.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-purple-500">
                    <div className="flex justify-between items-start mb-2">
                        <div><p className="text-xs text-slate-400 font-bold mb-1">{mat.location}</p><h3 className="text-sm font-bold text-slate-800">{mat.name}</h3></div>
                        <Palette className="w-5 h-5 text-purple-200" />
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-end">
                        <button onClick={() => toggleMaterialStatus(mat)} className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition ${mat.status === 'ordered' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {mat.status === 'ordered' ? <><Truck className="w-3 h-3 mr-1"/>주문완료</> : <><ShoppingCart className="w-3 h-3 mr-1"/>주문대기</>}
                        </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
      
      {showBlueprintModal && (<div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-center items-center p-2" onClick={() => setShowBlueprintModal(false)}><img src="https://placehold.co/1024x768/202020/ffffff?text=BLUEPRINT+VIEW" alt="Full Blueprint" className="max-w-full max-h-screen object-contain"/><p className="text-white mt-4 text-sm">닫으려면 화면을 터치하세요</p></div>)}
      {showScheduleModal && (<div className="fixed inset-0 z-50 bg-white flex flex-col"><div className="p-4 border-b flex justify-between items-center bg-slate-800 text-white"><h2 className="text-lg font-bold">공사 전체 일정표</h2><button onClick={() => setShowScheduleModal(false)}><X className="w-6 h-6"/></button></div><div className="flex-1 overflow-y-auto p-4 bg-slate-50"><div className="space-y-2">{siteSchedule.map((item, idx) => (<div key={idx} className={`flex p-4 rounded-lg border ${item.isToday ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-600'}`}><div className={`w-20 font-bold ${item.isToday ? 'text-blue-200' : 'text-slate-400'}`}>{item.date}</div><div className="flex-1 font-bold pl-4 border-l border-white/20">{item.task}{item.isToday && <span className="ml-2 text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full">TODAY</span>}</div></div>))}</div></div></div>)}
    </div>
  );
};

// 5. AS 관리 화면
const ASManager = ({ asList }) => {
  const [selectedAS, setSelectedAS] = useState(null);

  return (
    <div className="pb-20 pt-4 px-4 h-full overflow-y-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">AS 관리</h2>
      
      <div className="space-y-4">
        {asList.map((item) => (
          <div key={item.id} onClick={() => setSelectedAS(item)} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500 cursor-pointer hover:bg-emerald-50 transition active:scale-98">
             <div className="flex justify-between mb-2">
               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{item.status === 'scheduled' ? '방문예정' : '처리완료'}</span>
               <span className="text-xs text-slate-400">{item.date} {item.time}</span>
             </div>
             <h3 className="font-bold text-lg text-slate-800 mb-1">{item.siteName}</h3>
             <p className="text-sm text-slate-600 mb-3">{item.issue}</p>
             <div className="flex items-center justify-between border-t border-slate-100 pt-3">
               <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">{item.assignedTo[0]}</div><span className="text-xs text-slate-500">담당: {item.assignedTo}</span></div>
               <div className="text-xs text-slate-400 flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> 미디어 보기</div>
             </div>
          </div>
        ))}
      </div>
      
      {/* AS Detail Modal */}
      {selectedAS && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedAS(null)}>
              <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                  <div className="bg-emerald-600 p-4 text-white flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-lg">{selectedAS.siteName}</h3>
                          <p className="text-sm opacity-90">AS 접수 상세</p>
                      </div>
                      <button onClick={() => setSelectedAS(null)}><X className="w-6 h-6"/></button>
                  </div>
                  <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                      {/* Customer Info */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-400 mb-1 block">고객 정보</label>
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 text-lg">{selectedAS.customerName}</span>
                              <a href={`tel:010-0000-0000`} className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center hover:bg-green-600"><Phone className="w-3 h-3 mr-1"/>전화걸기</a>
                          </div>
                          <div className="flex items-center text-sm text-slate-600"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {selectedAS.date} {selectedAS.time} 방문예정</div>
                      </div>

                      {/* Issue Details */}
                      <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">접수 내용</label>
                          <p className="text-slate-800 bg-white border border-slate-100 p-3 rounded-lg text-sm">{selectedAS.issue}</p>
                      </div>

                      {/* Media Gallery */}
                      <div>
                          <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center"><ImageIcon className="w-3 h-3 mr-1"/>고객 첨부 사진/영상</label>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative">
                                  <img src="https://placehold.co/300x300/e2e8f0/94a3b8?text=Photo+1" className="w-full h-full object-cover"/>
                              </div>
                              <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center">
                                  <img src="https://placehold.co/300x300/333/999?text=Video" className="w-full h-full object-cover opacity-50"/>
                                  <PlayCircle className="w-10 h-10 text-white absolute"/>
                              </div>
                          </div>
                      </div>

                      <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700">처리 완료로 변경</button>
                  </div>
              </div>
          </div>
      )}

      <button className="fixed bottom-24 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition"><Plus className="w-6 h-6" /></button>
    </div>
  );
};


// --- Main App Container ---
const App = () => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentSite, setCurrentSite] = useState(null);
  const [sitesData, setSitesData] = useState([]);
  const [asData, setAsData] = useState([]);

  // --- Auth & Initial Data Setup ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- Firestore Data Fetching ---
  useEffect(() => {
    if (!firebaseUser) return;
    
    const sitesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sites');
    const asRef = collection(db, 'artifacts', appId, 'public', 'data', 'as_requests');

    // 데모용 데이터 자동 생성 (처음 실행 시에만)
    const seedData = async () => {
      const snap = await getDocs(sitesRef);
      if (snap.empty) {
        const mockSites = [
            { name: '천안 불당동 푸르지오 304호', address: '충남 천안시 서북구 불당동', status: 'ongoing', startDate: '2024.01.10', endDate: '2024.02.15', manager: '김반장' },
            { name: '서울 역삼동 카페 리모델링', address: '서울 강남구 역삼동 123-4', status: 'ongoing', startDate: '2024.01.20', endDate: '2024.03.01', manager: '박팀장' },
            { name: '판교 봇들마을 7단지', address: '경기 성남시 분당구 삼평동', status: 'completed', startDate: '2023.11.01', endDate: '2023.12.20', manager: '이실장' }
        ];
        mockSites.forEach(s => addDoc(sitesRef, { ...s, createdAt: serverTimestamp() }));

        const mockAS = [
            { siteName: '판교 봇들마을 7단지', issue: '주방 수전 물샘 현상', status: 'scheduled', date: '2024.02.01', time: '14:00', assignedTo: '김설비', customerName: '이수진' },
            { siteName: '동탄 롯데캐슬', issue: '안방 문 걸림', status: 'scheduled', date: '2024.02.01', time: '16:30', assignedTo: '최목수', customerName: '박준형' }
        ];
        mockAS.forEach(a => addDoc(asRef, { ...a, createdAt: serverTimestamp() }));
      }
    };
    seedData();

    const unsubSites = onSnapshot(query(sitesRef, orderBy('createdAt', 'desc')), (snapshot) => {
      setSitesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.log(err));

    const unsubAS = onSnapshot(query(asRef, orderBy('createdAt', 'desc')), (snapshot) => {
        setAsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.log(err));

    return () => {
        unsubSites();
        unsubAS();
    };
  }, [firebaseUser]);


  // --- Navigation Handler ---
  const renderView = () => {
    if (!user) return <LoginView onLogin={setUser} />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} sites={sitesData} asList={asData} setView={setCurrentView} setCurrentSite={setCurrentSite} />;
      case 'sites':
        return <SiteList sites={sitesData} setCurrentSite={setCurrentSite} setView={setCurrentView} />;
      case 'siteDetail':
        return <SiteDetail site={currentSite} user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'as':
        return <ASManager asList={asData} />;
      default:
        return <Dashboard user={user} sites={sitesData} asList={asData} setView={setCurrentView} setCurrentSite={setCurrentSite} />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Status Bar Shim */}
      <div className="h-2 bg-slate-900 w-full"></div>
      
      {/* Main Content Area */}
      <main className="h-screen overflow-hidden">
         {renderView()}
      </main>

      {/* Bottom Navigation */}
      {user && currentView !== 'siteDetail' && (
        <nav className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 pb-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
          <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
            <Home className="w-6 h-6" strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">홈</span>
          </button>
          <button onClick={() => setCurrentView('sites')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'sites' ? 'text-blue-600' : 'text-slate-400'}`}>
            <ClipboardList className="w-6 h-6" strokeWidth={currentView === 'sites' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">현장목록</span>
          </button>
          <button onClick={() => setCurrentView('as')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'as' ? 'text-blue-600' : 'text-slate-400'}`}>
            <Hammer className="w-6 h-6" strokeWidth={currentView === 'as' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">AS관리</span>
          </button>
          <button onClick={() => setUser(null)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">내정보</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;