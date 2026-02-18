import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus, Folder } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { Article, User } from '../types';

interface Props {
    user: User | null;
    blogId: number;
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
}

export function UserArticlesList({ user, blogId, onArticleSelect, onEditArticle, onCreateArticle }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const { articles, loading, deleteArticle } = useArticles(searchQuery, blogId);

    const canManage = !!user;

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Удалить запись?')) deleteArticle(id);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center py-20 opacity-20">
                <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Загрузка...</p>
            </div>
        );
    }

    // 2. ЕСЛИ ЗАГРУЗКА КОНЧИЛАСЬ, А СТАТЕЙ 0 — ПОКАЗЫВАЕМ КНОПКУ (Кирюша её увидит!)
    if (articles.length === 0) {
        return (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px]">
                <div className="p-6 bg-white/5 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Folder className="text-gray-700" size={24} />
                </div>
                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mb-8">В этой папке пока пусто</p>
                <button 
                    onClick={onCreateArticle} 
                    className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase hover:scale-105 transition-all"
                >
                    Создать первую запись
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Поиск и кнопка создания (всегда видна владельцу) */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input type="text" placeholder="Поиск в этой папке..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/[0.02] border border-white/5 rounded-full pl-12 pr-6 py-3 outline-none focus:border-blue-500/50 text-sm" />
                </div>
                
                {/* КНОПКА ДОБАВИТЬ: теперь видна "Кирюше" всегда! */}
                <button onClick={onCreateArticle} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                    <Plus size={14} /> Добавить запись
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {articles.map(article => (
                    <div key={article.id} onClick={() => onArticleSelect(article)} className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-blue-500/30 cursor-pointer transition-all flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-lg">{article.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {article.tech_stack?.split(',').map(tag => (
                                    <span key={tag} className="text-[8px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md uppercase font-black">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEditArticle(article); }} className="p-2 hover:text-blue-500"><Edit3 size={16}/></button>
                            <button onClick={(e) => handleDelete(e, article.id)} className="p-2 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}