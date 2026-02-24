import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, NavigateFunction } from 'react-router-dom';
import { User, Article, Blog } from '../types';

// Импорт страниц
import { HomePage } from '../pages/HomePage';
import { PortfolioPage } from '../pages/PortfolioPage';
import { ArticleDetailPage } from '../pages/ArticleDetailPage';
import { ArticleFormPage } from '../pages/ArticleFormPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { BlogsPage } from '../pages/BlogsPage'; 
import { ProfilePage } from '../pages/ProfilePage';
import { VerifyCodePage } from '../pages/auth/VerifyCodePage';

// Типы для пропсов
interface AppRoutesProps {
    user: User | null;
    portfolioBlogId: number | null;
    setUser: (user: User | null) => void;
    refreshUser: () => Promise<void>;
}

interface WrapperProps {
    user: User | null;
    navigate: NavigateFunction;
}

/**
 * Обертки (Wrappers) теперь живут здесь, изолируя логику useParams
 */
const BlogsPageWrapper: React.FC<WrapperProps> = ({ user, navigate }) => {
    const { blogId } = useParams();
    return (
        <BlogsPage 
            user={user} 
            onNavigateToProfile={() => navigate('/profile')}
            onArticleSelect={(a) => navigate(`/article/${a.id}`)}
            initialBlogId={blogId ? Number(blogId) : null}
        />
    );
};

const ArticleDetailPageWrapper: React.FC<WrapperProps> = ({ user, navigate }) => {
    const { id } = useParams();
    return (
        <ArticleDetailPage 
            articleId={Number(id)} 
            onBack={() => navigate(-1)} 
            user={user} 
            onNavigateToLogin={() => navigate('/login')} 
        />
    );
};

export const AppRoutes: React.FC<AppRoutesProps> = ({ user, portfolioBlogId, setUser, refreshUser }) => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<HomePage onNavigateToPortfolio={() => navigate('/portfolio')} />} />
            
            <Route path="/portfolio" element={
                <PortfolioPage 
                    user={user} 
                    blogId={portfolioBlogId}
                    onArticleSelect={(a) => navigate(`/article/${a.id}`)}
                    onEditArticle={(a) => navigate(`/form/edit/${a.id}`)} 
                    onCreateArticle={() => navigate(`/form/new/${portfolioBlogId}`)} 
                />
            } />

            <Route path="/profile/*" element={
                user ? (
                    user.email_verified_at 
                        ? <ProfilePage user={user} onBlogSelect={(id) => navigate(`/profile/blog/${id}`)} onNavigateToPortfolio={() => navigate('/portfolio')} onTriggerCreate={(blogId) => navigate(`/form/new/${blogId}`)} onEditArticle={(a) => navigate(`/form/edit/${a.id}`)} onArticleSelect={(a) => navigate(`/article/${a.id}`)} />
                        : <VerifyCodePage onVerified={refreshUser} /> // Показываем код только здесь!
                ) : <Navigate to="/login" />
            } />

            {/* Вложенные роуты для блогов */}
            <Route path="/blogs" element={<BlogsPageWrapper user={user} navigate={navigate} />}>
                <Route path=":blogId" element={<BlogsPageWrapper user={user} navigate={navigate} />} />
            </Route>

            <Route path="/article/:id" element={<ArticleDetailPageWrapper user={user} navigate={navigate} />} />

            <Route path="/form/new/:blogId" element={
                user?.email_verified_at 
                    ? <ArticleFormPage user={user} onSave={() => navigate(-1)} onCancel={() => navigate(-1)} />
                    : <VerifyCodePage onVerified={refreshUser} />
            } />
            <Route path="/form/edit/:articleId" element={<ArticleFormPage user={user} onSave={() => navigate(-1)} onCancel={() => navigate(-1)} />} />
            
            <Route path="/login" element={<LoginPage onLoginSuccess={(u) => { setUser(u); navigate('/'); }} onNavigateToRegister={() => navigate('/register')} />} />
            <Route path="/register" element={<RegisterPage onRegisterSuccess={(u) => { setUser(u); navigate('/'); }} onNavigateToLogin={() => navigate('/login')} />} />
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};