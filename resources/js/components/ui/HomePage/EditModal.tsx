import React, { useCallback, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { createPortal } from 'react-dom';
import { X, Save, Upload, Camera } from 'lucide-react';
import { HomeApiService } from '@/services/HomeApiService';
import { StatusModal } from '@/components/ui/StatusModal';



// Описываем интерфейсы данных, чтобы не дублировать их
interface ProfileData {
    name: string;
    specialization: string;
    aboutText: string;
    photoUrl: string;
}

interface TechStackData {
    current: string;
    learning: string;
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => Promise<void>;
    data: ProfileData;
    setData: React.Dispatch<React.SetStateAction<ProfileData>>;
    stack: TechStackData;
    setStack: React.Dispatch<React.SetStateAction<TechStackData>>;
}

export const EditModal: React.FC<EditModalProps> = ({ 
    isOpen, onClose, onSave, data, setData, stack, setStack 
}) => {
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const onCropComplete = useCallback((_area: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const [status, setStatus] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'error',
        title: '',
        message: ''
    });

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImage(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const uploadCroppedImage = async () => {
        if (!image || !croppedAreaPixels) return;
        setIsUploading(true);
        try {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.src = image;
            await new Promise((res) => (img.onload = res));

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(
                img,
                croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
                0, 0, croppedAreaPixels.width, croppedAreaPixels.height
            );

            canvas.toBlob(async (blob) => {
                if (!blob) return; 

                // ⚡️ Используем твой метод из сервиса
                const resData = await HomeApiService.uploadAvatar(blob);
                if (resData.url) {
                    setData({ ...data, photoUrl: resData.url });
                    setImage(null);
                }
                setIsUploading(false);
            }, 'image/webp', 0.9);
        } catch (e) {
            console.error(e);
            setIsUploading(false);
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Ошибка медиа',
                message: 'Не удалось загрузить аватар. Попробуйте другое изображение.'
            });
        }
    };

    const handleInternalSave = async () => {
        setIsSaving(true);
        try { 
            await onSave(); 
            setStatus({
                isOpen: true,
                type: 'success',
                title: 'Профиль обновлен',
                message: 'Ваши данные успешно синхронизированы с сервером.'
            });
        } catch (error) {
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Ошибка сохранения',
                message: 'Не удалось обновить данные профиля. Проверьте интернет-соединение.'
            });
        } finally { 
            setIsSaving(false); 
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative bg-[#0a0a0a] w-full max-w-2xl border border-white/10 rounded-[40px] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* ЭКРАН КРОППЕРА */}
                {image && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col">
                        <div className="relative flex-1">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={1 / 1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-8 bg-[#0a0a0a] border-t border-white/10 flex gap-4">
                            <button onClick={() => setImage(null)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Отмена</button>
                            <button onClick={uploadCroppedImage} disabled={isUploading} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20">
                                {isUploading ? 'Обработка...' : 'Применить кроп'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Основной контент (Header) */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center text-white">
                    <h2 className="text-lg font-black uppercase tracking-widest italic text-blue-500">Root Content Override</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 text-white custom-scrollbar">
                    {/* UI ЗАГРУЗКИ АВАТАРА */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                        <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 relative">
                            {data.photoUrl ? (
                                <img src={data.photoUrl} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-20"><Camera size={32} /></div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Аватар профиля</p>
                            <label className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-white hover:text-black transition-all">
                                <Upload size={14} /> Выбрать файл
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* Поля Имя, Специализация и т.д. */}
                    <EditField label="Имя" value={data.name} onChange={(val) => setData({ ...data, name: val })} />
                    <EditField label="Специализация" value={data.specialization} onChange={(val) => setData({ ...data, specialization: val })} />
                    <EditField label="О себе" value={data.aboutText} isTextarea onChange={(val) => setData({ ...data, aboutText: val })} />
                    
                    <div className="h-px bg-white/5 my-4" />
                    
                    <EditField label="Владеешь технологиями" value={stack.current} onChange={(val) => setStack({ ...stack, current: val })} />
                    <EditField label="Изучаешь технологии" value={stack.learning} onChange={(val) => setStack({ ...stack, learning: val })} />
                </div>

                <div className="p-8 border-t border-white/10 bg-[#0a0a0a]">
                    <button 
                        onClick={handleInternalSave} 
                        disabled={isSaving}
                        className="w-full py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                    >
                        {isSaving ? 'Синхронизация...' : <><Save size={16} /> Применить изменения</>}
                    </button>
                </div>
            </div>
            <StatusModal 
                isOpen={status.isOpen}
                type={status.type}
                title={status.title}
                message={status.message}
                onClose={() => setStatus(prev => ({ ...prev, isOpen: false }))}
            />
        </div>,
        document.body
    );
};

// Вспомогательный компонент остается внутри файла
interface EditFieldProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    isTextarea?: boolean;
}

const EditField: React.FC<EditFieldProps> = ({ label, value, onChange, isTextarea = false }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>
        {isTextarea ? (
            <textarea 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-blue-500/50 min-h-[200px] resize-y transition-all leading-relaxed whitespace-pre-wrap" 
                placeholder="Используйте Enter для создания новых абзацев..."
            />
        ) : (
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-blue-500/50 transition-all" 
            />
        )}
    </div>
);