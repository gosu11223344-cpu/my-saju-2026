import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Vite는 import.meta.env 사용
  define: {
    __API_KEY__: JSON.stringify(process.env.VITE_API_KEY)
  },

  build: {
    outDir: 'dist',
  },
});
