import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // 這裡會呼叫我們等一下要寫的主程式 App.jsx

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);