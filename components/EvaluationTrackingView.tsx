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
                                    <div id={`pdf-eval-${ev.id}`} className="bg-white text-slate-800 font-sans">
                                        {/* Header Premium Individual */}
                                        <div className="relative h-48 bg-gradient-to-r from-sky-500 to-sky-600 p-12 overflow-hidden">
                                            <div className="relative z-10 flex justify-between items-start">
                                                <div>
                                                    <h1 className="text-5xl font-black text-white italic tracking-tighter">Planifica</h1>
                                                    <p className="text-sky-100 text-xs font-black uppercase tracking-[0.3em] mt-2">Reporte Individual de Progreso</p>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/30 text-right">
                                                    <p className="text-[10px] font-black text-sky-50 uppercase tracking-widest mb-1">FECHA DE SESIÓN</p>
                                                    <p className="text-white font-bold text-lg">{new Date(ev.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                        </div>

                                        <div className="p-12 -mt-12 relative z-10">
                                            {/* Child Info Card */}
                                            <div className="bg-white rounded-[3rem] shadow-2xl p-10 border-4 border-slate-50 flex gap-10 mb-12">
                                                <div className="w-24 h-24 bg-sky-50 rounded-[2rem] flex items-center justify-center border-2 border-sky-100 shrink-0">
                                                    <User className="w-12 h-12 text-sky-500" />
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-8">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">ALUMNO/A</p>
                                                        <p className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{child.firstName} {child.lastName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">NIVEL EDUCATIVO</p>
                                                        <p className="text-xl font-bold text-slate-700">{ev.level}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Institution Header */}
                                            <div className="flex items-center gap-4 mb-8 pl-4">
                                                <div className="w-1.5 h-8 bg-sky-500 rounded-full"></div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{ev.establishment || "Sin Establecimiento"}</h3>
                                                    <p className="text-sm font-bold text-slate-400">RBD: {ev.rbd || "---"} | Período: {ev.year || "2026"}</p>
                                                </div>
                                            </div>

                                            {/* Indicators Table */}
                                            <div className="bg-slate-50/50 rounded-[2.5rem] p-4 border border-slate-100">
                                                <table className="w-full border-separate border-spacing-y-3">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Objetivo de Aprendizaje / Indicador</th>
                                                            <th className="text-center py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">Logro</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(ev.indicators || []).map((ind: any, i: number) => {
                                                            const result = isNewFormat ? ind.evaluationsByChild?.[child.id] : ind.finalAchievement;
                                                            return (
                                                                <tr key={i} className="pdf-block">
                                                                    <td className="py-6 px-10 bg-white rounded-l-[2rem] border-y border-l border-slate-100 text-sm font-bold text-slate-700 leading-relaxed shadow-sm">
                                                                        <div className="flex items-start gap-4">
                                                                            <span className="shrink-0 w-6 h-6 bg-slate-800 text-white rounded-lg flex items-center justify-center text-[10px] font-black mt-1">{i + 1}</span>
                                                                            {ind.text}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-6 px-10 bg-white rounded-r-[2rem] border-y border-r border-slate-100 shadow-sm text-center">
                                                                        <div className={`inline-block px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-widest ${
                                                                            result === 'L' ? 'bg-emerald-500 text-white' :
                                                                            result === 'ML' ? 'bg-amber-500 text-white' :
                                                                            result === 'N/O' ? 'bg-slate-500 text-white' :
                                                                            'bg-slate-100 text-slate-300'
                                                                        }`}>
                                                                            {(!result || result === 'None') ? 'PENDIENTE' : (EVAL_MODES.find(m => m.id === result)?.full || result).toUpperCase()}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer Signature Section */}
                                            <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-end px-4">
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Simbología</p>
                                                    <div className="flex gap-6">
                                                        {EVAL_MODES.map(mode => (
                                                            <div key={mode.id} className="flex items-center gap-2">
                                                                <span className={`w-3 h-3 rounded-full ${mode.id === 'L' ? 'bg-emerald-500' : mode.id === 'ML' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                                                                <span className="text-[10px] font-bold text-slate-500">{mode.id}: {mode.full}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-center w-64 pb-2">
                                                    <div className="border-b-2 border-slate-200 mb-4 h-12 w-full"></div>
                                                    <p className="text-xs font-black uppercase text-slate-500 tracking-tighter">Firma Educadora Responsable</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '297mm', pointerEvents: 'none' }} aria-hidden="true">
                                    <div id={`pdf-matrix-${ev.id}`} className="bg-white text-slate-800 font-sans p-12">
                                        {/* Header Matriz Premium */}
                                        <div className="flex justify-between items-end mb-12 border-b-8 border-rose-500 pb-8">
                                            <div>
                                                <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">Planifica</h1>
                                                <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-sm mt-2">Matriz Técnica de Evaluación Grupal</p>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-2xl font-black text-slate-800">{ev.establishment || "Institución Educacional"}</p>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                    NIVEL: {ev.level} | RBD: {ev.rbd || "---"} | AÑO: {ev.year || "2026"}
                                                </p>
                                                <p className="text-rose-500 font-black text-lg">Sesión: {new Date(ev.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        {/* Matrix Table */}
                                        <table className="w-full border-collapse border-4 border-slate-100">
                                            <thead>
                                                <tr>
                                                    <th className="p-8 border-4 border-slate-100 bg-slate-50/50 min-w-[300px] relative h-40">
                                                        <div className="absolute top-4 right-8 text-xs font-black text-slate-400 uppercase tracking-widest">Indicadores de Evaluación</div>
                                                        <div className="absolute bottom-4 left-8 text-xs font-black text-slate-400 uppercase tracking-widest">Nómina de Alumnos</div>
                                                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #f1f5f9, transparent calc(50% + 1px))' }}></div>
                                                    </th>
                                                    {(ev.child_ids || []).map((cid: string, idx: number) => {
                                                        const childData = (children || []).find(c => c.id === cid);
                                                        return (
                                                            <th key={cid} className="p-0 border-4 border-slate-100 bg-white min-w-[60px]">
                                                                <div className="flex flex-col h-full">
                                                                    <div className="py-2 border-b-2 border-slate-50 bg-rose-50 text-xs font-black text-rose-500 text-center">{idx + 1}</div>
                                                                    <div className="p-4 flex items-center justify-center min-h-[180px]">
                                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-tighter whitespace-nowrap block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
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
                                                    <tr key={objIdx} className="pdf-block">
                                                        <td className="p-6 border-4 border-slate-100 bg-white">
                                                            <div className="flex gap-4 items-start">
                                                                <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl shadow-sm shrink-0">{objIdx + 1}</span>
                                                                <span className="text-sm font-bold text-slate-800 leading-snug">{ind.text}</span>
                                                            </div>
                                                        </td>
                                                        {(ev.child_ids || []).map((cid: string) => {
                                                            const isNewFormat = ind.evaluationsByChild !== undefined;
                                                            const val = isNewFormat ? ind.evaluationsByChild?.[cid] : ind.finalAchievement;
                                                            return (
                                                                <td key={cid} className="p-2 border-4 border-slate-100 text-center bg-white">
                                                                    <span className={`inline-block w-10 h-10 leading-10 rounded-2xl text-xs font-black shadow-sm ${
                                                                        val === 'L' ? 'bg-emerald-500 text-white' :
                                                                        val === 'ML' ? 'bg-amber-500 text-white' :
                                                                        val === 'N/O' ? 'bg-slate-500 text-white' :
                                                                        'text-slate-200 border-2 border-slate-50'
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

                                        {/* Footer Matrix */}
                                        <div className="mt-16 flex justify-between items-start">
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">CONVENCIONES DE EVALUACIÓN</p>
                                                    <div className="flex gap-10">
                                                        <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-lg bg-emerald-500"></span><span className="text-xs font-bold text-slate-600">L: Logrado</span></div>
                                                        <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-lg bg-amber-500"></span><span className="text-xs font-bold text-slate-600">ML: Mediante Logrado</span></div>
                                                        <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-lg bg-slate-500"></span><span className="text-xs font-bold text-slate-600">N/O: No Observado</span></div>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-300 font-bold pl-4 uppercase tracking-tighter">Planifica AI - Sistema de Gestión Curricular Avanzado</p>
                                            </div>
                                            <div className="flex gap-24 pt-10">
                                                <div className="text-center w-56">
                                                    <div className="border-b-4 border-slate-100 mb-4 h-16 w-full"></div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Firma Educadora</p>
                                                </div>
                                                <div className="text-center w-56">
                                                    <div className="border-b-4 border-slate-100 mb-4 h-16 w-full"></div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Timbre Oficial</p>
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
