import React from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => Promise<void>;
    data: {
        name: string;
        specialization: string;
        aboutText: string;
        photoUrl: string;
    };
    setData: React.Dispatch<React.SetStateAction<any>>;
    stack: {
        current: string;
        learning: string;
    };
    setStack: React.Dispatch<React.SetStateAction<any>>;
}

export const EditModal: React.FC<EditModalProps> = ({ 
    isOpen, onClose, onSave, data, setData, stack, setStack 
}) => {
    if (!isOpen) return null;

    const [isSaving, setIsSaving] = React.useState(false);

    const handleInternalSave = async () => {
        try {
            setIsSaving(true);
            await onSave(); 
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            {/* Modal Box */}
            <div className="relative bg-[#0a0a0a] w-full max-w-2xl border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center text-white">
                    <h2 className="text-lg font-black uppercase tracking-widest italic text-blue-500">Root Content Override</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto space-y-6 text-white custom-scrollbar">
                    <EditField 
                        label="Имя" 
                        value={data.name} 
                        onChange={(val) => setData({ ...data, name: val })} 
                    />
                    
                    <EditField 
                        label="Специализация" 
                        value={data.specialization} 
                        onChange={(val) => setData({ ...data, specialization: val })} 
                    />

                    <EditField 
                        label="О себе" 
                        value={data.aboutText} 
                        isTextarea 
                        onChange={(val) => setData({ ...data, aboutText: val })} 
                    />

                    <EditField 
                        label="Avatar S3 URL" 
                        value={data.photoUrl} 
                        onChange={(val) => setData({ ...data, photoUrl: val })} 
                    />

                    <div className="h-px bg-white/5 my-4" />

                    <EditField 
                        label="Владеешь технологиями" 
                        value={stack.current} 
                        onChange={(val) => setStack({ ...stack, current: val })} 
                    />

                    <EditField 
                        label="Изучаешь технологии" 
                        value={stack.learning} 
                        onChange={(val) => setStack({ ...stack, learning: val })} 
                    />
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/10 bg-[#0a0a0a] rounded-b-[40px]">
                    <button 
                        onClick={handleInternalSave} // ⚡️ Теперь вызываем сохранение
                        disabled={isSaving}
                        className="w-full py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                    >
                        {isSaving ? 'Saving to Database...' : <><Save size={16} /> Применить изменения</>}
                    </button>
                </div>
            </div>
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