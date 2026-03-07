import { ArrowLeft, Download, Calendar, Building2, User, ChevronRight, FileText, Trash2, Loader2 } from 'lucide-react';
import { Child } from '../types';
import { supabase } from '../supabaseClient';
import { useState } from 'react';

interface EvaluationTrackingViewProps {
    child: Child;
    evaluations: any[];
    onBack: () => void;
    onFetchEvaluations: () => void;
}

const EvaluationTrackingView: React.FC<EvaluationTrackingViewProps> = ({ child, evaluations, onBack, onFetchEvaluations }) => {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const childEvaluations = evaluations.filter(ev => ev.child_ids?.includes(child.id));

    const exportToPDF = (evaluation: any) => {
        const element = document.getElementById(`pdf-eval-${evaluation.id}`);
        if (!element) return;

        const opt = {
            margin: 10,
            filename: `Evaluacion_${child.firstName}_${new Date(evaluation.created_at).toLocaleDateString()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
                    {childEvaluations.map((ev) => (
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
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => exportToPDF(ev)}
                                        className="flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-sky-100 transition-all active:scale-95 whitespace-nowrap"
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

                            {/* Contenido oculto para el PDF - Posicionado fuera de pantalla para que html2pdf pueda verlo */}
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
                                                <th className="text-center py-4 px-2 text-[10px] font-black text-slate-400 uppercase">M1</th>
                                                <th className="text-center py-4 px-2 text-[10px] font-black text-slate-400 uppercase">M2</th>
                                                <th className="text-center py-4 px-2 text-[10px] font-black text-slate-400 uppercase">M3</th>
                                                <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Final</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ev.indicators.map((ind: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="py-5 px-6 bg-slate-50/50 rounded-l-2xl text-xs font-bold text-slate-700 leading-relaxed border-y border-l border-slate-100">{ind.text}</td>
                                                    {[0, 1, 2].map(m => (
                                                        <td key={m} className="py-5 px-2 bg-slate-50/50 text-center border-y border-slate-100">
                                                            {ind.evaluations[m] ? (
                                                                <span className="inline-block px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black shadow-sm">
                                                                    {ind.evaluations[m]}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-200">-</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="py-5 px-6 bg-white rounded-r-2xl border-y border-r border-slate-200">
                                                        <div className={`px-4 py-2 rounded-xl text-center text-[9px] font-black shadow-sm ${
                                                            ind.finalAchievement !== 'None' 
                                                                ? 'bg-sky-500 text-white border-none' 
                                                                : 'bg-white text-slate-300 border border-slate-100'
                                                        }`}>
                                                            {ind.finalAchievement === 'None' ? 'SIN EVALUAR' : ind.finalAchievement.toUpperCase()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvaluationTrackingView;
