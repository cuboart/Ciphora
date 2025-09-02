import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './input.css';

// 添加一些调试信息
console.log('React app starting...');
console.log('Tailwind CSS should be loaded');

// 检查App组件是否存在
console.log('App component:', App);

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 