export interface User {
    id: number;
    name: string;
    role: 'admin' | 'user';
    email: string;
    email_verified_at: string | null;
}

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
    created_at: string;
    user?: User;
    replies?: Comment[];
}

export interface Blog {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    is_portfolio: boolean;
    top_tags?: string[];
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

export interface MailSettings {
    mail_host: string;
    mail_port: string;
    mail_username: string;
    mail_password?: string;
    mail_from_name: string;
}