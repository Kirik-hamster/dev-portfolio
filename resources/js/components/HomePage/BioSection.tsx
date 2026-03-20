import React from 'react';

interface BioSectionProps {
    aboutText: string;
}

export const BioSection: React.FC<BioSectionProps> = ({ aboutText }) => {
    return (
        <section className="mb-24 rounded-[20px] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 group">
            <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[20px] p-8 md:px-12 md:py-12 overflow-hidden">
                
                <div className="flex items-center gap-3 mb-8 opacity-60">
                    <span className="text-lg font-bold text-blue-500 tracking-tight">
                        Немного про меня и пром мой сайт
                    </span>
                    <div className="h-px w-24 bg-gradient-to-r from-white/20 to-transparent" />
                </div>
                <div className="relative z-10 space-y-8">
                    {aboutText.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                        <p 
                            key={index} 
                            style={{ hyphens: 'auto' }} 
                            className="text-lg md:text-xl text-white/80 font-semibold leading-[1.6] tracking-tight max-w-5xl text-justify transition-colors hover:text-white/90 duration-500" 
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
            </div>
        </section>
    );
};