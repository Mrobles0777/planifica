import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, Building2, User, ChevronRight, FileText, Trash2, Loader2, Star, Target, TrendingUp, ChevronDown } from 'lucide-react';
import { Child, Nucleo } from '../types';
import { supabase } from '../supabaseClient';
import { CURRICULUM_DATA } from '../constants';

interface EvaluationTrackingViewProps {
    child: Child | null;
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
    const [selectedDashboardAmbito, setSelectedDashboardAmbito] = useState<string>('Desarrollo Personal y Social');

    const childEvaluations = child 
        ? (evaluations || []).filter(ev => ev.child_ids?.includes(child.id))
        : (evaluations || []);
    const ambitos = Array.from(new Set(CURRICULUM_DATA.map(n => n.ambito)));

    const calculateStats = (evals: any | any[]) => {
        const evaluationsToProcess = Array.isArray(evals) ? evals : [evals];
        const ambitosMap: Record<string, { total: number, L: number, ML: number, 'N/O': number, nucleos: Record<string, { total: number, L: number, ML: number, 'N/O': number }> }> = {};

        evaluationsToProcess.forEach(ev => {
            if (!ev.indicators) return;
            ev.indicators.forEach((ind: any) => {
                // Priorizar metadatos guardados (Solución a colisión de IDs)
                let ambito = ind.ambito;
                let nucleoName = ind.nucleo;

                // Fallback para registros antiguos (búsqueda por ID)
                if (!ambito || !nucleoName) {
                    const nucleoData = CURRICULUM_DATA.find(n => 
                        Object.values(n.objectives).some(objs => objs.some(o => o.id === ind.id))
                    );
                    if (nucleoData) {
                        ambito = nucleoData.ambito || 'Otros';
                        nucleoName = nucleoData.name;
                    }
                }

                if (ambito && nucleoName) {
                    if (!ambitosMap[ambito]) {
                        ambitosMap[ambito] = { total: 0, L: 0, ML: 0, 'N/O': 0, nucleos: {} };
                    }
                    if (!ambitosMap[ambito].nucleos[nucleoName]) {
                        ambitosMap[ambito].nucleos[nucleoName] = { total: 0, L: 0, ML: 0, 'N/O': 0 };
                    }

                    const evalsByChild = ind.evaluationsByChild || {};
                    const valuesToProcess = child ? [evalsByChild[child.id]] : Object.values(evalsByChild);

                    valuesToProcess.forEach((val: any) => {
                        if (!val) return;
                        ambitosMap[ambito].total++;
                        ambitosMap[ambito].nucleos[nucleoName].total++;
                        if (val === 'L') { ambitosMap[ambito].L++; ambitosMap[ambito].nucleos[nucleoName].L++; }
                        else if (val === 'ML') { ambitosMap[ambito].ML++; ambitosMap[ambito].nucleos[nucleoName].ML++; }
                        else if (val === 'N/O') { ambitosMap[ambito]['N/O']++; ambitosMap[ambito].nucleos[nucleoName]['N/O']++; }
                    });
                }
            });
        });

        return ambitosMap;
    };

    const exportToPDF = async (evaluation: any, type: 'individual' | 'general' | 'full' = 'individual') => {
        try {
            const elementId = type === 'full' ? 'pdf-full-report' : (type === 'individual' ? `pdf-eval-${evaluation.id}` : `pdf-matrix-${evaluation.id}`);
            const element = document.getElementById(elementId);
            if (!element) return;

            const isLandscape = type !== 'individual';
            const dateStr = new Date().toLocaleDateString('es-CL').replace(/\//g, '-');
            const sanitizedName = child 
                ? child.firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_')
                : 'General_Clase';
            const fileName = `Planifica_${type === 'full' ? 'Historial_Completo' : (type === 'individual' ? 'Reporte' : 'Matriz')}_${sanitizedName}.pdf`;

            const opt = {
                margin: isLandscape ? 5 : 0,
                filename: fileName,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff', letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: isLandscape ? 'landscape' : 'portrait', compress: true },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // @ts-ignore
            if (typeof html2pdf === 'undefined') { alert("La librería PDF no está lista."); return; }
            // @ts-ignore
            await html2pdf().set(opt).from(element).save();
        } catch (err) { console.error("Error PDF:", err); }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("¿Eliminar evaluación?")) return;
        setIsDeleting(id);
        try {
            const { error } = await supabase.from('evaluations').delete().eq('id', id);
            if (error) throw error;
            onFetchEvaluations();
        } catch (err) { console.error(err); } finally { setIsDeleting(null); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Tracking View */}
            <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-sky-50">
                <button
                    onClick={onBack}
                    className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">
                        {child ? `Seguimiento: ${child.firstName} ${child.lastName}` : 'Seguimiento General de Clase'}
                    </h2>
                    <p className="text-sky-500 font-bold uppercase tracking-wider text-xs italic">
                        {child ? 'Historial acumulado de progresos' : 'Consolidado de todas las evaluaciones del curso'}
                    </p>
                </div>
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={() => exportToPDF(null, 'full')}
                        className="flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-3xl font-black text-sm shadow-2xl transition-all active:scale-95 group"
                    >
                        <Download className="w-5 h-5 text-sky-400 group-hover:animate-bounce" />
                        Reporte Completo
                    </button>
                </div>
            </div>

            {childEvaluations.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] shadow-xl border-4 border-dashed border-slate-100 text-center space-y-4">
                    <FileText className="w-16 h-16 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold text-xl">Sin registros de evaluación.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 gap-6">
                        {childEvaluations.map((ev) => {
                            const currentMode = viewMode[ev.id] || 'individual';
                            const isNewFormat = ev.indicators?.[0]?.evaluationsByChild !== undefined;

                            return (
                                <div key={ev.id} className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-50 overflow-hidden group hover:border-sky-100 transition-all">
                                    <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-white to-slate-50/30">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100/50">
                                                    {ev.level}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(ev.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-slate-300" />
                                                <h4 className="text-lg font-black text-slate-700 italic">{ev.establishment || "Institución"}</h4>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
                                                <button 
                                                    onClick={() => setViewMode(prev => ({ ...prev, [ev.id]: 'individual' }))}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentMode === 'individual' ? 'bg-white text-sky-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Individual
                                                </button>
                                                <button 
                                                    onClick={() => setViewMode(prev => ({ ...prev, [ev.id]: 'general' }))}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentMode === 'general' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
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
                                            >
                                                {isDeleting === ev.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-8 pb-8">
                                        {currentMode === 'individual' ? (
                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                                <div className="bg-sky-50/30 rounded-3xl p-6 border-2 border-sky-100/30">
                                                    <h5 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-4 px-2">
                                                        {child ? `Logros Individuales para ${child.firstName}` : 'Logros Consolidados del Grupo'}
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {(ev.indicators || []).map((ind: any, i: number) => {
                                                            let result = '-';
                                                            if (child) {
                                                                result = ind.evaluationsByChild?.[child.id] || ind.finalAchievement;
                                                            } else {
                                                                // Modo general: mostrar tendencia o mayoría? 
                                                                // Por ahora mantenemos la matriz como principal para "General"
                                                                // Pero en la "tarjeta" individual si no hay niño, mostramos el conteo L
                                                                const vals = Object.values(ind.evaluationsByChild || {}) as string[];
                                                                const lCount = vals.filter(v => v === 'L').length;
                                                                result = `${lCount} L`;
                                                            }
                                                            return (
                                                                <div key={i} className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                                    <span className="text-xs font-bold text-slate-700 leading-tight pr-4">{ind.text}</span>
                                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black shadow-sm shrink-0 border ${
                                                                        child && result === 'L' ? 'bg-emerald-500 text-white border-emerald-400' :
                                                                        child && result === 'ML' ? 'bg-amber-500 text-white border-amber-400' :
                                                                        child && result === 'N/O' ? 'bg-slate-500 text-white border-slate-400' :
                                                                        !child ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                                                        'bg-slate-50 text-slate-300 border-slate-100'
                                                                    }`}>
                                                                        {result}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                                <div className="bg-rose-50/30 rounded-[2.5rem] p-6 border-2 border-rose-100/30 overflow-hidden shadow-inner">
                                                    <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4 px-2">Matriz General de Clase</h5>
                                                    <div className="overflow-x-auto custom-scrollbar -mx-2">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr>
                                                                    <th className="p-0 border-b-2 border-r-2 border-rose-100 bg-rose-50/50 min-w-[220px] relative h-28">
                                                                        <div className="absolute top-3 right-5 text-[9px] font-black text-rose-400 uppercase tracking-widest">Nombres</div>
                                                                        <div className="absolute bottom-3 left-5 text-[9px] font-black text-rose-400 uppercase tracking-widest">Indicadores</div>
                                                                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #fee2e2, transparent calc(50% + 1px))' }}></div>
                                                                    </th>
                                                                    {(ev.child_ids || []).map((cid: string, idx: number) => {
                                                                        const childData = (children || []).find(c => c.id === cid);
                                                                        return (
                                                                            <th key={cid} className="p-0 border-b-2 border-r border-rose-100 bg-white min-w-[55px] relative">
                                                                                <div className="absolute top-0 inset-x-0 py-1 bg-rose-50/50 text-[8px] font-black text-rose-300 border-b border-rose-100/50">{idx + 1}</div>
                                                                                <div className="p-3 flex items-center justify-center min-h-[110px] pt-6">
                                                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter whitespace-nowrap block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                                                        {childData ? childData.firstName : `Niño ${idx + 1}`}
                                                                                    </span>
                                                                                </div>
                                                                            </th>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(ev.indicators || []).map((ind: any, objIdx: number) => (
                                                                    <tr key={objIdx} className="hover:bg-rose-50/20 transition-colors">
                                                                        <td className="p-4 border-b border-r-2 border-rose-100 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                                                                            <div className="flex gap-3 items-center">
                                                                                <span className="text-[10px] font-black bg-rose-500 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-sm shrink-0">{objIdx + 1}</span>
                                                                                <span className="text-[11px] font-bold text-slate-700 leading-tight">{ind.text}</span>
                                                                            </div>
                                                                        </td>
                                                                        {(ev.child_ids || []).map((cid: string) => {
                                                                            const val = isNewFormat ? ind.evaluationsByChild?.[cid] : ind.finalAchievement;
                                                                            return (
                                                                                <td key={cid} className="p-2 border-b border-r border-rose-50 text-center bg-white">
                                                                                    <span className={`inline-block w-9 h-9 border-2 leading-8 rounded-xl text-[10px] font-black transition-all ${
                                                                                        val === 'L' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' :
                                                                                        val === 'ML' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm' :
                                                                                        val === 'N/O' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm' :
                                                                                        'text-slate-100 border-transparent bg-transparent'
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

                                    {/* HIDDEN PDF CONTAINERS (Per Session) */}
                                    <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', pointerEvents: 'none' }} aria-hidden="true">
                                        <div id={`pdf-eval-${ev.id}`} className="bg-white p-12 text-slate-900 font-sans">
                                            <div className="border-b-[10px] border-sky-500 pb-10 mb-10 flex justify-between items-center">
                                                <div className="flex items-center gap-6">
                                                    <Star className="text-sky-500 w-16 h-16 fill-sky-500" />
                                                    <div>
                                                        <h1 className="text-6xl font-black italic tracking-tighter">Planifica</h1>
                                                        <p className="text-xs font-black uppercase tracking-[0.6em] text-sky-400 mt-2">Reporte Individual de Evaluación</p>
                                                    </div>
                                                </div>
                                                <div className="text-right bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Fecha</p>
                                                    <p className="text-lg font-black italic">{new Date(ev.created_at).toLocaleDateString('es-CL')}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-6 mb-12">
                                                <div className="bg-sky-50 p-6 rounded-[2rem] border border-sky-200">
                                                    <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest mb-1">Entidad</p>
                                                    <p className="text-xl font-black">{child ? `${child.firstName} ${child.lastName}` : 'Grupo Completo'}</p>
                                                </div>
                                                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-200">
                                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Nivel</p>
                                                    <p className="text-xl font-black">{ev.level}</p>
                                                </div>
                                                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-200">
                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Institución</p>
                                                    <p className="text-xl font-black truncate">{ev.establishment || 'Educación'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                {(ev.indicators || []).map((ind: any, i: number) => {
                                                    const result = isNewFormat ? ind.evaluationsByChild?.[child.id] : ind.finalAchievement;
                                                    const color = result === 'L' ? '#10b981' : result === 'ML' ? '#f59e0b' : result === 'N/O' ? '#ef4444' : '#64748b';
                                                    return (
                                                        <div key={i} className="p-8 border-2 border-slate-100 rounded-[3rem] shadow-sm flex items-center gap-8 pdf-block">
                                                            <div className="w-4 h-full rounded-full" style={{ background: color }}></div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: color }}>Indicador {i + 1}</span>
                                                                    <span className="px-5 py-2 rounded-xl text-[10px] font-black text-white shadow-sm" style={{ background: color }}>
                                                                        {child ? (ind.evaluationsByChild?.[child.id] || ind.finalAchievement || 'PENDIENTE') : 'CONSOLIDADO'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xl font-bold text-slate-800 leading-tight">{ind.text}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-20 pt-10 border-t-2 border-slate-50 flex justify-between">
                                                <div className="w-1/2">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Simbología: L (Logrado) - ML (Medianamente Logrado) - N/O (No Observado)</p>
                                                </div>
                                                <div className="text-center w-64 border-t-4 border-slate-100 pt-4">
                                                    <p className="text-xs font-black uppercase text-slate-400 italic">Firma Profesional</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div id={`pdf-matrix-${ev.id}`} className="bg-white p-10 font-sans" style={{ width: '297mm' }}>
                                            <div className="border-b-[10px] border-sky-400 pb-8 mb-8 flex justify-between items-center">
                                                <div className="flex items-center gap-6">
                                                    <Star className="text-sky-400 w-14 h-14 fill-sky-400" />
                                                    <div>
                                                        <h1 className="text-5xl font-black italic tracking-tighter">Planifica</h1>
                                                        <p className="text-xs font-black uppercase tracking-[0.6em] text-sky-300 mt-2">Matriz Técnica de Evaluación Global</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest leading-none">Emisión</p>
                                                    <p className="text-lg font-black bg-slate-50 px-6 py-2 rounded-xl border-2 border-slate-100 italic">{new Date(ev.created_at).toLocaleDateString('es-CL')}</p>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden rounded-[3.5rem] border-4 border-slate-100 mb-10 shadow-sm bg-white">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50">
                                                            <th className="p-0 border border-slate-100 relative h-32 w-[25%] bg-slate-50/30">
                                                                <div className="absolute top-3 right-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumnos</div>
                                                                <div className="absolute bottom-3 left-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicadores</div>
                                                                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #f1f5f9, transparent calc(50% + 1px))' }}></div>
                                                            </th>
                                                            {(ev.child_ids || []).map((cid: string, idx: number) => {
                                                                const childData = (children || []).find(c => c.id === cid);
                                                                return (
                                                                    <th key={cid} className="p-0 border border-slate-100 align-bottom relative h-32 bg-white min-w-[35px]">
                                                                        <div className="absolute top-0 inset-x-0 py-1 bg-slate-50/30 text-[8px] font-black text-slate-400 border-b border-slate-50">{idx + 1}</div>
                                                                        <div className="h-full w-full flex items-center justify-center pt-8 overflow-hidden">
                                                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{childData ? childData.firstName : idx + 1}</span>
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
                                                                        <span className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">{objIdx + 1}</span>
                                                                        <span className="text-sm font-bold text-slate-800 leading-tight">{ind.text}</span>
                                                                    </div>
                                                                </td>
                                                                {(ev.child_ids || []).map((cid: string) => {
                                                                    const val = isNewFormat ? ind.evaluationsByChild?.[cid] : ind.finalAchievement;
                                                                    return (
                                                                        <td key={cid} className="p-1 border border-slate-100 text-center bg-white h-16">
                                                                            <span className={`inline-block w-8 h-8 leading-[32px] rounded-xl text-[10px] font-black ${
                                                                                val === 'L' ? 'bg-[#f0fdf4] text-[#166534]' :
                                                                                val === 'ML' ? 'bg-[#fffbeb] text-[#92400e]' :
                                                                                val === 'N/O' ? 'bg-[#fef2f2] text-[#991b1b]' : 'bg-slate-50 text-slate-200'
                                                                            }`}>{val || '-'}</span>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Report Summary in PDF */}
                                            {(() => {
                                                const stats = calculateStats(ev);
                                                const currentStats = stats?.[selectedDashboardAmbito];
                                                if (!currentStats) return null;
                                                const getP = (v: number) => ((v / currentStats.total) * 100).toFixed(0);
                                                return (
                                                    <div className="mt-10 html2pdf__page-break bg-slate-50/50 p-10 rounded-[4rem] border-2 border-slate-100">
                                                        <div className="bg-[#10b981] p-12 rounded-[3.5rem] text-white flex justify-between items-center mb-10 shadow-lg relative overflow-hidden">
                                                            <div className="relative z-10 flex items-center gap-8">
                                                                <div className="p-6 bg-white/20 rounded-[2.5rem] border border-white/30 backdrop-blur-md"><TrendingUp className="w-12 h-12" /></div>
                                                                <div>
                                                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-80 mb-2">Logro Destacado de Sesión</p>
                                                                    <h4 className="text-3xl font-black max-w-[450px] leading-tight">{selectedDashboardAmbito}</h4>
                                                                </div>
                                                            </div>
                                                            <div className="relative z-10 text-right">
                                                                <p className="text-8xl font-black tracking-tighter">{getP(currentStats.L)}%</p>
                                                                <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-70 mt-2 italic">Nivel de Éxito Alumnos (L)</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
                                                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-sky-400"></div>Desglose por Núcleos</h5>
                                                            <div className="grid grid-cols-1 gap-12">
                                                                {Object.entries(currentStats.nucleos).map(([name, nStats]: any) => {
                                                                    const lp = (nStats.L / nStats.total * 100);
                                                                    return (
                                                                        <div key={name} className="space-y-4">
                                                                            <div className="flex justify-between items-end"><p className="text-lg font-black text-slate-800 italic uppercase">{name}</p><p className="text-[11px] font-black text-sky-500 bg-sky-50 px-4 py-2 rounded-xl border border-sky-100">{nStats.total} EVALS.</p></div>
                                                                            <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner"><div style={{ width: `${lp}%` }} className="h-full bg-sky-500 transition-all duration-700"></div><div className="flex-1 bg-slate-200"></div></div>
                                                                            <p className="text-[10px] font-black text-slate-400 text-right uppercase tracking-[0.2em]">Logrado: {lp.toFixed(0)}%</p>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="mt-16 flex justify-around gap-12 pt-10">
                                                            <div className="text-center w-72"><div className="border-b-4 border-slate-200 h-16 mb-4"></div><p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Firma Educadora</p></div>
                                                            <div className="text-center w-72"><div className="border-b-4 border-slate-200 h-16 mb-4"></div><p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Timbre Registro</p></div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* GLOBAL DASHBOARD (End of View) */}
                    <div className="mt-16 bg-white rounded-[4rem] p-12 border-4 border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-10">
                            <div className="text-center lg:text-left">
                                <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 justify-center lg:justify-start italic group">
                                    <Star className="w-10 h-10 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />
                                    Dashboard Global de Seguimiento
                                </h3>
                                <p className="text-xs font-black text-slate-400 mt-3 uppercase tracking-[0.3em] font-sans">Análisis consolidado del historial completo del curso</p>
                            </div>
                            
                            <div className="relative min-w-[320px] group">
                                <select
                                    value={selectedDashboardAmbito}
                                    onChange={(e) => setSelectedDashboardAmbito(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border-4 border-slate-50 text-slate-700 font-black uppercase tracking-widest text-xs py-5 px-8 pr-14 rounded-[2rem] cursor-pointer focus:outline-none focus:border-sky-300 focus:bg-white focus:ring-8 focus:ring-sky-50 transition-all shadow-inner"
                                >
                                    {ambitos.map(amb => (
                                        <option key={amb} value={amb}>{amb}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none group-focus-within:text-sky-500 transition-colors" />
                            </div>
                        </div>

                        {(() => {
                            const globalStats = calculateStats(childEvaluations);
                            const currentAmbito = globalStats?.[selectedDashboardAmbito];
                            if (!currentAmbito) return (
                                <div className="bg-slate-50 p-24 rounded-[4rem] border-4 border-dashed border-slate-100 text-center">
                                    <FileText className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                                    <p className="text-slate-400 font-black text-xl italic uppercase tracking-widest">Sin datos suficientes para este Ámbito</p>
                                </div>
                            );
                            const gp = (v: number) => ((v / (currentAmbito.total || 1)) * 100).toFixed(0);

                            return (
                                <div className="space-y-16">
                                    {/* Global achievement card */}
                                    <div className="bg-slate-900 p-16 rounded-[5rem] text-white flex flex-col xl:flex-row items-center justify-between gap-16 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                                        
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                            <div className="p-10 bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                                                <TrendingUp className="w-20 h-20 text-sky-400" />
                                            </div>
                                            <div className="text-center md:text-left max-w-xl">
                                                <h4 className="text-xs font-black uppercase tracking-[0.5em] text-sky-400 mb-4 opacity-70">Rendimiento Técnico Acumulado</h4>
                                                <p className="text-3xl font-black italic text-white uppercase leading-tight tracking-tight drop-shadow-sm">{selectedDashboardAmbito}</p>
                                                <div className="flex gap-10 mt-8">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Muestras Totales</p>
                                                        <div className="text-2xl font-black text-slate-300">{currentAmbito.total}</div>
                                                    </div>
                                                    <div className="w-px h-10 bg-white/10 self-center"></div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Impacto Positivo</p>
                                                        <div className="text-2xl font-black text-sky-400">Excelente</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center xl:items-end">
                                            <div className="text-[150px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 animate-pulse-slow">
                                                {gp(currentAmbito.L)}<span className="text-5xl text-sky-400">%</span>
                                            </div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.8em] text-sky-400/70 italic mt-4">Tasa de Logro (L)</p>
                                        </div>
                                    </div>

                                    {/* Nucleo breakdown global */}
                                    <div className="space-y-12">
                                        <div className="flex items-center gap-6 px-4">
                                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">Desglose Técnico por Núcleo</h4>
                                            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {Object.entries(currentAmbito.nucleos).map(([name, ns]: any) => {
                                                const lp = (ns.L / (ns.total || 1)) * 100;
                                                const mlp = (ns.ML / (ns.total || 1)) * 100;
                                                const nop = (ns['N/O'] / (ns.total || 1)) * 100;
                                                return (
                                                    <div key={name} className="bg-slate-50/50 p-10 rounded-[4rem] border-2 border-transparent hover:border-sky-100 hover:bg-white transition-all group hover:shadow-2xl hover:shadow-sky-500/5">
                                                        <div className="flex justify-between items-start mb-8">
                                                            <h5 className="text-lg font-black text-slate-800 italic uppercase leading-tight max-w-[70%] group-hover:text-sky-600 transition-colors">{name}</h5>
                                                            <div className="bg-white px-5 py-2 rounded-2xl border-2 border-slate-100 text-[10px] font-black text-slate-400 shadow-sm group-hover:border-sky-100 group-hover:text-sky-500 transition-all font-sans">
                                                                {ns.total} EVALS.
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="h-5 w-full bg-slate-200/50 rounded-full overflow-hidden flex shadow-inner mb-6">
                                                            <div style={{ width: `${lp}%` }} className="h-full bg-sky-500 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.1)] transition-all duration-1000"></div>
                                                            <div style={{ width: `${mlp}%` }} className="h-full bg-emerald-400 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.1)] transition-all duration-1000"></div>
                                                            <div style={{ width: `${nop}%` }} className="h-full bg-slate-200 transition-all duration-1000"></div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-500 px-2 uppercase italic">
                                                            <div className="flex gap-8">
                                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Logro: {lp.toFixed(0)}%</span>
                                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Med: {mlp.toFixed(0)}%</span>
                                                            </div>
                                                            <span className="opacity-60 pl-4 border-l-2 border-slate-200">N/O: {nop.toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* HIDDEN FULL REPORT PDF CONTAINER */}
                    <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '297mm', pointerEvents: 'none' }} aria-hidden="true">
                        <div id="pdf-full-report" className="bg-white p-12 font-sans" style={{ width: '297mm' }}>
                            <div className="border-b-[12px] border-slate-900 pb-10 mb-10 flex justify-between items-center">
                                <div className="flex items-center gap-8">
                                    <Star className="text-amber-400 w-20 h-20 fill-amber-400" />
                                    <div>
                                        <h1 className="text-7xl font-black italic tracking-tighter text-slate-900">Planifica</h1>
                                        <p className="text-sm font-black uppercase tracking-[0.8em] text-sky-500 mt-2">Reporte Consolidado de Seguimiento Histórico</p>
                                    </div>
                                </div>
                                <div className="text-right bg-slate-50 p-8 rounded-[2.5rem] border-4 border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fecha de Reporte</p>
                                    <p className="text-2xl font-black italic text-slate-800">{new Date().toLocaleDateString('es-CL')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-16">
                                <div className="bg-sky-50 p-8 rounded-[3rem] border-2 border-sky-100">
                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">Entidad</p>
                                    <p className="text-2xl font-black text-slate-800">{child ? `${child.firstName} ${child.lastName}` : 'General Clase'}</p>
                                </div>
                                <div className="bg-amber-50 p-8 rounded-[3rem] border-2 border-amber-100">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Registros</p>
                                    <p className="text-2xl font-black text-slate-800">{childEvaluations.length} Sesiones</p>
                                </div>
                                <div className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Población</p>
                                    <p className="text-2xl font-black text-slate-800">{child ? 'Individual' : `${children.length} Alumnos`}</p>
                                </div>
                            </div>

                            {/* Dashboard Highlights for ALL Ambitos */}
                            <div className="space-y-12 mb-20 bg-slate-50/50 p-12 rounded-[5rem] border-4 border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest italic mb-10 flex items-center gap-4">
                                    <TrendingUp className="w-8 h-8 text-sky-500" />
                                    Análisis de Logros por Ámbitos (Variantes)
                                </h3>
                                <div className="grid grid-cols-2 gap-10">
                                    {ambitos.map(amb => {
                                        const stats = calculateStats(childEvaluations)[amb];
                                        if (!stats || stats.total === 0) return null;
                                        const p = ((stats.L / stats.total) * 100).toFixed(0);
                                        return (
                                            <div key={amb} className="bg-white p-10 rounded-[4rem] border-4 border-slate-100 shadow-sm flex items-center justify-between">
                                                <div className="max-w-[70%]">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Ámbito</p>
                                                    <h4 className="text-lg font-black text-slate-800 italic leading-tight uppercase">{amb}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-5xl font-black text-sky-500 tracking-tighter">{p}%</p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Logro (L)</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chronological History List */}
                            <div className="html2pdf__page-break"></div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest italic mb-12 flex items-center gap-6">
                                <div className="w-12 h-px bg-slate-200"></div>
                                Historial Detallado de Sesiones
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </h3>
                            
                            <div className="space-y-16">
                                {childEvaluations.map((ev, idx) => (
                                    <div key={ev.id} className="pdf-block bg-white p-10 rounded-[4rem] border-4 border-slate-100 relative shadow-sm">
                                        <div className="absolute top-8 right-10 flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sesión {childEvaluations.length - idx}</span>
                                            <span className="bg-slate-50 px-4 py-2 rounded-xl text-lg font-black italic border2 border-slate-100">{new Date(ev.created_at).toLocaleDateString('es-CL')}</span>
                                        </div>
                                        <div className="mb-8">
                                            <h4 className="text-xl font-black text-slate-800 italic uppercase">{ev.level}</h4>
                                            <p className="text-xs font-black text-sky-500 uppercase tracking-widest mt-1">{ev.establishment || 'Educación'}</p>
                                        </div>
                                        <div className="space-y-4">
                                            {(ev.indicators || []).map((ind: any, i: number) => {
                                                let res = '-';
                                                if (child) {
                                                    res = ind.evaluationsByChild?.[child.id] || ind.finalAchievement;
                                                } else {
                                                    const v = Object.values(ind.evaluationsByChild || {});
                                                    res = `${v.filter(x => x === 'L').length} L / ${v.length}`;
                                                }
                                                return (
                                                    <div key={i} className="flex justify-between items-center p-6 bg-slate-50/50 rounded-2xl border-2 border-slate-50/50">
                                                        <span className="text-sm font-bold text-slate-700 max-w-[80%]">{ind.text}</span>
                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${
                                                            child && res === 'L' ? 'bg-emerald-500 text-white' :
                                                            child && res === 'ML' ? 'bg-amber-500 text-white' :
                                                            child && res === 'N/O' ? 'bg-rose-500 text-white' : 
                                                            !child ? 'bg-slate-800 text-white' :
                                                            'bg-slate-200 text-slate-400'
                                                        }`}>{res}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-24 pt-12 border-t-8 border-slate-900 flex justify-between">
                                <div className="w-1/2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic">Sistema de Gestión Curricular - Planifica 2026</p>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> <span className="text-[10px] font-black text-slate-500">L: Logrado</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> <span className="text-[10px] font-black text-slate-500">ML: Med. Logrado</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> <span className="text-[10px] font-black text-slate-500">N/O: No Obs.</span></div>
                                    </div>
                                </div>
                                <div className="text-center w-80 border-t-8 border-slate-100 pt-6">
                                    <p className="text-sm font-black uppercase text-slate-400 italic tracking-widest">Firma y Timbre Directivo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationTrackingView;
