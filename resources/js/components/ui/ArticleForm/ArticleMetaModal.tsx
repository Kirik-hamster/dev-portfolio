import React from 'react';
import { X, Tag, Link as LinkIcon } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ArticleMetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    techStack: string;
    setTechStack: (val: string) => void;
    githubUrl: string;
    setGithubUrl: (val: string) => void;
}

export const ArticleMetaModal: React.FC<ArticleMetaModalProps> = ({ 
    isOpen, onClose, techStack, setTechStack, githubUrl, setGithubUrl 
}) => {
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
        </div>,
        document.body
    );
};