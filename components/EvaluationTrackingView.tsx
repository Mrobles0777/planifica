import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, Building2, User, ChevronRight, FileText, Trash2, Loader2 } from 'lucide-react';
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

    const exportToPDF = (evaluation: any, type: 'individual' | 'general' = 'individual') => {
        const elementId = type === 'individual' ? `pdf-eval-${evaluation.id}` : `pdf-matrix-${evaluation.id}`;
        const element = document.getElementById(elementId);
        if (!element) return;

        const isLandscape = type === 'general';
        const opt = {
            margin: 10,
            filename: `${type === 'individual' ? 'Evaluacion' : 'Matriz'}_${child.firstName}_${new Date(evaluation.created_at).toLocaleDateString()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: isLandscape ? 'landscape' : 'portrait' 
            }
        };

        // @ts-ignore
        html2pdf().set(opt).from(element).save();
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

                                {/* Contenido oculto para el PDF */}
                                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', background: 'white' }}>
                                    <div id={`pdf-eval-${ev.id}`} className="p-10 text-slate-800 font-sans shadow-none border-none">
                                        <div className="flex justify-between items-start mb-10 border-b-4 border-sky-500 pb-6">
                                            <div>
                                                <h1 className="text-3xl font-black text-sky-600 italic">Planifica</h1>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reporte de Evaluación Individual</p>
                                            </div>
                                            <div className="text-right text-xs">
                                                <p className="font-bold">{ev.establishment}</p>
                                                <p className="text-slate-400">RBD: {ev.rbd}</p>
                                                <p className="text-slate-400">{new Date(ev.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-3xl mb-10 flex gap-10">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">NIÑO/A</p>
                                                <p className="font-bold text-lg">{child.firstName} {child.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">NIVEL</p>
                                                <p className="font-bold text-lg">{ev.level}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">AÑO</p>
                                                <p className="font-bold text-lg">{ev.year}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-rose-100 rounded-xl">
                                                <div className="w-4 h-4 rounded-full bg-rose-500 shadow-sm"></div>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-700 tracking-tight">Eje Motricidad y Autonomía</h3>
                                        </div>

                                        <table className="w-full border-separate border-spacing-y-2">
                                            <thead>
                                                <tr>
                                                    <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicador</th>
                                                    <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(ev.indicators || []).map((ind: any, i: number) => {
                                                    const result = isNewFormat ? ind.evaluationsByChild?.[child.id] : ind.finalAchievement;
                                                    return (
                                                        <tr key={i}>
                                                            <td className="py-5 px-6 bg-slate-50/50 rounded-l-2xl text-xs font-bold text-slate-700 leading-relaxed border-y border-l border-slate-100">{ind.text}</td>
                                                            <td className="py-5 px-6 bg-white rounded-r-2xl border-y border-r border-slate-200">
                                                                <div className={`px-4 py-2 rounded-xl text-center text-[9px] font-black shadow-sm ${
                                                                    result !== 'None' && result 
                                                                        ? 'bg-sky-500 text-white border-none' 
                                                                        : 'bg-white text-slate-300 border border-slate-100'
                                                                }`}>
                                                                    {(!result || result === 'None') ? 'SIN EVALUAR' : (EVAL_MODES.find(m => m.id === result)?.full || result).toUpperCase()}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        
                                        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-end">
                                            <div className="text-[10px] text-slate-300">
                                                Documento generado por Planifica AI
                                            </div>
                                            <div className="text-center w-48">
                                                <div className="border-b border-slate-400 mb-2 h-10 w-full"></div>
                                                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500">Firma Educadora</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido oculto para el PDF de la MATRIZ GENERAL */}
                                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '297mm', background: 'white' }}>
                                    <div id={`pdf-matrix-${ev.id}`} className="p-10 text-slate-800 font-sans shadow-none border-none">
                                        <div className="flex justify-between items-start mb-10 border-b-4 border-rose-500 pb-6">
                                            <div>
                                                <h1 className="text-4xl font-black text-rose-600 italic">Planifica</h1>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matriz Técnica de Evaluación Grupal</p>
                                            </div>
                                            <div className="text-right text-xs">
                                                <p className="font-bold text-lg">{ev.establishment}</p>
                                                <p className="text-slate-400 font-bold">RBD: {ev.rbd} | NIVEL: {ev.level} | AÑO: {ev.year}</p>
                                                <p className="text-slate-400 font-bold">{new Date(ev.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        <table className="w-full border-collapse border-2 border-slate-200">
                                            <thead>
                                                <tr>
                                                    <th className="p-4 border-2 border-slate-200 bg-slate-50 min-w-[200px] relative h-28">
                                                        <div className="absolute top-2 right-4 text-[10px] font-black text-slate-400 uppercase">Indicadores</div>
                                                        <div className="absolute bottom-2 left-4 text-[10px] font-black text-slate-400 uppercase">Alumnos</div>
                                                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #e2e8f0, transparent calc(50% + 1px))' }}></div>
                                                    </th>
                                                    {(ev.child_ids || []).map((cid: string, idx: number) => {
                                                        const childData = (children || []).find(c => c.id === cid);
                                                        return (
                                                            <th key={cid} className="p-0 border-2 border-slate-200 bg-white min-w-[45px]">
                                                                <div className="flex flex-col h-full">
                                                                    <div className="py-1 border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 text-center">{idx + 1}</div>
                                                                    <div className="p-3 flex items-center justify-center min-h-[140px]">
                                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter whitespace-nowrap block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                                            {childData ? `${childData.firstName} ${childData.lastName[0]}.` : `Niño ${idx + 1}`}
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
                                                        <td className="p-4 border-2 border-slate-200 bg-white">
                                                            <div className="flex gap-3 items-start">
                                                                <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded shadow-sm shrink-0">{objIdx + 1}</span>
                                                                <span className="text-[12px] font-bold text-slate-800 leading-tight">{ind.text}</span>
                                                            </div>
                                                        </td>
                                                        {(ev.child_ids || []).map((cid: string) => {
                                                            const isNewFormat = ind.evaluationsByChild !== undefined;
                                                            const val = isNewFormat ? ind.evaluationsByChild?.[cid] : ind.finalAchievement;
                                                            return (
                                                                <td key={cid} className="p-1 border-2 border-slate-200 text-center bg-white">
                                                                    <span className={`inline-block w-8 h-8 leading-8 rounded-lg text-[11px] font-black ${
                                                                        val === 'L' ? 'bg-emerald-500 text-white' :
                                                                        val === 'ML' ? 'bg-amber-500 text-white' :
                                                                        val === 'N/O' ? 'bg-slate-500 text-white' :
                                                                        'text-slate-200 border border-slate-100'
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

                                        <div className="mt-12 flex justify-between items-end border-t-2 border-slate-100 pt-8">
                                            <div className="text-[10px] text-slate-400 font-bold">
                                                Simbología: L (Logrado) | ML (Medianamente Logrado) | N/O (No Observado)<br/>
                                                Documento Técnico generado por Planifica AI
                                            </div>
                                            <div className="flex gap-20">
                                                <div className="text-center w-48">
                                                    <div className="border-b-2 border-slate-300 mb-2 h-10 w-full"></div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Firma Educadora</p>
                                                </div>
                                                <div className="text-center w-48">
                                                    <div className="border-b-2 border-slate-300 mb-2 h-10 w-full"></div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Timbre Establecimiento</p>
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
