export interface DailyView {
    viewed_at: string;
    count: number;
}

export interface ColumnTotals {
    home: number;
    portfolio: number;
    blogs: number;
    admin: number;
    auth: number;
    profile: number;
}

export interface StatsSummary {
    total_users: number;
    total_views: number;
    column_totals: ColumnTotals;
    daily_views: DailyView[];
}

export interface HistoryItem extends ColumnTotals {
    viewed_at: string;
    total: number;
    paths_list: string;
}

export interface UserStatRow extends ColumnTotals {
    user_id: number | null;
    ip_address: string;
    is_guest: boolean;
    total: number;
    last_visit: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    history: HistoryItem[];
}

export interface ModalUserInfo {
    id?: number | undefined;
    name: string;
    email?: string | undefined;
    role?: string | undefined;
    ip: string;
    isGuest: boolean;
}

export interface RawLog {
    page_path: string;
    views_count: number;
    updated_at: string;
    viewed_at: string;
}