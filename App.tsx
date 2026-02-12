import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, Star, Target, Calendar } from 'lucide-react';
import { Level, GeneratedAssessment, Nucleo, Objective, Methodology, Planning, User } from './types';
import { CURRICULUM_DATA } from './constants';
import { generateAssessmentDetails, generateVariablePlanning, generateGlobalPlanning } from './services/geminiService';
import { supabase, testSupabaseConnection } from './supabaseClient';

// Components
import Layout from './components/Layout';
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import HistoryView from './components/HistoryView';
import CreateView from './components/CreateView';
import PlanningView from './components/PlanningView';
import PasswordResetView from './components/PasswordResetView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'home' | 'create' | 'history' | 'planning' | 'global-planning' | 'login' | 'password-reset'>('login');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [loginForm, setLoginForm] = useState<User>({
    firstName: '', lastName: '', email: '', location: '', phone: '+56 ', password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedNucleo, setSelectedNucleo] = useState<Nucleo | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMethodology, setSelectedMethodology] = useState<Methodology | null>(null);
  const [expandedAmbito, setExpandedAmbito] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPlanning, setIsGeneratingPlanning] = useState(false);
  const [isGeneratingGlobal, setIsGeneratingGlobal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [currentAssessment, setCurrentAssessment] = useState<GeneratedAssessment | null>(null);
  const [currentPlanning, setCurrentPlanning] = useState<Planning | null>(null);
  const [globalPlanningResult, setGlobalPlanningResult] = useState<Planning | null>(null);

  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [focusedAssessment, setFocusedAssessment] = useState<GeneratedAssessment | null>(null);

  const fetchSavedItems = useCallback(async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.from('saved_plans').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSavedItems(data || []);
    } catch (err: any) {
      console.error("Fetch saved items error:", err);
      if (err.message?.includes('fetch')) {
        setErrorMessage("Error de red: Supabase no responde.");
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUser({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email || '',
          location: data.location,
          phone: data.phone
        });
      } else {
        setUser({ firstName: 'Educadora', lastName: '', email: '', location: '', phone: '' });
      }
      fetchSavedItems();
    } catch (err: any) {
      setUser({ firstName: 'Educadora', lastName: '', email: '', location: '', phone: '' });
      fetchSavedItems();
    }
  }, [fetchSavedItems]);

  useEffect(() => {
    const initApp = async () => {
      setIsInitializing(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session) {
          await fetchUserData(session.user.id);
          setView('home');
        } else {
          setView('login');
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setView('login');
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setView('password-reset');
        return;
      }

      if (session) {
        await fetchUserData(session.user.id);
        setView('home');
      } else {
        setUser(null);
        setSavedItems([]);
        // Si no estamos en medio de una recuperación, vamos a login
        if (view !== 'password-reset') {
          setView('login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginForm.email!,
          password: loginForm.password!
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: loginForm.email!,
          password: loginForm.password!,
          options: {
            data: {
              first_name: loginForm.firstName,
              last_name: loginForm.lastName,
              location: loginForm.location,
              phone: loginForm.phone
            }
          }
        });
        if (error) throw error;
        alert("¡Registro exitoso! Verifica tu correo.");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginForm.email!, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      alert("Se ha enviado un enlace a tu correo.");
      setAuthMode('signin');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    setErrorMessage(null);
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("¿Deseas cerrar sesión?")) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
  };

  const savePlanning = async () => {
    const planToSave = globalPlanningResult || currentPlanning;
    if (!planToSave || !session) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('saved_plans').insert({
        user_id: session.user.id,
        title: planToSave.ambitoNucleo,
        content: planToSave,
        plan_type: globalPlanningResult ? 'planning_global' : 'planning_variable'
      });
      if (error) throw error;

      alert("¡Guardado en el Baúl! ✨");
      await fetchSavedItems();
      setView('history');
      resetForm();
    } catch (err: any) {
      setErrorMessage("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (e: React.MouseEvent, db_id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Borrar permanentemente?")) {
      setIsDeleting(db_id);
      try {
        const { error } = await supabase.from('saved_plans').delete().eq('id', db_id);
        if (error) throw error;
        await fetchSavedItems();
      } catch (err: any) {
        setErrorMessage("Error al eliminar.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedLevel || !selectedNucleo || !selectedObjective || !selectedMethodology) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const data = await generateAssessmentDetails(selectedLevel, selectedNucleo.name, selectedObjective.text, selectedMethodology);
      setCurrentAssessment({
        ...data,
        level: selectedLevel,
        nucleo: selectedNucleo.name,
        objective: selectedObjective.text,
        methodology: selectedMethodology,
        createdAt: new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL')
      });
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePlanning = async (assessment: GeneratedAssessment) => {
    setIsGeneratingPlanning(true);
    setFocusedAssessment(assessment);
    try {
      const planningData = await generateVariablePlanning(assessment);
      setCurrentPlanning({
        ...planningData,
        mes: assessment.createdAt,
        equipo: user ? `${user.firstName} ${user.lastName}` : 'Docente'
      });
      setView('planning');
    } catch (err: any) {
      setErrorMessage("Error al generar planificación.");
    } finally {
      setIsGeneratingPlanning(false);
    }
  };

  const planningItems = useMemo(() => {
    return savedItems.filter(i => i.plan_type.includes('planning'));
  }, [savedItems]);

  const handleGenerateGlobalPlanning = async () => {
    if (planningItems.length === 0) return;
    setIsGeneratingGlobal(true);
    try {
      const data = await generateGlobalPlanning(planningItems);
      setGlobalPlanningResult({
        ...data,
        mes: new Date().toLocaleDateString('es-CL'),
        equipo: user ? `${user.firstName} ${user.lastName}` : 'Docente'
      });
      setView('global-planning');
    } catch (err: any) {
      console.error("Global Planning Error:", err);
      setErrorMessage(err.message || "Error al generar plan integral.");
    } finally {
      setIsGeneratingGlobal(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('professional-planning-export-target');
    if (!element) return;

    setIsExporting(true);
    try {
      const opt = {
        margin: 0,
        filename: `Planifica_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: element.offsetWidth
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.html2pdf__page-break' }
      };
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
      setErrorMessage("Error al exportar.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = (item: any) => {
    const plan = item.content;
    if (item.plan_type === 'planning_global') {
      setGlobalPlanningResult(plan);
      setView('global-planning');
    } else {
      setCurrentPlanning(plan);
      setView('planning');
    }
    setTimeout(handleExportPDF, 800);
  };

  const resetForm = () => {
    setSelectedLevel(null); setSelectedNucleo(null); setSelectedObjective(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedMethodology(null); setExpandedAmbito(null);
    setCurrentAssessment(null); setCurrentPlanning(null); setGlobalPlanningResult(null);
  };

  const openSavedPlanning = (item: any) => {
    const plan = item.content;
    if (item.plan_type === 'planning_global') {
      setGlobalPlanningResult(plan);
      setView('global-planning');
    } else {
      setCurrentPlanning(plan);
      setView('planning');
    }
  };

  const groupedData = useMemo(() => {
    const groups: Record<string, Nucleo[]> = {};
    CURRICULUM_DATA.forEach(nuc => {
      if (!groups[nuc.ambito]) groups[nuc.ambito] = [];
      groups[nuc.ambito].push(nuc);
    });
    return groups;
  }, []);

  const toggleAmbito = (ambito: string) => {
    setExpandedAmbito(prev => prev === ambito ? null : ambito);
  };

  const openMaterialSearch = (material: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(material)}+educacion+parvularia`, '_blank');
  };

  const activePlanning = globalPlanningResult || currentPlanning;

  if (isInitializing) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#fffdf5] flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Iniciando Planifica...</p>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <LoginView
        authMode={authMode}
        setAuthMode={setAuthMode}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isAuthLoading={isAuthLoading}
        handleLoginSubmit={handleLoginSubmit}
        handleGoogleLogin={handleGoogleLogin}
        handleResetSubmit={handleResetSubmit}
        errorMessage={errorMessage}
      />
    );
  }

  if (view === 'password-reset') {
    return (
      <PasswordResetView
        handleUpdatePassword={handleUpdatePassword}
        isAuthLoading={isAuthLoading}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <Layout user={user} view={view} setView={setView} handleLogout={handleLogout}>
      {view === 'home' && (
        <HomeView
          user={user}
          planningItemsCount={planningItems.length}
          setView={setView}
          resetForm={resetForm}
        />
      )}

      {view === 'history' && (
        <HistoryView
          planningItems={planningItems}
          isGeneratingGlobal={isGeneratingGlobal}
          isDeleting={isDeleting}
          setView={setView}
          handleGenerateGlobalPlanning={handleGenerateGlobalPlanning}
          handleQuickExport={handleQuickExport}
          deleteItem={deleteItem}
          openSavedPlanning={openSavedPlanning}
        />
      )}

      {(view === 'planning' || view === 'global-planning') && (
        <PlanningView
          activePlanning={activePlanning}
          setView={setView}
          savePlanning={savePlanning}
          handleExportPDF={handleExportPDF}
          isSaving={isSaving}
          isExporting={isExporting}
        />
      )}

      {view === 'create' && (
        <CreateView
          currentAssessment={currentAssessment}
          setCurrentAssessment={setCurrentAssessment}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedNucleo={selectedNucleo}
          setSelectedNucleo={setSelectedNucleo}
          selectedObjective={selectedObjective}
          setSelectedObjective={setSelectedObjective}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMethodology={selectedMethodology}
          setSelectedMethodology={setSelectedMethodology}
          expandedAmbito={expandedAmbito}
          toggleAmbito={toggleAmbito}
          groupedData={groupedData}
          isGenerating={isGenerating}
          handleGenerate={handleGenerate}
          handleGeneratePlanning={handleGeneratePlanning}
          isGeneratingPlanning={isGeneratingPlanning}
          setView={setView}
          openMaterialSearch={openMaterialSearch}
        />
      )}

      {/* DOCUMENTO TÉCNICO OCULTO PARA EXPORTACIÓN PDF */}
      <div style={{ position: 'fixed', left: '-10000px', top: '0', width: '210mm', minHeight: '297mm', background: 'white' }} className="no-print">
        {activePlanning && (
          <div id="professional-planning-export-target" className="bg-white">
            <div className="flex items-center justify-between w-full border-b-8 border-sky-400 pb-10 mb-10">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-sky-500 rounded-3xl">
                  <Star className="text-white w-10 h-10 fill-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-slate-900 italic">Planifica</h1>
                  <p className="text-[12px] font-black text-sky-400 uppercase tracking-[0.5em] mt-3">Documento Profesional</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-slate-300 uppercase mb-1">Emitido el</p>
                <p className="text-sm font-black text-slate-800 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                  {activePlanning.mes || new Date().toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-sky-50/50 p-6 rounded-[2rem] border-2 border-sky-100">
                <div className="flex items-center gap-2 text-[11px] font-black text-sky-500 uppercase mb-2"><Target className="w-4 h-4" /> Nivel</div>
                <div className="text-md font-black text-slate-900">{activePlanning.nivel}</div>
              </div>
              <div className="bg-amber-50/50 p-6 rounded-[2rem] border-2 border-amber-100">
                <div className="flex items-center gap-2 text-[11px] font-black text-amber-500 uppercase mb-2"><Star className="w-4 h-4" /> Equipo</div>
                <div className="text-md font-black text-slate-900">{activePlanning.equipo || 'Docente'}</div>
              </div>
            </div>

            <div className="space-y-4">
              {activePlanning.planes.map((plan, idx) => (
                <div
                  key={idx}
                  className={`p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm ${idx > 0 ? 'html2pdf__page-break' : ''}`}
                >
                  <div className="flex gap-5 mb-6">
                    <div className="bg-yellow-400 w-2 rounded-full shrink-0"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-[0.25em]">Objetivo OA</div>
                      <p className="text-slate-900 text-sm font-bold">{plan.objective}</p>
                    </div>
                  </div>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-sky-600 uppercase">Inicio</h5>
                      <div className="text-xs text-slate-700 bg-sky-50/20 p-5 rounded-2xl">{plan.inicio}</div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-emerald-600 uppercase">Desarrollo</h5>
                      <div className="text-xs text-slate-700 bg-emerald-50/20 p-5 rounded-2xl">{plan.desarrollo}</div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-rose-600 uppercase">Cierre</h5>
                      <div className="text-xs text-slate-700 bg-rose-50/20 p-5 rounded-2xl">{plan.cierre}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 p-10 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] text-sm text-slate-500 font-bold italic">
              {activePlanning.mediacion}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
