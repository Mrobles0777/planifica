import React from 'react';
import { Cloud, Plus, FileText, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface HomeViewProps {
    user: User | null;
    planningItemsCount: number;
    setView: (view: any) => void;
    resetForm: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, planningItemsCount, setView, resetForm }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black">¡Hola, {user?.firstName}!</h2>
                    <p className="text-sky-50 opacity-90 text-sm md:text-base font-medium">
                        Tienes {planningItemsCount} planes guardados en tu baúl.
                    </p>
                </div>
                <Cloud className="absolute -right-6 -bottom-6 w-40 h-40 text-white opacity-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => { setView('create'); resetForm(); }}
                    className="flex items-center gap-4 bg-white p-8 rounded-[2.5rem] border-4 border-emerald-50 shadow-xl hover:shadow-2xl hover:border-emerald-100 transition-all active:scale-95 group text-left"
                >
                    <div className="p-5 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                        <Plus className="text-emerald-600 w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <p className="font-black text-slate-800 text-xl">Nueva Aventura</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Planificación didáctica</p>
                    </div>
                    <ChevronRight className="text-emerald-200 w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={() => { setView('history'); }}
                    className="flex items-center gap-4 bg-white p-8 rounded-[2.5rem] border-4 border-amber-50 shadow-xl hover:shadow-2xl hover:border-amber-100 transition-all active:scale-95 group text-left"
                >
                    <div className="p-5 bg-amber-100 rounded-2xl group-hover:bg-amber-200 transition-colors">
                        <FileText className="text-amber-600 w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <p className="font-black text-slate-800 text-xl">Mi Baúl</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Documentos oficiales</p>
                    </div>
                    <ChevronRight className="text-amber-200 w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default HomeView;
