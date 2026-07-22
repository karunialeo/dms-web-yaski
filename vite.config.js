// import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.jsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
            // wayfinder({
            //     formVariants: true,
            // }),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        server: {
            host: '192.168.0.64', // biar listen di semua interface
            port: Number(env.VITE_APP_PORT) || 5173,
            strictPort: true,
            cors: {
                origin: '*', // kasih akses ke semua origin (dev doang gapapa)
            },
            hmr: {
                // Gunakan variabel dari env di sini
                // Berikan fallback 'localhost' jika variabel tidak ditemukan
                host: env.VITE_HMR_HOST || '192.168.0.64',
            },
        },
    };
});
