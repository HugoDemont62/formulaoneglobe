// vite.config.js
import glslify from 'rollup-plugin-glslify';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [glslify()],

    // Configuration pour GitHub Pages
    base: process.env.NODE_ENV === 'production' ? '/globe-f1-2025/' : '/',

    // Optimisations de build
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    gsap: ['gsap'],
                    tweakpane: ['tweakpane']
                }
            }
        }
    },

    // Configuration du serveur de développement
    server: {
        host: true,
        port: 3000,
        open: true
    },

    // Optimisations des dépendances
    optimizeDeps: {
        include: ['three', 'gsap', 'tweakpane']
    }
});