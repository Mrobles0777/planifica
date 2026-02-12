import React, { useState } from 'react';
import { Lock, Loader2, Star, CheckCircle2 } from 'lucide-react';

interface PasswordResetViewProps {
    handleUpdatePassword: (password: string) => Promise<void>;
    isAuthLoading: boolean;
    errorMessage: string | null;
}

const PasswordResetView: React.FC<PasswordResetViewProps> = ({
    handleUpdatePassword,
    isAuthLoading,
    errorMessage
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (newPassword.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setLocalError('Las contraseñas no coinciden.');
            return;
        }

        try {
            await handleUpdatePassword(newPassword);
            setIsSuccess(true);
        } catch (err: any) {
            // Error handling is managed by the prop, but keep local for consistency
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-[#fffdf5] flex flex-col p-8 justify-center items-center relative overflow-hidden">
                <div className="w-full space-y-6 relative z-10 text-center">
                    <div className="bg-emerald-100 p-6 rounded-full inline-block mb-4">
                        <CheckCircle2 className="text-emerald-500 w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">¡Contraseña Actualizada!</h1>
                    <p className="text-slate-500 font-bold">Tu contraseña ha sido cambiada con éxito. Ya puedes iniciar sesión.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-widest mt-6"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#fffdf5] flex flex-col p-8 justify-center items-center relative overflow-hidden">
            <div className="w-full space-y-6 relative z-10">
                <div className="text-center space-y-3 mb-8">
                    <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-5 rounded-[2rem] inline-block shadow-xl shadow-indigo-200">
                        <Star className="text-white w-8 h-8 fill-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Nueva Contraseña</h1>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase tracking-widest">Asegura tu cuenta de Planifica</p>
                </div>

                {(errorMessage || localError) && (
                    <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase text-center">
                        {errorMessage || localError}
                    </div>
                )}

                <div className="bg-white p-7 rounded-[2.5rem] shadow-2xl border-4 border-indigo-50 space-y-5">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input
                                type="password"
                                placeholder="Nueva Contraseña"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input
                                type="password"
                                placeholder="Confirmar Contraseña"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAuthLoading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2"
                        >
                            {isAuthLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetView;
