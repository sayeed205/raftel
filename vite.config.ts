import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import tanstackRouter from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const qBittorrentTarget =
    env.VITE_QBITTORRENT_API_URL ?? 'http://localhost:8080';

  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      viteReact(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          secure: false,
          changeOrigin: true,
          xfwd: true,
          target: qBittorrentTarget,
        },
        '/backend': {
          secure: false,
          changeOrigin: true,
          target: qBittorrentTarget,
        },
      },
    },
    build: {
      outDir: mode === 'demo' ? './raftel-demo' : './raftel/public',
    },
    publicDir: './public',
    test: {
      globals: true,
      environment: 'jsdom',
    },
    define: {
      'import.meta.env.VITE_PACKAGE_VERSION': JSON.stringify(
        process.env.npm_package_version
      ),
      'process.env': {},
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  };
});
