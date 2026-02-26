// HEADER: Vite configuration enabling React support.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});

/*
BOTTOM EXPLANATION
- Responsibility: Configures Vite build/dev server with React JSX transform support.
- Key syntax: `plugins: [react()]` enables React fast-refresh and JSX compilation.
- Common mistakes: Missing plugin leads to JSX parsing errors.
*/
