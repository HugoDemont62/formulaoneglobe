// Fichier: vite.config.js
// Configuration Vite simplifiée et optimisée pour le déploiement Vercel

import glslify from 'rollup-plugin-glslify';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [glslify()],

    // Configuration pour le déploiement (GitHub Pages ou Vercel)
    base: './', // Chemins relatifs pour une meilleure compatibilité

    // Optimisations de build
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,

        // Utiliser esbuild (inclus par défaut) au lieu de terser
        minify: 'esbuild',

        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    gsap: ['gsap'],
                    tweakpane: ['tweakpane']
                }
            },

            // Gestion des warnings sans casser le build
            onwarn(warning, warn) {
                // Ignorer les warnings d'eval pour les modules Three.js
                if (warning.code === 'EVAL') {
                    return;
                }
                // Ignorer les warnings de modules externes
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
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
        include: ['three', 'gsap', 'tweakpane'],
        exclude: [
            // Exclure les modules problématiques
            'three/examples/jsm/libs/lottie_canvas.module.js'
        ]
    }
});