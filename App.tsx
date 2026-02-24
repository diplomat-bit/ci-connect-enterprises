
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
// fix: Ensured all v6 exports are explicitly listed to resolve missing member errors
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  Bell, LogOut, Activity, ChevronRight, Cpu, Settings as SettingsIcon, Terminal, Loader2, Key,
  ShieldCheck, Zap, ArrowRight, ShieldAlert, Globe, Lock, Database, Shield, ZapOff, Fingerprint, Code,
  Server, Layers, Network, BookOpen, MessageSquare, Briefcase, Landmark, Star, Crown, Info, X, 
  Command, HelpCircle, Keyboard, User
} from 'lucide-react';
import { routes } from './views/routes';
import Login from './views/Login';
import Landing from './views/Landing';
import PrivacyPolicy from './views/PrivacyPolicy';
import Documentation from './views/Documentation';
import Airdrop from './views/Airdrop';
import TechnicalDeepDive from './views/TechnicalDeepDive';
// fix: Imported LineItems view which was missing from App.tsx imports
import LineItems from './views/LineItems';
import { apiClient } from './services/api';
import { UserSession } from './types/index';
import NeuralBackground from './components/NeuralBackground';
import VoiceConcierge from './components/VoiceConcierge';

type AppTier = 'STANDARD' | 'ENTERPRISE';

interface AppState {
  tier: AppTier;
  setTier: (tier: AppTier) => void;
}

const AppContext = createContext<AppState>({ tier: 'STANDARD', setTier: () => {} });
export const useAppTier = () => useContext(AppContext);

const SidebarItem: React.FC<{ icon: any, label: string, path: string, active: boolean, restricted?: boolean }> = ({ icon: Icon, label, path, active, restricted }) => {
  const { tier } = useAppTier();
  const isLocked = restricted && tier === 'STANDARD';

  return (
    <Link 
      to={isLocked ? '#' : path}
      className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${
        active 
          ? 'bg-white/10 text-white shadow-2xl' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-white'
      } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-4">
        <Icon size={18} className={active ? 'text-blue-500' : 'text-zinc-600 group-hover:text-blue-400 transition-colors'} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {isLocked && <Lock size={12} className="text-zinc-600" />}
      {active && !isLocked && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>}
    </Link>
  );
};

const HelpOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <HelpCircle size={240} className="text-blue-500" />
        </div>
        
        <div className="relative z-10 space-y-12">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-3xl flex items-center justify-center">
                <Keyboard size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">System <span className="text-blue-500 not-italic">Help</span></h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Protocol Command Interface</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 text-zinc-600 hover:text-white bg-zinc-900 rounded-2xl transition-colors"><X size={24} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] italic">Hotkeys</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black border border-zinc-800 rounded-2xl">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Show Help</span>
                  <div className="flex gap-2">
                    <kbd className="px-2 py-1 bg-zinc-800 rounded text-white font-mono text-xs">H</kbd>
                    <span className="text-zinc-600 font-black">+</span>
                    <kbd className="px-2 py-1 bg-zinc-800 rounded text-white font-mono text-xs">Enter</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-black border border-zinc-800 rounded-2xl opacity-50">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fast Sync</span>
                  <kbd className="px-2 py-1 bg-zinc-800 rounded text-white font-mono text-xs">S</kbd>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] italic">System Status</h4>
              <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Parity: 100%</span>
                </div>
                <p className="text-[9px] text-zinc-600 font-mono leading-relaxed">
                  GATEWAY: GLOBAL_MESH_01<br />
                  AUTH: RSA-OAEP-4096<br />
                  CLIENT: LUMINA_NEXUS_v1.4
                </p>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-zinc-200 shadow-2xl">
            Resume Operations
          </button>
        </div>
      </div>
    </div>
  );
};

const PrivateTerminal = ({ user, onLogout }: { user: UserSession, onLogout: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tier } = useAppTier();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        lastKeyRef.current = 'h';
      } else if (e.key === 'Enter' && lastKeyRef.current === 'h') {
        setIsHelpOpen(true);
        lastKeyRef.current = null;
      } else {
        lastKeyRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTerminate = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen text-zinc-400 antialiased font-sans relative">
      <NeuralBackground />
      <VoiceConcierge />
      <HelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      <aside className="w-80 fixed h-full bg-black/40 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col z-50">
        <div className="mb-14 px-4 flex flex-col gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl ${tier === 'ENTERPRISE' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}>
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none">
                Nexus <span className="text-blue-500 not-italic">Core</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-600 mt-1">Institutional Mesh</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl border flex items-center justify-between ${tier === 'ENTERPRISE' ? 'bg-blue-600/10 border-blue-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <User size={14} className="text-zinc-500 shrink-0" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{user.name}</span>
            </div>
            <button onClick={handleTerminate} className="text-zinc-600 hover:text-rose-500 transition-colors ml-2">
              <LogOut size={14} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 custom-scrollbar overflow-y-auto pr-2">
          {routes.filter(r => r.showInSidebar).map(route => (
            <SidebarItem 
              key={route.path}
              icon={route.icon}
              label={route.label}
              path={route.path}
              active={location.pathname === route.path}
              restricted={route.category === 'intelligence' || route.category === 'system' || route.category === 'registry'}
            />
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <Link to="/settings" className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${location.pathname === '/settings' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}>
            <SettingsIcon size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
          </Link>
          <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Activity size={14} className="text-blue-500" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Node Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-600">
                <span>Parity</span>
                <span className="text-emerald-500">100%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 shadow-[0_0_8px_#3b82f6]" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-80 p-12 relative z-10 overflow-x-hidden">
        <header className="flex justify-between items-center mb-16">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Nexus_OS v1.4.2</p>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              {routes.find(r => r.path === location.pathname)?.label || 'System Core'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Node: {user.id}</span>
             </div>
             <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></span>
             </button>
          </div>
        </header>

        <Routes>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/line-items/:type/:id" element={<LineItems />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<AppTier>('STANDARD');

  const checkAuth = useCallback(async () => {
    try {
      const { isAuthenticated, user: sessionUser } = await apiClient.auth.me();
      if (isAuthenticated && sessionUser) {
        setUser(sessionUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-update', checkAuth);
    return () => window.removeEventListener('auth-update', checkAuth);
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ tier, setTier }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/overview" replace /> : <Login />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/airdrop" element={<Airdrop />} />
          <Route path="/protocol/:slug" element={<TechnicalDeepDive />} />
          <Route path="/institutional/:slug" element={<TechnicalDeepDive />} />
          <Route path="/intelligence/:slug" element={<TechnicalDeepDive />} />
          <Route path="/network/:slug" element={<TechnicalDeepDive />} />
          <Route path="*" element={user ? <PrivateTerminal user={user} onLogout={apiClient.auth.logout} /> : <Landing />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
