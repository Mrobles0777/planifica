import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Save, Loader2, Download, Star, Target, Calendar } from 'lucide-react';
import { Planning } from '../types';

interface PlanningViewProps {
    activePlanning: Planning | null;
    setView: (view: any) => void;
    savePlanning: () => void;
    handleExportPDF: () => void;
    isSaving: boolean;
    isExporting: boolean;
}

const PlanningView: React.FC<PlanningViewProps> = ({
    activePlanning,
    setView,
    savePlanning,
    handleExportPDF,
    isSaving,
    isExporting
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState<string | number>('auto');

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current && contentRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const baseWidth = 850; // Ancho de referencia para diseño "desktop"
                
                if (containerWidth < baseWidth) {
                    const newScale = containerWidth / baseWidth;
                    setScale(newScale);
                    // Ajustamos la altura del contenedor para compensar el escalado
                    setContainerHeight(contentRef.current.offsetHeight * newScale);
                } else {
                    setScale(1);
                    setContainerHeight('auto');
                }
            }
        };

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);

        // Pequeño delay para asegurar que el DOM inicial esté listo
        setTimeout(updateScale, 100);

        return () => observer.disconnect();
    }, [activePlanning]);

    if (!activePlanning) return null;

    return (
        <div className="space-y-8 pb-24 no-print animate-in slide-in-from-bottom-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setView('history')}
                    className="p-3 bg-white shadow-sm rounded-full hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={savePlanning}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-bold text-sm shadow-lg hover:bg-emerald-600 active:scale-90 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar en Baúl
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="p-4 bg-amber-500 text-white rounded-full shadow-xl hover:bg-amber-600 active:scale-90 disabled:opacity-50 transition-all"
                        title="Descargar PDF"
                    >
                        {isExporting ? <Loader2 className="animate-spin w-6 h-6" /> : <Download className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div 
                ref={containerRef} 
                className="pdf-preview-container bg-white rounded-[3rem] shadow-2xl border-4 border-slate-50 overflow-hidden relative"
                style={{ height: containerHeight }}
            >
                {/* Contenedor escalable */}
                <div 
                    ref={contentRef}
                    style={{
                        transformOrigin: 'top center',
                        width: scale < 1 ? '850px' : '100%',
                        position: 'absolute',
                        left: '50%',
                        transform: `translateX(-50%) scale(${scale})`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <div className="p-8 md:p-16 bg-white">
                        <div className="max-w-[850px] mx-auto">
                        <div className="flex items-center justify-between w-full border-b-8 border-sky-400 pb-12 mb-12">
                            <div className="flex items-center gap-8">
                                <div className="p-6 bg-sky-500 rounded-[2rem]">
                                    <Star className="text-white w-12 h-12 fill-white" />
                                </div>
                                <div>
                                    <h1 className="text-6xl font-black text-slate-900 italic">Planifica</h1>
                                    <p className="text-[14px] font-bold text-sky-400 uppercase tracking-[0.5em] mt-3">Documento Profesional</p>
                                    {activePlanning.titulo && (
                                        <div className="mt-4 bg-sky-50 px-6 py-2 rounded-2xl border border-sky-100">
                                            <p className="text-lg font-black text-slate-800 italic">{activePlanning.titulo}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[12px] font-black text-slate-300 uppercase mb-2 tracking-widest">Emitido el</p>
                                <p className="text-lg font-black text-slate-800 bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100 italic">
                                    {activePlanning.mes || new Date().toLocaleDateString('es-CL')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                            <div className="bg-sky-50/50 p-8 rounded-[2.5rem] border-2 border-sky-100 flex items-center gap-6">
                                <div className="p-4 bg-white rounded-2xl text-sky-500 shadow-sm"><Target className="w-8 h-8" /></div>
                                <div>
                                    <div className="text-[11px] font-black text-sky-500 uppercase mb-1 tracking-widest">Nivel</div>
                                    <div className="text-xl font-black text-slate-900">{activePlanning.nivel}</div>
                                </div>
                            </div>
                            <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border-2 border-amber-100 flex items-center gap-6">
                                <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm"><Calendar className="w-8 h-8" /></div>
                                <div>
                                    <div className="text-[11px] font-black text-amber-500 uppercase mb-1 tracking-widest">Equipo</div>
                                    <div className="text-xl font-black text-slate-900">{activePlanning.equipo || 'Docente'}</div>
                                </div>
                            </div>
                            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 flex items-center gap-6">
                                <div className="p-4 bg-white rounded-2xl text-emerald-500 shadow-sm"><Star className="w-8 h-8" /></div>
                                <div>
                                    <div className="text-[11px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Metodología</div>
                                    <div className="text-xl font-black text-slate-900">{activePlanning.metodologia || 'Estándar'}</div>
                                </div>
                            </div>
                        </div>

                        {activePlanning.materiales && activePlanning.materiales.length > 0 && (
                            <div className="mb-10 p-10 bg-slate-50 border-2 border-slate-200 rounded-[3rem] space-y-6">
                                <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    Caja de Materiales
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {activePlanning.materiales.map((m, i) => (
                                        <span key={i} className="px-5 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activePlanning.experienceSummary && (
                            <div className="mb-10 p-10 bg-sky-50/50 border-2 border-sky-100 rounded-[3rem] space-y-6">
                                <h4 className="text-[12px] font-black text-sky-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                                    RESUMEN ETAPAS DE LA EXPERIENCIA:
                                </h4>
                                <div className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-line prose prose-slate max-w-none">
                                    {activePlanning.experienceSummary}
                                </div>
                            </div>
                        )}

                        {activePlanning.experienceTable && activePlanning.experienceTable.length > 0 && (
                            <div className="mb-16 space-y-6">
                                <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 pl-4">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    EXPERIENCIA Y RECURSOS
                                </h4>
                                <div className="overflow-hidden border-2 border-slate-100 rounded-[3rem] bg-white shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                        {activePlanning.experienceTable.map((row, i) => (
                                            <div key={i} className="flex flex-col">
                                                <div className="bg-slate-50 p-4 border-b border-slate-100 text-center">
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{row.day}</span>
                                                </div>
                                                <div className="p-6 space-y-4 flex-1">
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800 border-b-2 border-slate-800 pb-1 mb-2 inline-block">
                                                            {row.activity}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] space-y-1">
                                                            <span className="font-black text-slate-400 uppercase block">Objetivos:</span>
                                                            <div className="flex flex-col gap-2">
                                                                {row.objectives.map((obj, idx) => (
                                                                    <div key={idx} className="bg-sky-50 p-2 rounded-xl border border-sky-100">
                                                                        <div className="flex gap-1 mb-1">
                                                                            <span className="text-[8px] font-black text-sky-500 uppercase px-1.5 py-0.5 bg-white rounded-md border border-sky-100">{obj.ambito}</span>
                                                                            <span className="text-[8px] font-black text-emerald-500 uppercase px-1.5 py-0.5 bg-white rounded-md border border-emerald-100">{obj.nucleo}</span>
                                                                        </div>
                                                                        <span className="text-[9px] font-bold text-slate-700 leading-tight block">
                                                                            {obj.text}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-slate-600 leading-relaxed">
                                                            <span className="font-black text-slate-400 uppercase block mb-1">Actividad:</span>
                                                            {row.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {activePlanning.planes.map((plan, idx) => (
                                <div key={idx} className="p-10 bg-white border-2 border-slate-100 rounded-[3rem] shadow-sm space-y-8">
                                    <div className="flex gap-6">
                                        <div className="bg-yellow-400 w-3 rounded-full shrink-0"></div>
                                        <div className="space-y-3 flex-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {plan.ambito && (
                                                    <span className="text-[9px] font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 uppercase tracking-widest">{plan.ambito}</span>
                                                )}
                                                {plan.nucleo && (
                                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">{plan.nucleo}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-amber-600 font-black text-[11px] uppercase tracking-[0.3em]">Objetivo OA</div>
                                            <p className="text-slate-900 text-lg font-bold leading-relaxed">{plan.objective}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-10">
                                        <div className="space-y-3">
                                            <h5 className="text-[11px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 w-fit px-4 py-1 rounded-full">Inicio</h5>
                                            <div className="text-sm text-slate-700 bg-sky-50/20 p-8 rounded-3xl leading-relaxed font-medium">{plan.inicio}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-4 py-1 rounded-full">Desarrollo</h5>
                                            <div className="text-sm text-slate-700 bg-emerald-50/20 p-8 rounded-3xl leading-relaxed font-medium">{plan.desarrollo}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <h5 className="text-[11px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 w-fit px-4 py-1 rounded-full">Cierre</h5>
                                            <div className="text-sm text-slate-700 bg-rose-50/20 p-8 rounded-3xl leading-relaxed font-medium">{plan.cierre}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 p-12 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[4rem] text-base text-slate-500 font-bold italic leading-relaxed text-center">
                            "{activePlanning.mediacion}"
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default PlanningView;
