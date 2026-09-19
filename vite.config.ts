import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Quando o app chamar /api-cartola, o Vite mascara e redireciona para a Globo
      '/api-cartola': {
        target: 'https://api.cartola.globo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-cartola/, ''),
      },
    },
  },
});
