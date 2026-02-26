// HEADER: React entrypoint that mounts the root App component.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*
BOTTOM EXPLANATION
- Responsibility: Bootstraps React app into HTML root and imports global styles.
- Key syntax: `createRoot(...).render(...)` is React 18 mounting API.
- Common mistakes: Forgetting styles import can make layout look broken.
*/
