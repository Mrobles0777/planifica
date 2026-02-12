import React from 'react';
import { Star, LogOut, BookOpen, History, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  view: string;
  setView: (view: any) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, view, setView, handleLogout, children }) => {
  return (
    <div className="min-h-screen bg-[#fffdf5] flex flex-col items-center">
      {/* Container shared across all views for consistency */}
      <div className="w-full max-w-[1024px] bg-white shadow-2xl min-h-screen flex flex-col relative overflow-hidden">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b-2 border-yellow-100 px-6 py-4 sticky top-0 z-30 flex items-center justify-between no-print shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-sm">
              <Star className="text-white w-5 h-5 fill-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Planifica</h1>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setView('profile')}
            >
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Conectada</span>
              <span className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{user?.firstName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90 shadow-sm"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-28 md:p-10 md:pb-32 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white/90 backdrop-blur-md border-t-2 border-yellow-100 px-8 py-6 fixed bottom-0 left-0 right-0 max-w-[1024px] mx-auto z-40 flex items-center justify-around no-print shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:rounded-t-3xl">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-2 transition-all ${view === 'home' || view === 'create' ? 'text-sky-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${view === 'home' || view === 'create' ? 'bg-sky-50' : ''}`}>
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Inicio</span>
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex flex-col items-center gap-2 transition-all ${view === 'history' || view === 'planning' || view === 'global-planning' ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${view === 'history' || view === 'planning' || view === 'global-planning' ? 'bg-amber-50' : ''}`}>
              <History className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Mi Baúl</span>
          </button>
          <button
            onClick={() => setView('profile')}
            className={`flex flex-col items-center gap-2 transition-all ${view === 'profile' ? 'text-indigo-500 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${view === 'profile' ? 'bg-indigo-50' : ''}`}>
              <UserIcon className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
