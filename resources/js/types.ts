export interface Article {
    id: number;
    title: string;
    content: string;
    type: 'blog' | 'portfolio';
    tech_stack?: string;
    slug: string;
    created_at: string;
    comments?: Array<{
        id: number;
        author_name: string;
        content: string;
        created_at: string;
    }>; 
}