import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Save, ArrowLeft, Loader2, X, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileViewProps {
    user: User | null;
    session: any;
    setView: (view: any) => void;
    onUpdateUser: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, session, setView, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        avatarUrl: user?.avatarUrl || ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const handleSave = async () => {
        if (!session?.user?.id) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    avatar_url: formData.avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);

            if (error) throw error;

            onUpdateUser({
                ...user!,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                avatarUrl: formData.avatarUrl
            });

            alert('Perfil actualizado con éxito ✨');
        } catch (err: any) {
            alert('Error al guardar el perfil: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const uploadFile = async (file: File) => {
        if (!session?.user?.id) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
        } catch (err: any) {
            alert('Error al subir imagen: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
        } catch (err) {
            alert('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
                    uploadFile(file);
                    stopCamera();
                }
            }, 'image/jpeg');
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setView('home')}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h2 className="text-3xl font-black text-slate-800">Mi Perfil</h2>
            </div>

            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-sky-100 bg-slate-50 flex items-center justify-center shadow-inner">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                            ) : formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 text-slate-300" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-full border border-slate-200 shadow-lg hover:bg-sky-50 transition-colors"
                                title="Cargar Documento/Foto"
                            >
                                <Upload className="w-4 h-4 text-sky-500" />
                            </button>
                            <button
                                onClick={startCamera}
                                className="p-2 bg-white rounded-full border border-slate-200 shadow-lg hover:bg-sky-50 transition-colors"
                                title="Usar Cámara"
                            >
                                <Camera className="w-4 h-4 text-sky-500" />
                            </button>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Nombre</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Apellido</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Teléfono de Contacto</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white rounded-[1.5rem] font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-sky-100 flex items-center justify-center gap-3"
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Guardar Cambios
                </button>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                        <button
                            onClick={stopCamera}
                            className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 text-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="min-w-full min-h-full object-cover scale-x-[-1]"
                            />
                        </div>
                        <div className="p-8 flex justify-center">
                            <button
                                onClick={capturePhoto}
                                className="w-20 h-20 bg-sky-500 rounded-full border-8 border-sky-100 flex items-center justify-center transition-transform active:scale-95"
                            >
                                <div className="w-6 h-6 bg-white rounded-full" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;
