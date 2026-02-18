// resources/js/types.ts

export interface User {
    id: number;
    name: string;
    role: 'admin' | 'user';
    email: string;
}

// НОВЫЙ ИНТЕРФЕЙС
export interface Blog {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    is_portfolio: boolean;
}

export interface Article {
    id: number;
    blog_id: number; // Ссылка на родителя
    title: string;
    content: string;
    slug: string;
    type: 'blog' | 'portfolio';
    tech_stack?: string;
    github_url?: string;
    comments?: any[];
}