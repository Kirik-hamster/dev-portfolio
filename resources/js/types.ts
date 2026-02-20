export interface User {
    id: number;
    name: string;
    role: 'admin' | 'user';
    email: string;
}

// Новый интерфейс для комментариев
export interface Comment {
    id: number;
    user_id: number;
    article_id: number;
    content: string;
    likes_count: number;
    created_at: string;
    user?: User; // Данные автора комментария
}

export interface Blog {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    is_portfolio: boolean;
}

// Данные для создания/редактирования папки (блога)
export interface BlogInput {
    title: string;
    description: string;
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
    comments?: Comment[];
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