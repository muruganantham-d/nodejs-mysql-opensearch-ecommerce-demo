// HEADER: React entrypoint that mounts the root App component.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import AdminProductsPage from './pages/AdminProductsPage';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

/*
BOTTOM EXPLANATION
- Responsibility: Bootstraps React app, registers routes, and mounts everything into HTML root.
- Key syntax: `BrowserRouter` + `Routes` + `Route` defines client-side pages without full browser refresh.
- Common mistakes: Missing fallback route can leave users on blank screen for unknown paths.
*/
