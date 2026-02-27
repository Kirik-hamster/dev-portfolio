import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus, Folder, FileText} from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';
import { Article, User } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModel';
import { PremiumLoader } from '../PremiumLoader';

interface Props {
    user: User | null;
    blogId: number;
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
}

export function UserArticlesList({ user, blogId, onArticleSelect, onEditArticle, onCreateArticle }: Props) {
    
    
    const [searchQuery, setSearchQuery] = useState('');
    const { articles, pagination, currentPage, setCurrentPage, loading, deleteArticle } = useArticles(searchQuery, blogId);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

    // 1. Функция, которая только открывает окно
    const handleDeleteTrigger = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setArticleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // 2. Функция, которая реально удаляет после подтверждения
    const handleConfirmDelete = () => {
        if (articleToDelete) {
            deleteArticle(articleToDelete);
            setIsDeleteModalOpen(false);
            setArticleToDelete(null);
        }
    }

    if (loading) return <PremiumLoader />;

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

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {articles.map((article: Article) => (
                    <div 
                        key={article.id} 
                        onClick={() => onArticleSelect(article)} 
                        className="group p-8 bg-white/[0.01] border border-white/5 rounded-[35px] hover:border-blue-500/20 cursor-pointer transition-all flex flex-col gap-5 relative overflow-hidden h-64"
                    >
                        {/* ДЕКОР: Иконка статьи на фоне (как в Блогах) */}
                        <div className="absolute -right-6 -bottom-6 opacity-[0.02] transform -rotate-12 transition-transform group-hover:scale-110 pointer-events-none">
                            <FileText size={180} className="text-white" />
                        </div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex-1 min-w-0 pr-6"> 
                                <h4 className="font-black text-2xl tracking-tighter text-white/90 group-hover:text-blue-400 transition-colors leading-tight mb-3 break-all">
                                    {article.title}
                                </h4>
                                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 break-all opacity-60">
                                    {article.content?.replace(/<[^>]*>/g, '') || "Нет текста для предварительного просмотра..."}
                                </p>
                            </div>

                            {/* КНОПКИ УПРАВЛЕНИЯ (Стильные) */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-auto relative z-20">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onEditArticle(article); }} 
                                    className="p-3 bg-white/5 hover:bg-blue-500/20 text-gray-500 hover:text-blue-500 rounded-2xl border border-white/5 transition-all active:scale-90"
                                    title="Редактировать"
                                >
                                    <Edit3 size={16}/>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTrigger(e, article.id); }} 
                                    className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-2xl border border-white/5 transition-all active:scale-90"
                                    title="Удалить"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>

                        {/* ТЕГИ (Нижняя часть) */}
                        <div className="mt-auto flex flex-wrap gap-2 relative z-10">
                            {article.tech_stack?.split(',').map((tag: string) => (
                                <span key={tag} className="...">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Удаление записи"
                message="Вы уверены, что хотите безвозвратно удалить эту статью? Это действие нельзя отменить."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
            {/* ПАГИНАЦИЯ ВНУТРИ ПРОФИЛЯ */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                    {[...Array(pagination.last_page)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-[10px] font-black ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}
                        >
                            {String(i + 1).padStart(2, '0')}
                        </button>
                    ))}
                </div>
            )}
            
        </div>
    );
}