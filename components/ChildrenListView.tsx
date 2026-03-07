import React, { useState } from 'react';
import { ArrowLeft, Plus, Baby, Calendar, GraduationCap, Info, Syringe, AlertCircle, Trash2, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { Child, Level } from '../types';
import { supabase } from '../supabaseClient';
function formatDateForSupabase(dateStr: string) {
    if (!dateStr) return null;
    return dateStr;
}

interface ChildrenListViewProps {
    setView: (view: any) => void;
    children: Child[];
    setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
    session: any;
}

const ChildrenListView: React.FC<ChildrenListViewProps> = ({ setView, children, setChildren, session }) => {
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        level: Level.SALA_CUNA,
        vaccines: '',
        allergies: '',
        otherInfo: ''
    });

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session?.user?.id) {
            alert("Sesión no válida. Por favor, vuelve a iniciar sesión.");
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.birthDate) {
            alert("Por favor completa los campos obligatorios (nombre, apellido y fecha de nacimiento).");
            return;
        }

        setIsSaving(true);
        try {
            const newChildData = {
                user_id: session.user.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                birth_date: formData.birthDate,
                level: formData.level,
                vaccines: formData.vaccines,
                allergies: formData.allergies,
                other_info: formData.otherInfo
            };

            const { data, error } = await supabase
                .from('children')
                .insert([newChildData])
                .select()
                .single();

            if (error) {
                console.error("Supabase error:", error);
                throw new Error(error.message || "Error al insertar en la base de datos");
            }

            if (data) {
                const newChild: Child = {
                    id: data.id,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    birthDate: data.birth_date,
                    level: data.level as Level,
                    vaccines: data.vaccines,
                    allergies: data.allergies,
                    otherInfo: data.other_info,
                    createdAt: data.created_at
                };
                setChildren([newChild, ...children]);
                // Mantenemos showForm en true para seguir agregando
                setFormData({
                    firstName: '',
                    lastName: '',
                    birthDate: '',
                    level: Level.SALA_CUNA,
                    vaccines: '',
                    allergies: '',
                    otherInfo: ''
                });
                setSaveSuccess(true);
                // Cerrar el formulario y volver al listado tras 2 segundos
                setTimeout(() => {
                    setSaveSuccess(false);
                    setShowForm(false);
                }, 2000);
            }
        } catch (err: any) {
            console.error("Error adding child:", err);
            alert(`No se pudo guardar: ${err.message || "Revisa la conexión o si la tabla existe"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteChild = async (id: string) => {
        if (!session?.user?.id) {
            alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
            return;
        }

        if (window.confirm('¿Borrar registro de forma permanente? Esta acción no se puede deshacer.')) {
            setIsDeleting(id);
            try {
                const { error } = await supabase
                    .from('children')
                    .delete()
                    .eq('id', id)
                    .eq('user_id', session.user.id); // Seguridad extra

                if (error) throw error;
                
                setChildren(prev => prev.filter(c => c.id !== id));
            } catch (err: any) {
                console.error("Error deleting child:", err);
                alert(`Error al eliminar: ${err.message || "No tienes permisos o el registro ya no existe."}`);
            } finally {
                setIsDeleting(null);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-sky-50 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                    <button
                        onClick={() => setView('home')}
                        className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Listado Base</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Gestión de alumnos ({children.length})</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`relative z-10 flex items-center justify-center gap-3 px-8 py-4 ${showForm ? 'bg-rose-500 hover:bg-rose-600' : 'bg-sky-500 hover:bg-sky-600'} text-white rounded-[2rem] font-black transition-all shadow-lg active:scale-95 group`}
                >
                    {showForm ? (
                        <>Cancelar registro</>
                    ) : (
                        <>
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Agregar Niño/a
                        </>
                    )}
                </button>
                <Baby className="absolute -right-6 -bottom-6 w-40 h-40 text-sky-500 opacity-5" />
            </div>

            {/* Form section */}
            {showForm && (
                <form onSubmit={handleAddChild} className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-sky-50 animate-in zoom-in-95 duration-300 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-sky-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Baby className="w-4 h-4" />
                                Información Básica
                            </h3>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Primer Nombre</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Sofía"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-400 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Apellidos</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: González Pérez"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-400 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Nacimiento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            required
                                            type="date"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-400 focus:bg-white transition-all outline-none font-bold text-slate-700"
                                            value={formData.birthDate}
                                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Nivel</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <select
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-400 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none"
                                            value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: e.target.value as Level })}
                                        >
                                            {Object.values(Level).map(l => (
                                                <option key={l} value={l}>{l.split('(')[0]}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Health & Others */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Salud y Observaciones
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Vacunas</label>
                                <div className="relative">
                                    <Syringe className="absolute left-5 top-5 w-5 h-5 text-rose-200" />
                                    <textarea
                                        placeholder="Lista de vacunas o estado actual..."
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-300 focus:bg-white transition-all outline-none font-bold text-slate-700 min-h-[50px] placeholder:text-slate-300"
                                        value={formData.vaccines}
                                        onChange={e => setFormData({ ...formData, vaccines: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Alergias</label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-5 top-5 w-5 h-5 text-rose-200" />
                                    <textarea
                                        placeholder="Alimentos, medicamentos, etc..."
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-300 focus:bg-white transition-all outline-none font-bold text-slate-700 min-h-[50px] placeholder:text-slate-300"
                                        value={formData.allergies}
                                        onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Otros datos</label>
                                <textarea
                                    placeholder="Cualquier información relevante..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-300 focus:bg-white transition-all outline-none font-bold text-slate-700 min-h-[50px] placeholder:text-slate-300"
                                    value={formData.otherInfo}
                                    onChange={e => setFormData({ ...formData, otherInfo: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4">
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-emerald-600 font-black text-sm animate-in fade-in slide-in-from-right-4">
                                <CheckCircle2 className="w-5 h-5" />
                                ¡Niño/a guardado exitosamente!
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-w-[300px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-6 h-6" />
                                    Guardar Registro
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* List section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.length === 0 && !showForm ? (
                    <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-6 bg-white rounded-full shadow-sm border border-slate-100">
                            <Baby className="w-12 h-12 text-slate-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-slate-400 text-xl tracking-tight">Tu listado está vacío</p>
                            <p className="text-slate-300 font-bold text-sm">Comienza agregando al primer integrante de tu grupo</p>
                        </div>
                    </div>
                ) : (
                    children.map(child => (
                        <div key={child.id} className="group bg-white p-6 rounded-[2.5rem] shadow-lg border-4 border-slate-50 hover:border-sky-100 transition-all hover:shadow-2xl animate-in fade-in zoom-in-95 relative overflow-hidden">
                            <div className="relative z-10 flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center border-2 border-sky-200">
                                        <Baby className="w-7 h-7 text-sky-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tighter">{child.firstName} {child.lastName}</h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <GraduationCap className="w-3 h-3 text-sky-400" />
                                            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{child.level.split('(')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteChild(child.id)}
                                    disabled={isDeleting === child.id}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                                    title="Eliminar Alumno"
                                >
                                    {isDeleting === child.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="relative z-10 space-y-3 mt-6">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-bold leading-none">{new Date(child.birthDate).toLocaleDateString('es-CL')}</span>
                                </div>

                                {(child.vaccines || child.allergies) && (
                                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                                        {child.vaccines && (
                                            <div className="flex-1 flex items-center gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                                                <Syringe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span className="text-[10px] font-bold text-emerald-700 truncate">{child.vaccines}</span>
                                            </div>
                                        )}
                                        {child.allergies && (
                                            <div className="flex-1 flex items-center gap-2 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                <span className="text-[10px] font-bold text-rose-700 truncate">{child.allergies}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChildrenListView;
