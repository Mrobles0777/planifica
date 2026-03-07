import React from 'react';
import { ArrowLeft, Loader2, Combine, Download, Trash2 } from 'lucide-react';

interface HistoryViewProps {
    planningItems: any[];
    isGeneratingGlobal: boolean;
    isDeleting: string | null;
    setView: (view: any) => void;
    handleGenerateGlobalPlanning: () => void;
    handleQuickExport: (item: any) => void;
    deleteItem: (e: React.MouseEvent, db_id: string) => void;
    openSavedPlanning: (item: any) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
    planningItems,
    isGeneratingGlobal,
    isDeleting,
    setView,
    handleGenerateGlobalPlanning,
    handleQuickExport,
    deleteItem,
    openSavedPlanning
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setView('home')}
                    className="p-3 bg-white shadow-sm border border-slate-100 rounded-full hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Mi Baúl</h3>
            </div>

            {planningItems.length > 1 && (
                <button
                    onClick={handleGenerateGlobalPlanning}
                    disabled={isGeneratingGlobal}
                    className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white p-8 rounded-vibe font-black active:scale-95 text-sm md:text-base uppercase tracking-widest shadow-xl transition-all border-b-8 border-warning-400 disabled:opacity-50"
                >
                    {isGeneratingGlobal ? <Loader2 className="animate-spin w-6 h-6" /> : <Combine className="w-6 h-6 text-warning" />}
                    Generar Plan Integrado
                </button>
            )}

            {planningItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold">Aún no tienes planes guardados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {planningItems.map((item: any) => (
                        <div key={item.id} className="bg-white p-8 rounded-vibe shadow-xl border-2 border-slate-50 space-y-6 hover:border-baul-100 transition-colors group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black px-4 py-1.5 bg-baul-50 text-baul-600 rounded-full uppercase tracking-wider">
                                        {item.content.nivel || 'Nivel'}
                                    </span>
                                    <h4 className="font-black text-slate-800 text-xl leading-tight">{item.title}</h4>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleQuickExport(item)}
                                        className="p-3 text-info bg-info-50 rounded-full hover:bg-info-100 transition-colors"
                                        title="Exportar PDF"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => deleteItem(e, item.id)}
                                        disabled={isDeleting === item.id}
                                        className="p-3 text-slate-200 hover:text-danger-500 bg-slate-50 rounded-full transition-colors"
                                        title="Eliminar"
                                    >
                                        {isDeleting === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => openSavedPlanning(item)}
                                className="w-full bg-baul text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-baul-600 active:scale-95 transition-all tracking-widest"
                            >
                                Ver Documento
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryView;
