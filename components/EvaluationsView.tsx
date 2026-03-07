import React, { useState } from 'react';
import { Target, ArrowLeft, Save, UserPlus, Baby, GraduationCap, Calendar, Building2, Hash, Sparkles, User, ChevronRight, ChevronDown, CheckCircle2, ListChecks, Loader2 } from 'lucide-react';
import { Level, Child, EvaluationSession, EvaluationIndicator, AchievementLevel, Nucleo, Objective } from '../types';
import { supabase } from '../supabaseClient';
import EvaluationTrackingView from './EvaluationTrackingView';

const EVAL_MODES = [
    { id: 'L', label: 'L', full: 'Logrado' },
    { id: 'ML', label: 'ML', full: 'Medianamente Logrado' },
    { id: 'N/O', label: 'N/O', full: 'No Observado' }
];

interface EvaluationsViewProps {
    setView: (view: any) => void;
    children: Child[];
    session: any;
    evaluations: any[];
    onFetchEvaluations: () => void;
    groupedData: Record<string, Nucleo[]>;
    expandedAmbito: string | null;
    toggleAmbito: (ambito: string) => void;
}

const EvaluationsView: React.FC<EvaluationsViewProps> = ({ 
    setView, 
    children, 
    session, 
    evaluations, 
    onFetchEvaluations,
    groupedData,
    expandedAmbito,
    toggleAmbito
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'new' | 'tracking'>('new');
    const [isConfiguring, setIsConfiguring] = useState(true);
    
    // Estados de Selección Curricular
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [selectedNucleo, setSelectedNucleo] = useState<Nucleo | null>(null);
    const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>([]);

    const [trackingChild, setTrackingChild] = useState<Child | null>(null);
    const [isGeneralTracking, setIsGeneralTracking] = useState(false);
    const [sessionData, setSessionData] = useState<Partial<EvaluationSession>>({
        establishment: '',
        rbd: '',
        level: '1° Transición',
        year: '2026',
        childIds: [],
        indicators: []
    });

    const [selectedChildId, setSelectedChildId] = useState<string>("");
    const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
    const [evalMatrix, setEvalMatrix] = useState<Record<string, Record<string, string>>>({});

    const handleInfoChange = (field: keyof EvaluationSession, value: string) => {
        setSessionData(prev => ({ ...prev, [field]: value }));
    };

    const toggleChildSelection = (id: string) => {
        setSelectedChildIds(prev => 
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const toggleAllChildren = () => {
        if (selectedChildIds.length === children.length) {
            setSelectedChildIds([]);
        } else {
            setSelectedChildIds(children.map(c => c.id));
        }
    };

    const handleEvalChange = (childId: string, indicatorId: string, value: string) => {
        setEvalMatrix(prev => ({
            ...prev,
            [indicatorId]: {
                ...(prev[indicatorId] || {}),
                [childId]: value
            }
        }));
    };

    const toggleObjective = (obj: Objective) => {
        setSelectedObjectives(prev => {
            if (prev.find(o => o.id === obj.id)) {
                return prev.filter(o => o.id !== obj.id);
            }
            return [...prev, obj];
        });
    };

    const selectAllObjectives = () => {
        if (!selectedNucleo || !selectedLevel) return;
        setSelectedObjectives(selectedNucleo.objectives[selectedLevel]);
    };

    const deselectAllObjectives = () => {
        setSelectedObjectives([]);
    };

    const startEvaluation = () => {
        if (selectedObjectives.length === 0) {
            alert("Selecciona al menos un objetivo de aprendizaje.");
            return;
        }
        if (selectedChildIds.length === 0) {
            alert("Selecciona al menos un niño/a para evaluar.");
            return;
        }
        setIsConfiguring(false);
    };

    const handleSave = async () => {
        if (!session?.user?.id) return;
        if (selectedChildIds.length === 0) {
            alert("Selecciona al menos un niño/a para evaluar.");
            return;
        }

        setIsSaving(true);
        try {
            // Formatear los indicadores según los resultados de la matriz para cada niño
            // Nota: Aquí se guarda un registro de evaluación que contiene la matriz 
            // O podríamos guardar uno por niño. El esquema actual parece ser un registro con child_ids.
            const { error } = await supabase.from('evaluations').insert({
                user_id: session.user.id,
                establishment: sessionData.establishment,
                rbd: sessionData.rbd,
                level: sessionData.level,
                year: sessionData.year,
                child_ids: selectedChildIds,
                indicators: selectedObjectives.map(obj => ({
                    id: obj.id,
                    text: obj.text,
                    ambito: selectedNucleo?.ambito,
                    nucleo: selectedNucleo?.name,
                    evaluationsByChild: evalMatrix[obj.id] || {}
                }))
            });

            if (error) throw error;
            alert("¡Evaluaciones guardadas exitosamente!");
            onFetchEvaluations();
            setView('home');
        } catch (err: any) {
            console.error("Error saving evaluation:", err);
            alert("No se pudo guardar la evaluación. Revisa la conexión.");
        } finally {
            setIsSaving(false);
        }
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
                        {viewMode === 'new' ? 'Niños/as en Evaluación' : 'Selecciona para ver Seguimiento'}
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setViewMode('new')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'new' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                            Nueva
                        </button>
                        <button 
                            onClick={() => setViewMode('tracking')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'tracking' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                            Seguimiento
                        </button>
                    </div>
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
                        {viewMode === 'tracking' && (
                            <button
                                onClick={() => {
                                    setIsGeneralTracking(true);
                                    setTrackingChild(null);
                                }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                                    isGeneralTracking
                                        ? 'bg-slate-900 border-slate-800 text-white shadow-lg'
                                        : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                <Target className={`w-8 h-8 ${isGeneralTracking ? 'text-sky-400' : 'text-slate-200 group-hover:text-sky-200'}`} />
                                <span className="text-[10px] font-black uppercase truncate w-full text-center">General Clase</span>
                            </button>
                        )}
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => {
                                    if (viewMode === 'new') {
                                        toggleChildSelection(child.id);
                                    } else {
                                        setTrackingChild(child);
                                        setIsGeneralTracking(false);
                                    }
                                }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                                    (viewMode === 'new' && selectedChildIds.includes(child.id)) || (viewMode === 'tracking' && trackingChild?.id === child.id)
                                        ? (viewMode === 'new' ? 'bg-rose-500 border-rose-400 text-white shadow-lg' : 'bg-sky-500 border-sky-400 text-white shadow-lg')
                                        : 'bg-white border-slate-50 text-slate-400 hover:border-sky-100'
                                    }`}
                            >
                                <Baby className={`w-8 h-8 ${((viewMode === 'new' && selectedChildIds.includes(child.id)) || (viewMode === 'tracking' && trackingChild?.id === child.id)) ? 'text-white' : 'text-slate-200 group-hover:text-sky-200'}`} />
                                <span className="text-[10px] font-black uppercase truncate w-full text-center">{child.firstName}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {viewMode === 'tracking' && (trackingChild || isGeneralTracking) ? (
                <EvaluationTrackingView 
                    child={trackingChild} 
                    children={children}
                    evaluations={evaluations} 
                    onBack={() => {
                        setTrackingChild(null);
                        setIsGeneralTracking(false);
                    }} 
                    onFetchEvaluations={onFetchEvaluations}
                />
            ) : viewMode === 'new' && isConfiguring ? (
                /* Interfaz de Selección Curricular */
                <div className="space-y-10 animate-in slide-in-from-bottom-4">
                    {/* Paso 1: Nivel */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-sky-500 uppercase block ml-4 tracking-widest">1. Seleccionar Nivel</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.values(Level).map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => { setSelectedLevel(lvl); setSelectedNucleo(null); setSelectedObjectives([]); }}
                                    className={`text-left p-6 rounded-[2rem] border-2 transition-all ${selectedLevel === lvl ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-lg' : 'border-slate-100 bg-white hover:border-sky-100'}`}
                                >
                                    <span className="text-base font-black">{lvl}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paso 2: Ámbito y Núcleo */}
                    {selectedLevel && (
                        <div className="space-y-4 animate-in fade-in">
                            <label className="text-[11px] font-black text-rose-500 uppercase block ml-4 tracking-widest">2. Ámbito y Núcleo</label>
                            <div className="space-y-3">
                                {Object.keys(groupedData).map((ambito) => (
                                    <div key={ambito} className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => toggleAmbito(ambito)}
                                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                                        >
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider text-left">{ambito}</span>
                                            {expandedAmbito === ambito ? <ChevronDown className="w-5 h-5 text-rose-500" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
                                        </button>
                                        {expandedAmbito === ambito && (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white animate-in slide-in-from-top-2">
                                                {groupedData[ambito].map(nuc => (
                                                    <button
                                                        key={nuc.name}
                                                        onClick={() => { setSelectedNucleo(nuc); setSelectedObjectives([]); }}
                                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${selectedNucleo?.name === nuc.name ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-slate-600 border-slate-50 hover:border-rose-100'}`}
                                                    >
                                                        <span className="text-xs font-bold leading-tight">{nuc.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Objetivos (Selección Múltiple) */}
                    {selectedNucleo && selectedLevel && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="flex items-center justify-between ml-4">
                                <label className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">3. Objetivos de Aprendizaje</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={selectAllObjectives}
                                        className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-tighter"
                                    >
                                        Seleccionar Todos
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button 
                                        onClick={deselectAllObjectives}
                                        className="text-[10px] font-black text-slate-400 hover:underline uppercase tracking-tighter"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {selectedNucleo.objectives[selectedLevel].map((obj) => {
                                    const isSelected = !!selectedObjectives.find(o => o.id === obj.id);
                                    return (
                                        <button
                                            key={obj.id}
                                            onClick={() => toggleObjective(obj)}
                                            className={`text-left p-6 rounded-[2.5rem] border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.01]' : 'border-slate-100 bg-white hover:border-emerald-50'}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`p-1.5 rounded-full shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">OA {obj.id}</span>
                                                    <span className="text-sm font-bold text-slate-700 leading-relaxed">{obj.text}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={startEvaluation}
                                disabled={selectedObjectives.length === 0}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 mt-6"
                            >
                                <ListChecks className="w-6 h-6" />
                                Iniciar Evaluación ({selectedObjectives.length})
                            </button>
                        </div>
                    )}
                </div>
                ) : viewMode === 'new' ? (
                   /* Matriz de Evaluación Nueva (Refinada) */
                <div className="bg-white p-8 md:p-10 rounded-[4rem] shadow-2xl border-4 border-rose-50 space-y-8 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-100 rounded-2xl flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-rose-600" />
                                <button 
                                    onClick={() => setIsConfiguring(true)}
                                    className="text-[10px] font-black uppercase text-rose-500 hover:underline"
                                >
                                    Configurar Evaluación
                                </button>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                {selectedNucleo?.name || 'Matriz Técnica'}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        {/* Esquina: Indicadores / Alumnos */}
                                        <th className="p-0 border-b-2 border-r-2 border-slate-200 bg-slate-50 min-w-[300px] relative h-32">
                                            <div className="absolute top-4 right-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Indicadores</div>
                                            <div className="absolute bottom-4 left-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombres</div>
                                            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #e2e8f0, transparent calc(50% + 1px))' }}></div>
                                        </th>
                                        
                                        {/* Números y Nombres de Niños */}
                                        {children.filter(c => selectedChildIds.includes(c.id)).map((child, index) => (
                                            <th key={child.id} className="p-0 border-b-2 border-r border-slate-200 bg-white min-w-[70px]">
                                                <div className="flex flex-col h-full">
                                                    <div className="py-2 border-b border-slate-200 bg-slate-50 text-[10px] font-black text-slate-500 text-center">
                                                        {index + 1}
                                                    </div>
                                                    <div className="p-4 flex items-center justify-center bg-white min-h-[140px]">
                                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter whitespace-nowrap block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                            {child.firstName} {child.lastName[0]}.
                                                        </span>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedObjectives.map((obj, objIdx) => (
                                        <tr key={obj.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="p-6 border-b border-r-2 border-slate-200 bg-white">
                                                <div className="flex gap-4 items-start">
                                                    <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-lg shrink-0 mt-1 shadow-sm">{objIdx + 1}</span>
                                                    <span className="text-[12px] font-bold text-slate-700 leading-snug">{obj.text}</span>
                                                </div>
                                            </td>
                                            {children.filter(c => selectedChildIds.includes(c.id)).map(child => (
                                                <td key={child.id} className="p-3 border-b border-r border-slate-100 text-center bg-white">
                                                    <select
                                                        value={evalMatrix[obj.id]?.[child.id] || ''}
                                                        onChange={(e) => handleEvalChange(child.id, obj.id.toString(), e.target.value)}
                                                        className={`w-full p-2.5 rounded-xl text-[11px] font-black border-2 transition-all outline-none appearance-none text-center cursor-pointer hover:shadow-md ${
                                                            evalMatrix[obj.id]?.[child.id] === 'L' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                                                            evalMatrix[obj.id]?.[child.id] === 'ML' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                                                            evalMatrix[obj.id]?.[child.id] === 'N/O' ? 'bg-slate-100 border-slate-300 text-slate-600' :
                                                            'bg-slate-50 border-slate-100 text-slate-400'
                                                        }`}
                                                    >
                                                        <option value="">-</option>
                                                        {EVAL_MODES.map(mode => (
                                                            <option key={mode.id} value={mode.id}>{mode.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white px-12 py-5 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-rose-200 transition-all active:scale-95 group disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                            {isSaving ? 'Guardando...' : 'Guardar Evaluaciones'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3rem] shadow-xl border-4 border-dashed border-slate-100 text-center space-y-4">
                    <User className="w-16 h-16 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold text-xl">Selecciona un niño/a arriba para ver su historial de seguimiento.</p>
                </div>
            )}
        </div>
    );
};

export default EvaluationsView;
