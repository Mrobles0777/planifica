import React from 'react';
import { ArrowLeft, ChevronRight, ChevronDown, CalendarDays, Star, Zap, Palette, CheckCircle2, Loader2, Sparkles, X, Search } from 'lucide-react';
import { Level, Nucleo, Objective, Methodology, GeneratedAssessment } from '../types';

interface CreateViewProps {
    currentAssessment: GeneratedAssessment | null;
    setCurrentAssessment: (assessment: GeneratedAssessment | null) => void;
    selectedLevel: Level | null;
    setSelectedLevel: (level: Level | null) => void;
    selectedNucleo: Nucleo | null;
    setSelectedNucleo: (nucleo: Nucleo | null) => void;
    selectedObjective: Objective | null;
    setSelectedObjective: (objective: Objective | null) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedMethodology: Methodology | null;
    setSelectedMethodology: (methodology: Methodology | null) => void;
    expandedAmbito: string | null;
    toggleAmbito: (ambito: string) => void;
    groupedData: Record<string, Nucleo[]>;
    isGenerating: boolean;
    handleGenerate: () => void;
    handleGeneratePlanning: (assessment: GeneratedAssessment) => void;
    isGeneratingPlanning: boolean;
    setView: (view: any) => void;
    openMaterialSearch: (material: string) => void;
}

const CreateView: React.FC<CreateViewProps> = ({
    currentAssessment,
    setCurrentAssessment,
    selectedLevel,
    setSelectedLevel,
    selectedNucleo,
    setSelectedNucleo,
    selectedObjective,
    setSelectedObjective,
    selectedDate,
    setSelectedDate,
    selectedMethodology,
    setSelectedMethodology,
    expandedAmbito,
    toggleAmbito,
    groupedData,
    isGenerating,
    handleGenerate,
    handleGeneratePlanning,
    isGeneratingPlanning,
    setView,
    openMaterialSearch
}) => {
    if (currentAssessment) {
        return (
            <div className="space-y-8 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentAssessment(null)} className="p-3 bg-white shadow-sm rounded-full hover:bg-slate-50 transition-colors">
                        <X className="w-7 h-7 text-slate-500" />
                    </button>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Propuesta Sugerida</h3>
                </div>

                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-emerald-50 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-8 py-3 bg-emerald-500 text-[10px] font-black text-white uppercase tracking-widest rounded-bl-3xl">
                        {currentAssessment.methodology}
                    </div>

                    <div className="border-b-2 border-slate-50 pb-8">
                        <span className="px-5 py-2.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                            {currentAssessment.nucleo}
                        </span>
                        <h4 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 italic leading-tight">
                            {currentAssessment.activityName}
                        </h4>
                    </div>

                    <div className="text-slate-600 text-lg font-medium leading-relaxed">
                        {currentAssessment.description}
                    </div>

                    <div className="space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Caja de Materiales:</p>
                        <div className="flex flex-wrap gap-3">
                            {currentAssessment.materials.map((mat, i) => (
                                <button
                                    key={i}
                                    onClick={() => openMaterialSearch(mat)}
                                    className="flex items-center gap-2 px-6 py-4 bg-amber-50 text-amber-700 text-[11px] font-black rounded-2xl border-2 border-amber-100 hover:bg-amber-100 transition-all shadow-sm"
                                >
                                    <span className="truncate">{mat}</span>
                                    <Search className="w-4 h-4 opacity-50" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => handleGeneratePlanning(currentAssessment)}
                    disabled={isGeneratingPlanning}
                    className="w-full bg-gradient-to-r from-emerald-500 to-sky-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 text-xl tracking-widest transition-all disabled:opacity-50"
                >
                    {isGeneratingPlanning ? <Loader2 className="animate-spin w-8 h-8" /> : <Zap className="w-8 h-8" />}
                    GENERAR PLANIFICACIÓN
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 pb-20 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
                <button onClick={() => setView('home')} className="p-3 bg-white shadow-sm rounded-full transition-all hover:bg-slate-50">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Diseñar Aventura</h3>
            </div>

            {/* Step 1: Level */}
            <div className="space-y-4">
                <label className="text-[11px] font-black text-sky-500 uppercase block ml-4 tracking-widest">1. Seleccionar Nivel</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(Level).map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => { setSelectedLevel(lvl); setSelectedNucleo(null); }}
                            className={`text-left p-6 rounded-[2rem] border-2 transition-all ${selectedLevel === lvl ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-lg' : 'border-slate-100 bg-white hover:border-sky-100'}`}
                        >
                            <span className="text-base font-black">{lvl}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Nucleo */}
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
                                                onClick={() => { setSelectedNucleo(nuc); setSelectedObjective(null); }}
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

            {/* Step 3: Objective */}
            {selectedNucleo && selectedLevel && (
                <div className="space-y-4 animate-in fade-in">
                    <label className="text-[11px] font-black text-emerald-500 uppercase block ml-4 tracking-widest">3. Objetivo de Aprendizaje</label>
                    <div className="grid gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedNucleo.objectives[selectedLevel].map((obj) => (
                            <button
                                key={obj.id}
                                onClick={() => setSelectedObjective(obj)}
                                className={`text-left p-6 rounded-[2.5rem] border-2 transition-all ${selectedObjective?.id === obj.id ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.01]' : 'border-slate-100 bg-white hover:border-emerald-50'}`}
                            >
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-black text-white bg-emerald-400 px-4 py-1.5 rounded-full h-fit shrink-0 tracking-widest">OA {obj.id}</span>
                                    <span className="text-sm font-bold text-slate-700 leading-relaxed">{obj.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Date */}
            {selectedObjective && (
                <div className="space-y-4 animate-in fade-in">
                    <label className="text-[11px] font-black text-amber-500 uppercase block ml-4 tracking-widest">4. Fecha Estimada</label>
                    <div className="relative">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-400 w-6 h-6" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 pl-16 pr-8 text-base font-bold text-slate-700 outline-none focus:border-amber-300 transition-all shadow-sm"
                        />
                    </div>
                </div>
            )}

            {/* Step 5: Methodology */}
            {selectedObjective && (
                <div className="space-y-4 animate-in fade-in">
                    <label className="text-[11px] font-black text-indigo-500 uppercase block ml-4 tracking-widest">5. Enfoque Metodológico</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: Methodology.STANDARD, label: 'Estándar', icon: <Star className="w-6 h-6" />, color: 'sky' },
                            { id: Methodology.MONTESSORI, label: 'Montessori', icon: <Zap className="w-6 h-6" />, color: 'emerald' },
                            { id: Methodology.WALDORF, label: 'Waldorf', icon: <Palette className="w-6 h-6" />, color: 'indigo' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethodology(method.id)}
                                className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all text-center ${selectedMethodology === method.id ? `border-${method.color}-500 bg-${method.color}-50 shadow-xl scale-[1.05]` : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <div className={`p-4 rounded-3xl bg-${method.color}-100 text-${method.color}-600`}>{method.icon}</div>
                                <p className={`font-black text-base ${selectedMethodology === method.id ? `text-${method.color}-700` : 'text-slate-800'}`}>{method.label}</p>
                                {selectedMethodology === method.id && <CheckCircle2 className={`w-7 h-7 text-${method.color}-500`} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedMethodology && (
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-8 rounded-[3rem] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 text-xl transition-all active:scale-95 hover:shadow-sky-200/50 mt-10"
                >
                    {isGenerating ? <Loader2 className="animate-spin w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                    ¡Crear Aventura!
                </button>
            )}
        </div>
    );
};

export default CreateView;
