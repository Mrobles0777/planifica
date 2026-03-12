import React from 'react';
import { Sun, Cloud, Star, Mail, Lock, Loader2 } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
    authMode: 'signin' | 'signup' | 'forgot';
    setAuthMode: (mode: 'signin' | 'signup' | 'forgot') => void;
    loginForm: User;
    setLoginForm: (form: User) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    isAuthLoading: boolean;
    handleLoginSubmit: (e: React.FormEvent) => void;
    handleGoogleLogin: () => void;
    handleResetSubmit: (e: React.FormEvent) => void;
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
    handleGoogleLogin,
    handleResetSubmit,
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
                        <button onClick={() => setAuthMode('forgot')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'forgot' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}>Reset</button>
                    </div>
                    {authMode === 'forgot' ? (
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <p className="text-slate-500 text-xs text-center px-2">Ingresa tu correo para recibir un enlace de recuperación.</p>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold"
                                    value={loginForm.email}
                                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAuthLoading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                            >
                                {isAuthLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Enviar Enlace'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthMode('signin')}
                                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
                            >
                                ← Volver al inicio
                            </button>
                        </form>
                    ) : (
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
                            {authMode === 'signin' && (
                                <div className="flex justify-end pr-1">
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('forgot')}
                                        className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-600"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isAuthLoading}
                                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2"
                            >
                                {isAuthLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (authMode === 'signin' ? 'Entrar al Aula' : 'Comenzar Ahora')}
                            </button>
                        </form>
                    )}  <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100"></span>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase">
                            <span className="bg-white px-4 text-slate-300">O también</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isAuthLoading}
                        className="w-full bg-white border-2 border-slate-100 hover:border-sky-100 hover:bg-sky-50/30 text-slate-600 font-bold py-4 rounded-xl flex items-center justify-center gap-3 text-xs transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                style={{ fill: '#4285F4' }}
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                style={{ fill: '#34A853' }}
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                style={{ fill: '#FBBC05' }}
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                style={{ fill: '#EA4335' }}
                            />
                        </svg>
                        Continuar con Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
