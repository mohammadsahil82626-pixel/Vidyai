import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import path from 'path';
import {defineConfig} from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, '.'),
      },
    },
    server: {
      // The app mounts Vite through Express middleware, which does not forward
      // WebSocket upgrades. Disable HMR so the injected client never opens a
      // socket that cannot be completed in the preview runtime.
      hmr: false,
      // Keep file watching configurable without enabling a preview HMR socket.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
