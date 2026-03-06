import React from 'react';
import { Target, Sparkles } from 'lucide-react';

const EvaluationsView: React.FC = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
                <div className="absolute -inset-4 bg-rose-100 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-rose-50">
                    <Target className="w-16 h-16 text-rose-500" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <div className="space-y-2 max-w-sm">
                <h2 className="text-3xl font-black text-slate-800">Evaluaciones</h2>
                <p className="text-slate-500 font-medium">
                    Estamos preparando un sistema inteligente para el seguimiento de logros y objetivos.
                </p>
            </div>

            <div className="bg-rose-50 px-6 py-3 rounded-2xl border-2 border-rose-100/50">
                <span className="text-rose-600 font-bold text-sm uppercase tracking-widest leading-none">Próximamente</span>
            </div>
        </div>
    );
};

export default EvaluationsView;
