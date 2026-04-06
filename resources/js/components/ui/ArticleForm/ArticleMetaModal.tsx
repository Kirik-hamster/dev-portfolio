import React, { useState } from 'react';
import { X, Tag, Link as LinkIcon, Camera, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { MediaApiService } from '@/services/MediaApiService';
import { ImageCropModal } from '../ImageCropModal';
import { User } from '@/types';
import { StatusModal } from '../StatusModal';

interface ArticleMetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    techStack: string;
    setTechStack: (val: string) => void;
    githubUrl: string;
    setGithubUrl: (val: string) => void;
    imageUrl: string;
    setImageUrl: (url: string) => void;
    user: User | null;
}

export const ArticleMetaModal: React.FC<ArticleMetaModalProps> = ({ 
    isOpen, onClose, techStack, setTechStack, githubUrl, setGithubUrl, imageUrl, setImageUrl, user
}) => {

    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [showNoAccess, setShowNoAccess] = useState(false); // Для показа ошибки
    const hasUploadAccess = user?.role === 'admin' || user?.role?.includes('-img');

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

    const handleUploadClick = (e: React.MouseEvent) => {
        if (!hasUploadAccess) {
            e.preventDefault();
            e.stopPropagation();
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Доступ ограничен',
                message: 'Изменять обложку может только администратор и редакторы медиа.'
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setTempImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = async () => {
        if (!imageUrl) return;
        
        try {
            // Вызываем твой метод удаления (он у тебя уже есть в MediaApiService)
            await MediaApiService.deleteImage(imageUrl); 
            setImageUrl(''); // Чистим ссылку в статье
        } catch (e) {
            console.error("Ошибка при удалении файла:", e);
        }
    };

    const handleSaveCrop = async (blob: Blob) => {
        setIsUploading(true);
        try {
            if (imageUrl) {
                await MediaApiService.deleteImage(imageUrl).catch(() => {});
            }
            const file = new File([blob], 'cover.webp', { type: 'image/webp' });
            
            const res = await MediaApiService.uploadCover(file); 
            
            setImageUrl(res.url);
            setTempImage(null);
        } catch (e) {
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Ошибка загрузки',
                message: 'Не удалось сохранить изображение в облако. Проверьте размер файла.'
            });
        } finally {
            setIsUploading(false);
        }
    };
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
            <div className="relative bg-[#080808] w-full max-w-lg border border-white/10 rounded-[40px] p-10 shadow-2xl">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Configuration</span>
                        <h3 className="text-xl font-black uppercase text-white">Данные проекта</h3>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {/* FORM */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Обложка (16:10)</label>
                        <div className="relative aspect-[16/10] w-full rounded-3xl bg-white/5 border border-white/10 overflow-hidden group">
                            <div className="w-full h-full" onClickCapture={handleUploadClick}>
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                                            <label className="p-4 bg-white text-black rounded-2xl cursor-pointer shadow-2xl active:scale-95 transition-all">
                                                <Camera size={20} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                            <button 
                                                onClick={handleDeleteImage} 
                                                className="p-4 bg-red-600 text-white rounded-2xl shadow-2xl active:scale-95 transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-colors border-2 border-dashed border-white/5">
                                        <Camera size={32} className="text-gray-600 mb-2" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Загрузить превью</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* TECH STACK TEXTAREA */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">
                            <Tag size={12} className="text-blue-500" /> Теги
                        </label>
                        <textarea 
                            value={techStack} 
                            onChange={(e) => setTechStack(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-white/5 min-h-[120px] resize-none"
                            placeholder="Перечислите через запятую..."
                        />
                    </div>

                    {/* SOURCE LINK TEXTAREA */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">
                            <LinkIcon size={12} className="text-blue-500" /> Ссылка
                        </label>
                        <textarea 
                            value={githubUrl} 
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-sm outline-none focus:border-blue-400/50 text-blue-400 placeholder:text-blue-400/10 min-h-[100px] resize-none"
                            placeholder="GitHub, GitLab или прямая ссылка..."
                        />
                    </div>

                    {/* APPLY BUTTON */}
                    <button 
                        onClick={onClose} 
                        className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl hover:bg-blue-600 hover:text-white"
                    >
                        Применить изменения
                    </button>
                </div>
            </div>
            {tempImage && (
                <ImageCropModal 
                    image={tempImage} 
                    aspectRatio={16/10} 
                    onClose={() => setTempImage(null)} 
                    onSave={handleSaveCrop}
                    isUploading={isUploading}
                />
            )}
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