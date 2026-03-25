export interface User {
    id: number;
    name: string;
    role: string;
    email: string;
    email_verified_at: string | null;
}
export type SortOption = 'latest' | 'popular' | 'popular_views' | 'most_viewed';
// Новый интерфейс для комментариев
export interface Comment {
    id: number;
    user_id: number;
    article_id: number;
    parent_id: number | null;
    content: string;
    is_edited: boolean;
    edited_at: string | null;
    likes_count: number;
    replies_count: number;
    created_at: string;
    user?: User;
    replies?: Comment[];
}

export type CommentSort = 'new' | 'popular' | 'discussed';

export interface ErrorModalState {
    isOpen: boolean;
    title: string;
    message: string;
}

export interface Blog {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    is_portfolio: boolean;
    top_tags?: string[];
    likes_count?: number;
    favorites_count?: number;
    total_views?: number;
    is_liked?: boolean;
    is_favorited?: boolean;
    user?: User;
}


export interface BlogPagination {
    data: Blog[]; // Массив блогов для текущей страницы
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

// Данные для создания/редактирования папки (блога)
export interface BlogInput {
    title: string;
    description: string;
}
export interface ArticleTag {
    id: number;
    name: string;
    slug?: string;
}

export interface Article {
    id: number;
    user_id: number;
    blog_id: number;
    title: string;
    content: string;
    slug: string;
    type: 'blog' | 'portfolio';
    tech_stack?: string;
    github_url?: string;
    created_at: string;
    updated_at: string;
    views_count?: number;
    comments?: Comment[];
    comments_count?: number;
    likes_count?: number;
    favorites_count?: number;
    is_liked?: boolean;
    is_favorited?: boolean;
    user?: User;
    tags?: ArticleTag[];
    image_url?: string;
}

// Специальный тип для комментария с вложенной статьей (для списка истории)
export interface CommentWithArticle extends Comment {
    article: Article;
}

// Данные для создания/редактирования статьи
export interface ArticleInput {
    title: string;
    content: string;
    tech_stack?: string;
    github_url?: string;
    slug?: string;
    image_url?: string;
    is_published?: boolean;
}

export interface MailSettings {
    mail_host: string;
    mail_port: string;
    mail_username: string;
    mail_password?: string;
    mail_from_name: string;
}

export interface Settings {
    email: string;
    githubUrl: string;
    resumeUrl?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

// Если в ответе только статус или сообщение
export interface SimpleResponse {
    message: string;
    status?: string;
    url?: string;
}

// Интерфейс для фильтров (параметров URL)
export interface ArticleQueryParams {
    page?: number;
    tag?: string | null;
    search?: string;
    search_type?: 'title' | 'author';
    sort?: string;
    favorites_only?: boolean | number;
}

export interface HomeSettings {
    name?: string;
    specialization?: string;
    about_text?: string;
    photo_url?: string;
    stack_current?: string;
    stack_learning?: string; 
}