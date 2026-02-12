import React from 'react';
import { Sun, Cloud, Star, Mail, Lock, Loader2 } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
    authMode: 'signin' | 'signup';
    setAuthMode: (mode: 'signin' | 'signup') => void;
    loginForm: User;
    setLoginForm: (form: User) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    isAuthLoading: boolean;
    handleLoginSubmit: (e: React.FormEvent) => void;
    errorMessage: string | null;
}

const LoginView: React.FC<LoginViewProps> = ({
    authMode,
    setAuthMode,
    loginForm,
    setLoginForm,
    showPassword,
    setShowPassword,
    isAuthLoading,
    handleLoginSubmit,
    errorMessage
}) => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#fffdf5] flex flex-col p-8 justify-center items-center relative overflow-hidden">
            <div className="absolute top-10 -left-10 text-yellow-300 opacity-20 transform -rotate-12">
                <Sun className="w-32 h-32" />
            </div>
            <div className="absolute bottom-20 -right-10 text-sky-300 opacity-20">
                <Cloud className="w-40 h-40" />
            </div>
            <div className="w-full space-y-6 relative z-10 animate-in fade-in zoom-in-95">
                <div className="text-center space-y-3">
                    <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-5 rounded-[2rem] inline-block shadow-xl shadow-orange-200">
                        <Star className="text-white w-8 h-8 fill-white" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter flex items-center justify-center gap-1">
                        <span className="text-sky-500">P</span><span className="text-rose-500">l</span><span className="text-emerald-500">a</span><span className="text-amber-500">n</span><span className="text-indigo-500">i</span><span className="text-orange-500">f</span><span className="text-sky-500">i</span><span className="text-rose-500">c</span><span className="text-emerald-500">a</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">Educación Parvularia Inteligente</p>
                </div>
                {errorMessage && (
                    <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase text-center">
                        {errorMessage}
                    </div>
                )}
                <div className="bg-white p-7 rounded-[2.5rem] shadow-2xl border-4 border-yellow-50 space-y-5">
                    <div className="flex p-1 bg-slate-100 rounded-2xl">
                        <button onClick={() => setAuthMode('signin')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'signin' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}>Entrar</button>
                        <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'signup' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}>Registro</button>
                    </div>
                    <form onSubmit={handleLoginSubmit} className="space-y-3">
                        {authMode === 'signup' && (
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-xs font-bold"
                                    value={loginForm.firstName}
                                    onChange={(e) => setLoginForm({ ...loginForm, firstName: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-xs font-bold"
                                    value={loginForm.lastName}
                                    onChange={(e) => setLoginForm({ ...loginForm, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input
                                type="email"
                                placeholder="Correo"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAuthLoading}
                            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2"
                        >
                            {isAuthLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (authMode === 'signin' ? 'Entrar al Aula' : 'Comenzar Ahora')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
