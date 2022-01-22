import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactJsx from 'vite-react-jsx';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [mkcert(), reactRefresh(), reactJsx()],
  server: {
    port: 40800,
    https: true,
  },
  optimizeDeps: {
    include: ['shaka-player'],
  },
});
