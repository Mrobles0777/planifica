import React, { useState } from 'react';
import { Target, ArrowLeft, Save, UserPlus, Baby, GraduationCap, Calendar, Building2, Hash, Sparkles } from 'lucide-react';
import { Child, EvaluationSession, EvaluationIndicator, AchievementLevel } from '../types';

interface EvaluationsViewProps {
    setView: (view: any) => void;
    children: Child[];
}

const DEFAULT_INDICATORS: string[] = [
    "Corre alternando velocidades. Ej: rápido y lento.",
    "Salta en un pie manteniendo el equilibrio.",
    "Manipula objetos pequeños con precisión (pinza).",
    "Sigue instrucciones simples de autocuidado.",
    "Expresa sus necesidades y emociones de forma clara."
];

const EvaluationsView: React.FC<EvaluationsViewProps> = ({ setView, children }) => {
    const [sessionData, setSessionData] = useState<Partial<EvaluationSession>>({
        establishment: '',
        rbd: '',
        level: '1° Transición',
        year: '2026',
        childIds: [],
        indicators: DEFAULT_INDICATORS.map((text, idx) => ({
            id: `ind-${idx}`,
            text,
            evaluations: [null, null, null],
            finalAchievement: 'None'
        }))
    });

    const [selectedChildId, setSelectedChildId] = useState<string>("");

    const handleInfoChange = (field: keyof EvaluationSession, value: string) => {
        setSessionData(prev => ({ ...prev, [field]: value }));
    };

    const toggleChild = (id: string) => {
        setSessionData(prev => {
            const currentIds = prev.childIds || [];
            if (currentIds.includes(id)) {
                return { ...prev, childIds: currentIds.filter(cid => cid !== id) };
            }
            return { ...prev, childIds: [...currentIds, id] };
        });
    };

    const updateIndicatorEvaluation = (indicatorId: string, momentIdx: number, level: AchievementLevel) => {
        setSessionData(prev => ({
            ...prev,
            indicators: prev.indicators?.map(ind => {
                if (ind.id === indicatorId) {
                    const newEvals = [...ind.evaluations];
                    // Si ya es el mismo, lo quitamos (toggle) o simplemente lo cambiamos
                    newEvals[momentIdx] = newEvals[momentIdx] === level ? null : level;
                    return { ...ind, evaluations: newEvals };
                }
                return ind;
            })
        }));
    };

    const updateFinalAchievement = (indicatorId: string, level: AchievementLevel) => {
        setSessionData(prev => ({
            ...prev,
            indicators: prev.indicators?.map(ind => {
                if (ind.id === indicatorId) {
                    return { ...ind, finalAchievement: level };
                }
                return ind;
            })
        }));
    };

    const handleSave = () => {
        console.log("Saving Evaluation Session:", sessionData);
        alert("¡Datos listos para procesar! Revisa la consola.");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-rose-50 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                    <button
                        onClick={() => setView('home')}
                        className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Evaluaciones</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Seguimiento de logros y objetivos</p>
                    </div>
                </div>
                <Target className="absolute -right-6 -bottom-6 w-40 h-40 text-rose-500 opacity-5" />
            </div>

            {/* Información General */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border-4 border-slate-50 space-y-8">
                <h3 className="text-sm font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Establecimiento</label>
                        <input
                            type="text"
                            placeholder="Ej: Colegio San José"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-400 focus:bg-white transition-all outline-none font-bold text-slate-700"
                            value={sessionData.establishment}
                            onChange={e => handleInfoChange('establishment', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">RBD-DV</label>
                        <input
                            type="text"
                            placeholder="Ej: 12345-6"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-400 focus:bg-white transition-all outline-none font-bold text-slate-700"
                            value={sessionData.rbd}
                            onChange={e => handleInfoChange('rbd', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Nivel</label>
                        <select
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-400 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none"
                            value={sessionData.level}
                            onChange={e => handleInfoChange('level', e.target.value)}
                        >
                            <option>1° Transición</option>
                            <option>2° Transición</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Año Escolar</label>
                        <input
                            type="text"
                            placeholder="2026"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-400 focus:bg-white transition-all outline-none font-bold text-slate-700"
                            value={sessionData.year}
                            onChange={e => handleInfoChange('year', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Selección de Niños */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border-4 border-slate-50 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-sky-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Baby className="w-4 h-4" />
                        Niños/as en Evaluación
                    </h3>
                    <span className="bg-sky-50 text-sky-600 px-4 py-1 rounded-full text-xs font-black">
                        {sessionData.childIds?.length} Seleccionados
                    </span>
                </div>

                {children.length === 0 ? (
                    <div className="p-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center space-y-3">
                        <UserPlus className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-slate-400 font-bold">No hay niños en el Listado Base</p>
                        <button onClick={() => setView('children-list')} className="text-sky-500 font-black text-xs uppercase tracking-widest hover:underline">
                            Ir a Listado Base
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => toggleChild(child.id)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${sessionData.childIds?.includes(child.id)
                                        ? 'bg-sky-500 border-sky-400 text-white shadow-lg'
                                        : 'bg-white border-slate-50 text-slate-400 hover:border-sky-100'
                                    }`}
                            >
                                <Baby className={`w-8 h-8 ${sessionData.childIds?.includes(child.id) ? 'text-white' : 'text-slate-200 group-hover:text-sky-200'}`} />
                                <span className="text-[10px] font-black uppercase truncate w-full text-center">{child.firstName}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Matriz de Evaluación */}
            <div className="bg-white p-8 md:p-10 rounded-[4rem] shadow-2xl border-4 border-rose-50 space-y-8 overflow-hidden">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-100 rounded-2xl">
                        <sparkles className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Eje Motricidad y Autonomía</h3>
                </div>

                <div className="overflow-x-auto -mx-8 md:-mx-10 px-8 md:px-10">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                <th className="pb-4 pl-6 w-1/3">Indicador de Aprendizaje</th>
                                <th className="pb-4 text-center px-4">Momento 1</th>
                                <th className="pb-4 text-center px-4">Momento 2</th>
                                <th className="pb-4 text-center px-4">Momento 3</th>
                                <th className="pb-4 text-center pr-6 min-w-[150px]">Nivel de Logro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionData.indicators?.map(indicator => (
                                <tr key={indicator.id} className="group transition-all">
                                    <td className="bg-slate-50 p-6 rounded-l-[2rem] border-y-2 border-l-2 border-slate-100/50 group-hover:bg-rose-50/30 group-hover:border-rose-100/50 transition-all">
                                        <p className="font-bold text-slate-700 text-sm leading-relaxed">{indicator.text}</p>
                                    </td>
                                    {[0, 1, 2].map(moment => (
                                        <td key={moment} className="bg-slate-50/50 p-4 border-y-2 border-slate-100/30 text-center transition-all group-hover:bg-rose-50/20">
                                            <div className="flex justify-center gap-2">
                                                {['NT1', 'NT2'].map((lvl) => (
                                                    <button
                                                        key={lvl}
                                                        onClick={() => updateIndicatorEvaluation(indicator.id, moment, lvl as AchievementLevel)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${indicator.evaluations[moment] === lvl
                                                                ? 'bg-emerald-500 text-white shadow-md'
                                                                : 'bg-white text-slate-300 hover:text-slate-400 border border-slate-100'
                                                            }`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="bg-slate-50 p-4 rounded-r-[2.5rem] border-y-2 border-r-2 border-slate-100/50 group-hover:bg-rose-50/30 transition-all">
                                        <select
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none focus:border-rose-300 transition-all appearance-none"
                                            value={indicator.finalAchievement}
                                            onChange={e => updateFinalAchievement(indicator.id, e.target.value as AchievementLevel)}
                                        >
                                            <option value="None">Sin Evaluar</option>
                                            <option value="NT1">Logrado NT1</option>
                                            <option value="NT2">Logrado NT2</option>
                                            <option value="1 EGB">Logrado 1 EGB</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white px-12 py-5 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-rose-200 transition-all active:scale-95 group"
                    >
                        <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        Guardar Evaluaciones
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluationsView;
