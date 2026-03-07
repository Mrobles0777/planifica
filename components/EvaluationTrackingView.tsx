import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, Building2, User, ChevronRight, FileText, Trash2, Loader2, Star, Target } from 'lucide-react';
import { Child } from '../types';
import { supabase } from '../supabaseClient';

interface EvaluationTrackingViewProps {
    child: Child;
    children: Child[];
    evaluations: any[];
    onBack: () => void;
    onFetchEvaluations: () => void;
}

const EVAL_MODES = [
    { id: 'L', label: 'L', full: 'Logrado' },
    { id: 'ML', label: 'ML', full: 'Medianamente Logrado' },
    { id: 'N/O', label: 'N/O', full: 'No Observado' }
];

const EvaluationTrackingView: React.FC<EvaluationTrackingViewProps> = ({ child, children, evaluations, onBack, onFetchEvaluations }) => {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<Record<string, 'individual' | 'general'>>({});

    const childEvaluations = (evaluations || []).filter(ev => ev.child_ids?.includes(child.id));

    const exportToPDF = async (evaluation: any, type: 'individual' | 'general' = 'individual') => {
        try {
            const elementId = type === 'individual' ? `pdf-eval-${evaluation.id}` : `pdf-matrix-${evaluation.id}`;
            const element = document.getElementById(elementId);
            
            if (!element) {
                console.error(`Element not found: ${elementId}`);
                return;
            }

            const isLandscape = type === 'general';
            const dateStr = new Date(evaluation.created_at).toLocaleDateString('es-CL').replace(/\//g, '-');
            const sanitizedName = child.firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_');
            const fileName = `Planifica_${type === 'individual' ? 'Reporte' : 'Matriz'}_${sanitizedName}_${dateStr}.pdf`;

            const opt = {
                margin: isLandscape ? 5 : 0,
                filename: fileName,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { 
                    scale: 3, // Mayor escala para nitidez premium
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: isLandscape ? 'landscape' : 'portrait',
                    compress: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // @ts-ignore
            if (typeof html2pdf === 'undefined') {
                alert("La librería PDF no está lista. Por favor, espera un momento.");
                return;
            }

            // @ts-ignore
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error("Error al exportar PDF:", err);
            alert("No se pudo generar el PDF. Revisa la consola.");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.")) return;

        setIsDeleting(id);
        try {
            const { error } = await supabase.from('evaluations').delete().eq('id', id);
            if (error) throw error;
            onFetchEvaluations();
        } catch (err) {
            console.error("Error deleting evaluation:", err);
            alert("No se pudo eliminar la evaluación. Revisa tu conexión.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-sky-50">
                <button
                    onClick={onBack}
                    className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Seguimiento: {child.firstName} {child.lastName}</h2>
                    <p className="text-sky-500 font-bold uppercase tracking-wider text-xs">Historial de progresos y evaluaciones</p>
                </div>
            </div>

            {childEvaluations.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] shadow-xl border-4 border-dashed border-slate-100 text-center space-y-4">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold text-xl">Aún no hay evaluaciones para este niño/a.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {childEvaluations.map((ev) => {
                        const currentMode = viewMode[ev.id] || 'individual';
                        const isNewFormat = ev.indicators?.[0]?.evaluationsByChild !== undefined;

                        return (
                            <div key={ev.id} className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-50 overflow-hidden group hover:border-sky-100 transition-all">
                                <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {ev.level}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(ev.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-300" />
                                            <h4 className="text-lg font-black text-slate-700">{ev.establishment || "Sin Establecimiento"}</h4>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                            <button 
                                                onClick={() => setViewMode(prev => ({ ...prev, [ev.id]: 'individual' }))}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentMode === 'individual' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Individual
                                            </button>
                                            <button 
                                                onClick={() => setViewMode(prev => ({ ...prev, [ev.id]: 'general' }))}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentMode === 'general' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                General
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => exportToPDF(ev, currentMode)}
                                            className={`flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 whitespace-nowrap ${currentMode === 'individual' ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-100' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'}`}
                                        >
                                            <Download className="w-5 h-5" />
                                            PDF
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, ev.id)}
                                            disabled={isDeleting === ev.id}
                                            className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all disabled:opacity-50"
                                            title="Eliminar Evaluación"
                                        >
                                            {isDeleting === ev.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="px-8 pb-8">
                                    {currentMode === 'individual' ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="bg-sky-50 rounded-3xl p-6 border-2 border-sky-100/50">
                                                <h5 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-4">Resultados Individuales</h5>
                                                <div className="space-y-3">
                                                    {(ev.indicators || []).map((ind: any, i: number) => {
                                                        const result = isNewFormat ? ind.evaluationsByChild?.[child.id] : ind.finalAchievement;
                                                        const modeLabel = EVAL_MODES.find(m => m.id === result)?.label || '-';
                                                        
                                                        return (
                                                            <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                                <span className="text-xs font-bold text-slate-600 leading-tight pr-4">{ind.text}</span>
                                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black shadow-sm shrink-0 ${
                                                                    result === 'L' ? 'bg-emerald-500 text-white' :
                                                                    result === 'ML' ? 'bg-amber-500 text-white' :
                                                                    result === 'N/O' ? 'bg-slate-500 text-white' :
                                                                    'bg-slate-100 text-slate-400'
                                                                }`}>
                                                                    {(!result || result === 'None') ? 'PENDIENTE' : modeLabel}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="bg-rose-50 rounded-[2.5rem] p-6 border-2 border-rose-100/50 overflow-hidden">
                                                <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4">Matriz General de la Sesión</h5>
                                                <div className="overflow-x-auto custom-scrollbar -mx-2">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr>
                                                                <th className="p-0 border-b-2 border-r-2 border-rose-200 bg-rose-50/50 min-w-[200px] relative h-24">
                                                                    <div className="absolute top-2 right-4 text-[8px] font-black text-rose-400 uppercase tracking-widest">Indicadores</div>
                                                                    <div className="absolute bottom-2 left-4 text-[8px] font-black text-rose-400 uppercase tracking-widest">Nombres</div>
                                                                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #fecdd3, transparent calc(50% + 1px))' }}></div>
                                                                </th>
                                                                {(ev.child_ids || []).map((cid: string, idx: number) => {
                                                                    const childData = (children || []).find(c => c.id === cid);
                                                                    return (
                                                                        <th key={cid} className="p-0 border-b-2 border-r border-rose-200 bg-white min-w-[50px]">
                                                                            <div className="flex flex-col h-full">
                                                                                <div className="py-1 border-b border-rose-100 bg-rose-50/30 text-[8px] font-black text-rose-400 text-center">{idx + 1}</div>
                                                                                <div className="p-3 flex items-center justify-center min-h-[100px]">
                                                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter whitespace-nowrap block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                                                        {childData ? childData.firstName : `Niño ${idx + 1}`}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(ev.indicators || []).map((ind: any, objIdx: number) => (
                                                                <tr key={objIdx}>
                                                                    <td className="p-4 border-b border-r-2 border-rose-200 bg-white">
                                                                        <div className="flex gap-2 items-start">
                                                                            <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm">{objIdx + 1}</span>
                                                                            <span className="text-[10px] font-bold text-slate-700 leading-tight">{ind.text}</span>
                                                                        </div>
                                                                    </td>
                                                                    {(ev.child_ids || []).map((cid: string) => {
                                                                        const val = isNewFormat ? ind.evaluationsByChild?.[cid] : ind.finalAchievement;
                                                                        return (
                                                                            <td key={cid} className="p-2 border-b border-r border-rose-100 text-center bg-white">
                                                                                <span className={`inline-block w-8 h-8 leading-8 rounded-lg text-[10px] font-black ${
                                                                                    val === 'L' ? 'bg-emerald-50 text-emerald-600' :
                                                                                    val === 'ML' ? 'bg-amber-50 text-amber-600' :
                                                                                    val === 'N/O' ? 'bg-slate-50 text-slate-600' :
                                                                                    'text-slate-200'
                                                                                }`}>
                                                                                    {val || '-'}
                                                                                </span>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contenedores para PDF (Ocultos pero con Estilo Premium) */}
                                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', pointerEvents: 'none' }} aria-hidden="true">
                                    <div id={`pdf-eval-${ev.id}`} className="bg-white text-slate-800 font-sans p-16">
                                        <div className="min-w-[700px]">
                                            {/* Header Unificado Estilo Planificación */}
                                            <div className="flex items-center justify-between w-full border-b-8 border-sky-400 pb-12 mb-12">
                                                <div className="flex items-center gap-8">
                                                    <div className="p-6 bg-sky-500 rounded-[2rem]">
                                                        <Star className="text-white w-12 h-12 fill-white" />
                                                    </div>
                                                    <div>
                                                        <h1 className="text-6xl font-black text-slate-900 italic">Planifica</h1>
                                                        <p className="text-[14px] font-bold text-sky-400 uppercase tracking-[0.5em] mt-3">Reporte Individual</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] font-black text-slate-300 uppercase mb-2 tracking-widest">Emitido el</p>
                                                    <p className="text-lg font-black text-slate-800 bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100 italic">
                                                        {new Date(ev.created_at).toLocaleDateString('es-CL')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Grid de Información (Planning Style) */}
                                            <div className="grid grid-cols-3 gap-6 mb-16">
                                                <div className="bg-sky-50/50 p-8 rounded-[2.5rem] border-2 border-sky-100 flex items-center gap-6">
                                                    <div className="p-4 bg-white rounded-2xl text-sky-500 shadow-sm"><User className="w-8 h-8" /></div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-sky-500 uppercase mb-1 tracking-widest">Alumno/a</div>
                                                        <div className="text-xl font-black text-slate-900 leading-tight">{child.firstName} {child.lastName[0]}.</div>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border-2 border-amber-100 flex items-center gap-6">
                                                    <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm"><Building2 className="w-8 h-8" /></div>
                                                    <div className="overflow-hidden">
                                                        <div className="text-[11px] font-black text-amber-500 uppercase mb-1 tracking-widest">Establecimiento</div>
                                                        <div className="text-xl font-black text-slate-900 truncate">{ev.establishment || 'Educacional'}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 flex items-center gap-6">
                                                    <div className="p-4 bg-white rounded-2xl text-emerald-500 shadow-sm"><Target className="w-8 h-8" /></div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Nivel</div>
                                                        <div className="text-xl font-black text-slate-900">{ev.level}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Indicators Section (Planning Style) */}
                                            <div className="space-y-8">
                                                {(ev.indicators || []).map((ind: any, i: number) => {
                                                    const result = isNewFormat ? ind.evaluationsByChild?.[child.id] : ind.finalAchievement;
                                                    const colorClass = result === 'L' ? 'bg-emerald-500' : result === 'ML' ? 'bg-amber-500' : result === 'N/O' ? 'bg-rose-500' : 'bg-slate-400';
                                                    const bgClass = result === 'L' ? 'bg-emerald-50/20' : result === 'ML' ? 'bg-amber-50/20' : result === 'N/O' ? 'bg-rose-50/20' : 'bg-slate-50/20';
                                                    const textClass = result === 'L' ? 'text-emerald-700' : result === 'ML' ? 'text-amber-700' : result === 'N/O' ? 'text-rose-700' : 'text-slate-500';

                                                    return (
                                                        <div key={i} className="p-10 bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-sm flex gap-8 pdf-block">
                                                            <div className={`${colorClass} w-3 rounded-full shrink-0`}></div>
                                                            <div className="flex-1 space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <div className={`flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.3em] ${textClass}`}>
                                                                        Indicador {i + 1}
                                                                    </div>
                                                                    <div className={`px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest ${colorClass} text-white`}>
                                                                        {(!result || result === 'None') ? 'PENDIENTE' : (EVAL_MODES.find(m => m.id === result)?.full || result).toUpperCase()}
                                                                    </div>
                                                                </div>
                                                                <div className={`text-lg text-slate-900 ${bgClass} p-8 rounded-[2.5rem] leading-relaxed font-bold`}>
                                                                    {ind.text}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Footer Unificado */}
                                            <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-end">
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Simbología</p>
                                                    <div className="flex gap-6">
                                                        {EVAL_MODES.map(mode => (
                                                            <div key={mode.id} className="flex items-center gap-2">
                                                                <span className={`w-3 h-3 rounded-full ${mode.id === 'L' ? 'bg-emerald-500' : mode.id === 'ML' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                                                <span className="text-[10px] font-bold text-slate-500">{mode.id}: {mode.full}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-center w-72">
                                                    <div className="border-b-2 border-slate-200 mb-4 h-16 w-full"></div>
                                                    <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Firma Educadora Responsable</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '297mm', pointerEvents: 'none' }} aria-hidden="true">
                                    <div id={`pdf-matrix-${ev.id}`} className="bg-white p-16">
                                        <div className="min-w-[900px]">
                                            {/* Header Unificado Estilo Planificación (Landscape) */}
                                            <div className="flex items-center justify-between w-full border-b-8 border-sky-400 pb-12 mb-12">
                                                <div className="flex items-center gap-8">
                                                    <div className="p-6 bg-sky-500 rounded-[2rem]">
                                                        <Star className="text-white w-12 h-12 fill-white" />
                                                    </div>
                                                    <div>
                                                        <h1 className="text-6xl font-black text-slate-900 italic">Planifica</h1>
                                                        <p className="text-[14px] font-bold text-sky-400 uppercase tracking-[0.5em] mt-3">Matriz General de Sesión</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[12px] font-black text-slate-300 uppercase mb-2 tracking-widest">Emitido el</p>
                                                    <p className="text-lg font-black text-slate-800 bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100 italic">
                                                        {new Date(ev.created_at).toLocaleDateString('es-CL')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Grid de Información Contextual */}
                                            <div className="grid grid-cols-3 gap-6 mb-16 px-4">
                                                <div className="bg-sky-50/50 p-8 rounded-[2.5rem] border-2 border-sky-100 flex items-center gap-6">
                                                    <div className="p-4 bg-white rounded-2xl text-sky-500 shadow-sm"><Target className="w-8 h-8" /></div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-sky-500 uppercase mb-1 tracking-widest">Nivel</div>
                                                        <div className="text-xl font-black text-slate-900">{ev.level}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border-2 border-amber-100 flex items-center gap-6">
                                                    <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm"><Building2 className="w-8 h-8" /></div>
                                                    <div className="overflow-hidden">
                                                        <div className="text-[11px] font-black text-amber-500 uppercase mb-1 tracking-widest">Establecimiento</div>
                                                        <div className="text-xl font-black text-slate-900 truncate">{ev.establishment || 'Educacional'}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 flex items-center gap-6">
                                                    <div className="p-4 bg-white rounded-2xl text-emerald-500 shadow-sm"><Star className="w-8 h-8" /></div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Año/Período</div>
                                                        <div className="text-xl font-black text-slate-900">{ev.year || '2026'}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Matrix Table with Fixed Alignment */}
                                            <div className="overflow-hidden rounded-[3rem] border-2 border-slate-100 bg-white mb-16 shadow-sm">
                                                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                                                    <colgroup>
                                                        <col style={{ width: '35%' }} />
                                                        {(ev.child_ids || []).map((cid: string) => (
                                                            <col key={cid} style={{ width: `${65 / Math.max(1, (ev.child_ids || []).length)}%` }} />
                                                        ))}
                                                    </colgroup>
                                                    <thead>
                                                        <tr className="bg-slate-50/30">
                                                            <th className="p-0 border border-slate-100 relative h-32">
                                                                <div className="absolute inset-0 overflow-hidden">
                                                                    <svg className="w-full h-full" preserveAspectRatio="none">
                                                                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
                                                                    </svg>
                                                                </div>
                                                                <div className="absolute top-3 right-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicadores</div>
                                                                <div className="absolute bottom-3 left-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombres</div>
                                                            </th>
                                                            {(ev.child_ids || []).map((cid: string, idx: number) => {
                                                                const childData = (children || []).find(c => c.id === cid);
                                                                return (
                                                                    <th key={cid} className="p-0 border border-slate-100 bg-white min-w-[40px] align-bottom relative h-32">
                                                                        <div className="absolute top-0 inset-x-0 py-1.5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 text-center">{idx + 1}</div>
                                                                        <div className="h-24 w-full flex items-center justify-center overflow-hidden">
                                                                            <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight whitespace-nowrap inline-block" 
                                                                                  style={{ 
                                                                                      transform: 'rotate(-90deg)',
                                                                                      width: '100px',
                                                                                      textAlign: 'center'
                                                                                  }}>
                                                                                {childData ? `${childData.firstName} ${childData.lastName[0]}.` : `Niño ${idx + 1}`}
                                                                            </span>
                                                                        </div>
                                                                    </th>
                                                                );
                                                            })}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(ev.indicators || []).map((ind: any, objIdx: number) => (
                                                            <tr key={objIdx} className="pdf-block">
                                                                <td className="p-6 border border-slate-100 bg-white">
                                                                    <div className="flex gap-4 items-center">
                                                                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{objIdx + 1}</span>
                                                                        <span className="text-[13px] font-bold text-slate-800 leading-tight">{ind.text}</span>
                                                                    </div>
                                                                </td>
                                                                {(ev.child_ids || []).map((cid: string) => {
                                                                    const val = isNewFormat ? ind.evaluationsByChild?.[cid] : ind.finalAchievement;
                                                                    return (
                                                                        <td key={cid} className="p-1 border border-slate-100 text-center bg-white h-16">
                                                                            <div className="flex items-center justify-center h-full">
                                                                                <span className={`w-8 h-8 leading-[32px] rounded-xl text-[10px] font-black shadow-sm ${
                                                                                    val === 'L' ? 'bg-[#f0fdf4] text-[#166534] border border-[#bcf0da]' :
                                                                                    val === 'ML' ? 'bg-[#fffbeb] text-[#92400e] border border-[#fef3c7]' :
                                                                                    val === 'N/O' ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fee2e2]' :
                                                                                    'bg-slate-50 text-slate-200'
                                                                                }`}>
                                                                                    {val || '-'}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer Matriz Unificado */}
                                            <div className="mt-8 flex justify-between items-start px-8">
                                                <div className="space-y-6">
                                                    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Simbología</p>
                                                        <div className="flex gap-12">
                                                            {EVAL_MODES.map(mode => (
                                                                <div key={mode.id} className="flex items-center gap-3">
                                                                    <span className={`w-4 h-4 rounded-full ${mode.id === 'L' ? 'bg-emerald-500' : mode.id === 'ML' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                                                    <span className="text-[11px] font-bold text-slate-600">{mode.id}: {mode.full}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-20 pt-10">
                                                    <div className="text-center w-64">
                                                        <div className="border-b-2 border-slate-200 mb-4 h-16 w-full"></div>
                                                        <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Firma Educadora</p>
                                                    </div>
                                                    <div className="text-center w-64">
                                                        <div className="border-b-2 border-slate-200 mb-4 h-16 w-full"></div>
                                                        <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Timbre Institución</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EvaluationTrackingView;
