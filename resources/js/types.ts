// resources/js/types.ts

export interface User {
    id: number;
    name: string;
    role: 'admin' | 'user';
    email: string;
}

export interface Article {
    id: number;
    title: string;
    content: string;
    slug: string;
    type: 'blog' | 'portfolio';
    tech_stack?: string;
    github_url?: string;
    comments?: any[];
}