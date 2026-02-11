import './bootstrap';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true); // Состояние загрузки

    useEffect(() => {
        console.log("Запрос к API запущен...");
        
        fetch('/get-projects')
            .then(res => {
                if (!res.ok) throw new Error('Ошибка сервера: ' + res.status);
                return res.json();
            })
            .then(data => {
                console.log("Данные получены успешно:", data);
                setArticles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Ошибка при получении данных:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '40px', background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
            <h1 style={{ marginBottom: '30px', color: '#38bdf8' }}>Мои Проекты</h1>
            
            {loading && <p>Загрузка данных из БД...</p>}
            
            {!loading && articles.length === 0 && <p>В базе данных пока нет проектов.</p>}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Авто-сетка
                gap: '20px' 
            }}>
                {articles.map(article => (
                    <div key={article.id} style={{ 
                        background: '#1e293b',
                        border: '1px solid #334155', 
                        padding: '20px', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#f8fafc' }}>{article.title}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{article.content}</p>
                        <div style={{ marginTop: '15px' }}>
                            <small style={{ color: '#38bdf8', fontWeight: 'bold' }}>Стек: {article.tech_stack}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);