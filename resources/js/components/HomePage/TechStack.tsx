import React from 'react';

const TechTile = ({ name }: { name: string }) => {
    const mapping: Record<string, string> = {
        'Vuejs': 'vuejs', 'Golang': 'go', 'PHP': 'php', 'TypeScript': 'typescript', 
        'Docker': 'docker', 'PostgreSQL': 'postgresql', 'C': 'c', 'Linux': 'linux', 
        'Nginx': 'nginx', 'React': 'react', 'MySQL': 'mysql', 'HTML': 'html5',
        'CSS': 'css3', 'Bootstrap': 'bootstrap', 'Laravel': 'laravel',
        'JavaScript': 'javascript', 'Python': 'python', 'Redis': 'redis',
        'Rust': 'rust', 'Kubernetes': 'kubernetes', 'Bash': 'bash', 'Git': 'git',
        'Assembly': 'wasm', 'eBPF': 'network-wired', 'Kernel': 'linux'
    };
    
    const slug = mapping[name] || name.toLowerCase().trim();
    const iconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
    
    return (
        <div className="group relative flex flex-col items-center">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl z-50 whitespace-nowrap">
                {name}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </div>

            <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 group-hover:bg-[#222] transition-all duration-500 shadow-lg">
                <img 
                    src={iconUrl} 
                    alt={name} 
                    className="w-8 h-8 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 object-contain" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                />
            </div>
        </div>
    );
};

interface TechStackProps {
    current: string;
    learning: string;
}

export const TechStack: React.FC<TechStackProps> = ({ current, learning }) => (
    <section className="flex flex-col gap-20 animate-in fade-in duration-1000 delay-300">
        {/* Блок 1: Владею */}
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">
                    Владею технологиями
                </h3>
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="flex flex-wrap gap-4">
                {current.split(',').map((tech, i) => (
                    <TechTile key={i} name={tech.trim()} />
                ))}
            </div>
        </div>
        
        {/* Блок 2: Изучаю */}
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] whitespace-nowrap">
                    Изучаю технологии
                </h3>
                <div className="h-px w-full bg-gradient-to-r from-emerald-500/10 to-transparent" />
            </div>
            <div className="flex flex-wrap gap-4">
                {learning.split(',').map((tech, i) => (
                    <TechTile key={i} name={tech.trim()} />
                ))}
            </div>
        </div>
    </section>
);