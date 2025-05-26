// index.js - Point d'entrée corrigé pour Globe F1 2025
import gsap from 'gsap';
import { Scene, Vector2, WebGLRenderer } from 'three';
import Camera from './components/Camera.js';
import Globe from './components/Globe.js';
import Light from './components/Light.js';
import { Pane } from 'tweakpane';
import Slider from './components/Slider.js';

let canvas, webgl, renderer;

// Objet global WebGL
webgl = {};
window.webgl = webgl;

// Création du canvas
canvas = document.createElement('canvas');
const app = document.querySelector('#app');
app.appendChild(canvas);

/**
 * Initialisation principale de l'application
 */
async function init() {
    console.log('🚀 Initialisation de Globe F1 2025...');

    try {
        // Configuration du WebGL
        await setupWebGL();

        // Préchargement des ressources
        await preload();

        // Démarrage de l'application
        await start();

        // Démarrage de la boucle de rendu
        gsap.ticker.add(update);

        // Affichage du message de bienvenue
        showWelcomeMessage();

        console.log('✅ Globe F1 2025 initialisé avec succès !');

        // AJOUTER CES LIGNES :
        window.webgl = webgl;
        window.globe = webgl.globe;
        window.markers = webgl.globe?.circuitMarkers;

        console.log('🧪 Objets debug exposés : window.webgl, window.globe, window.markers');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showErrorMessage(error);
    }
}

/**
 * Configuration du moteur WebGL
 */
// Section à mettre à jour dans index.js - setupWebGL()

async function setupWebGL() {
    webgl.canvas = canvas;

    // Limite le pixel ratio pour éviter les problèmes de performance sur écrans haute densité
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Configuration améliorée du renderer
    renderer = new WebGLRenderer({
        canvas,
        antialias: true,       // Antialiasing pour éviter les arêtes dentelées
        alpha: true,
        powerPreference: "high-performance",
        precision: "highp",    // Haute précision pour les calculs
        logarithmicDepthBuffer: true,  // Améliore le rendu à différentes échelles
        stencil: false,        // Désactivé si non utilisé pour économiser de la mémoire
        depth: true
    });

    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 1);

    // Activation des ombres pour un rendu plus réaliste
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = renderer.PCFSoftShadowMap;

    // Configuration de l'interface de débogage
    webgl.gui = new Pane({
        title: 'Globe F1 Controls',
        expanded: false
    });

    // Configuration du viewport
    webgl.viewport = new Vector2();
    webgl.viewportRatio = window.innerWidth / window.innerHeight;

    resize();

    console.log('🎮 WebGL configuré');
}

/**
 * Préchargement des ressources
 */
async function preload() {
    console.log('📦 Préchargement des ressources...');

    // Simulation d'un préchargement (ici on n'a pas de ressources externes)
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('✅ Ressources prêtes');
            resolve();
        }, 500);
    });
}

/**
 * Démarrage de l'application
 */
async function start() {
    console.log('🌟 Démarrage de l\'application...');

    // Création de la scène
    webgl.scene = new Scene();

    // Création des composants dans l'ordre
    webgl.light = new Light();
    webgl.camera = new Camera();
    webgl.globe = new Globe();
    webgl.slider = new Slider();

    console.log('🎬 Application démarrée');
}

/**
 * Boucle de mise à jour principale
 */
function update(time, deltaTime, frame) {
    // Mise à jour de la caméra
    if (webgl.camera) {
        webgl.camera.update();
    }

    // Mise à jour de l'éclairage
    if (webgl.light) {
        webgl.light.update();
    }

    // Mise à jour du globe
    if (webgl.globe) {
        webgl.globe.update();
    }

    // Rendu de la scène
    render();
}

/**
 * Rendu de la scène
 */
function render() {
    if (renderer && webgl.scene && webgl.camera) {
        renderer.render(webgl.scene, webgl.camera.active);
    }
}

/**
 * Gestion du redimensionnement
 */
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    webgl.viewportRatio = width / height;
    webgl.viewport.set(width, height);
    webgl.pixelRatio = window.devicePixelRatio;

    // Mise à jour de la caméra
    if (webgl.camera) {
        webgl.camera.resize();
    }

    // Mise à jour du renderer
    if (renderer) {
        renderer.setSize(width, height);
    }
}

/**
 * Affichage du message de bienvenue
 */
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.id = 'welcome-message';
    welcomeDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,30,50,0.95));
        color: white;
        padding: 30px;
        border-radius: 15px;
        border: 2px solid #ff0000;
        text-align: center;
        z-index: 3000;
        font-family: 'Arial', sans-serif;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
        animation: fadeIn 0.5s ease-out;
    `;

    welcomeDiv.innerHTML = `
        <h2 style="color: #ff4444; margin-top: 0; font-size: 24px;">🏎️ Globe F1 2025</h2>
        <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            Explorez tous les circuits de Formule 1 2025 sur un globe interactif !
        </p>
        
        <div style="text-align: left; margin: 20px 0; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
            <h3 style="color: #ff4444; margin-top: 0; font-size: 14px;">🎮 Contrôles :</h3>
            <p style="margin: 5px 0; font-size: 14px;">🖱️ <strong>Drag :</strong> Faire tourner le globe</p>
            <p style="margin: 5px 0; font-size: 14px;">🖱️ <strong>Clic :</strong> Sélectionner un circuit</p>
            <p style="margin: 5px 0; font-size: 14px;">🎯 <strong>Points rouges :</strong> Circuits F1</p>
            <p style="margin: 5px 0; font-size: 14px;">🎮 <strong>Panneau droit :</strong> Vues prédéfinies</p>
        </div>
        
        <button onclick="this.parentElement.remove()" 
                style="background: #ff0000; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; margin-top: 15px; transition: background 0.3s ease;">
            🚀 Commencer l'exploration !
        </button>
    `;

    // Style pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(welcomeDiv);

    // Auto-fermeture après 8 secondes
    setTimeout(() => {
        if (welcomeDiv.parentElement) {
            welcomeDiv.style.animation = 'fadeOut 0.5s ease-out';
            welcomeDiv.style.animationFillMode = 'forwards';
            setTimeout(() => welcomeDiv.remove(), 500);
        }
    }, 8000);
}

/**
 * Affichage d'un message d'erreur
 */
function showErrorMessage(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(139, 0, 0, 0.95);
        color: white;
        padding: 30px;
        border-radius: 15px;
        border: 2px solid #ff6b6b;
        text-align: center;
        z-index: 4000;
        font-family: 'Arial', sans-serif;
        max-width: 400px;
    `;

    errorDiv.innerHTML = `
        <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ Erreur</h2>
        <p>Une erreur s'est produite lors du chargement du globe :</p>
        <code style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; display: block; margin: 15px 0;">
            ${error.message}
        </code>
        <p style="font-size: 14px; margin-top: 20px;">
            Veuillez vérifier que votre navigateur supporte WebGL et recharger la page.
        </p>
        <button onclick="window.location.reload()" 
                style="background: #ff6b6b; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin-top: 15px;">
            🔄 Recharger la page
        </button>
    `;

    document.body.appendChild(errorDiv);
}

/**
 * Gestion des raccourcis clavier
 */
function setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'f':
                // Plein écran
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.warn('Impossible de passer en plein écran:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
                break;

            case 'h':
                // Aide
                showHelpModal();
                break;

            case 'r':
                // Reset du globe
                if (webgl.globe) {
                    webgl.globe.resetPosition();
                }
                if (webgl.slider) {
                    webgl.slider.setSlide(0);
                }
                break;

            case 'escape':
                // Fermer les modales
                closeAllModals();
                break;

            case 'arrowright':
                // Vue suivante
                if (webgl.slider) {
                    webgl.slider.nextSlide();
                }
                e.preventDefault();
                break;

            case 'arrowleft':
                // Vue précédente
                if (webgl.slider) {
                    webgl.slider.previousSlide();
                }
                e.preventDefault();
                break;

            case ' ':
                // Pause/reprise rotation
                if (webgl.globe) {
                    const autoRotate = webgl.globe.autoRotate;
                    webgl.globe.setAutoRotate(!autoRotate);
                }
                e.preventDefault();
                break;
        }
    });
}

/**
 * Affichage de l'aide
 */
function showHelpModal() {
    // Supprimer l'ancienne modale si elle existe
    let helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.style.display = 'flex';
        return;
    }

    helpModal = document.createElement('div');
    helpModal.id = 'help-modal';
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
        color: white;
        padding: 30px;
        border-radius: 15px;
        border: 2px solid #ff0000;
        max-width: 500px;
        font-family: 'Arial', sans-serif;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        max-height: 80vh;
        overflow-y: auto;
    `;

    content.innerHTML = `
        <h2 style="color: #ff4444; margin-top: 0; text-align: center;">🏎️ Guide d'utilisation</h2>
        
        <div style="display: grid; gap: 15px; margin: 25px 0;">
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">🖱️ Contrôles Souris</h3>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Drag :</strong> Faire tourner le globe</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Hover :</strong> Survoler les marqueurs</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Clic :</strong> Sélectionner un circuit</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">⌨️ Raccourcis Clavier</h3>
                <p style="margin: 3px 0; font-size: 13px;"><strong>F :</strong> Plein écran</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>H :</strong> Cette aide</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>R :</strong> Réinitialiser la vue</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Espace :</strong> Pause/reprise rotation</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>← → :</strong> Changer de vue</p>
                <p style="margin: 3px 0; font-size: 13px;"><strong>Échap :</strong> Fermer les fenêtres</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">🏁 Circuits F1 2025</h3>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>23 circuits</strong> de la saison 2025</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Points rouges</strong> sur le globe</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Infos détaillées</strong> en bas à gauche</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Vues prédéfinies</strong> en haut à droite</p>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">🎮 Interface</h3>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Panneau droit :</strong> Contrôles de vue</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Panneau gauche :</strong> Paramètres avancés</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Rotation automatique :</strong> Activable/désactivable</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="document.getElementById('help-modal').style.display='none'" 
                    style="background: #ff0000; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                Compris ! 🚀
            </button>
        </div>
    `;

    helpModal.appendChild(content);
    document.body.appendChild(helpModal);

    // Fermer en cliquant à l'extérieur
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
}

/**
 * Fermer toutes les modales ouvertes
 */
function closeAllModals() {
    const modals = ['help-modal', 'circuit-info', 'welcome-message'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Gestion responsive
 */
function setupResponsive() {
    // Gestion du redimensionnement
    window.addEventListener('resize', resize);

    // Gestion de l'orientation sur mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(resize, 100);
    });

    // Détection du support WebGL
    if (!renderer || !renderer.capabilities.isWebGL2) {
        console.warn('⚠️ WebGL2 non supporté, utilisation de WebGL1');
    }
}

/**
 * Nettoyage lors de la fermeture
 */
function cleanup() {
    console.log('🧹 Nettoyage de l\'application...');

    // Arrêt de la boucle de rendu
    gsap.ticker.remove(update);

    // Nettoyage des composants
    if (webgl.globe) {
        webgl.globe.destroy();
    }

    if (webgl.slider) {
        webgl.slider.destroy();
    }

    if (webgl.light) {
        webgl.light.destroy?.();
    }

    if (webgl.camera) {
        webgl.camera.destroy?.();
    }

    // Nettoyage du renderer
    if (renderer) {
        renderer.dispose();
    }

    // Suppression des éléments DOM
    const elementsToRemove = [
        'welcome-message',
        'help-modal',
        'circuit-info',
        'view-controls'
    ];

    elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
    });

    console.log('✅ Nettoyage terminé');
}

// === INITIALISATION ===

// Démarrage de l'application
window.addEventListener('DOMContentLoaded', () => {
    init();
    setupKeyboardControls();
    setupResponsive();
});

// Nettoyage à la fermeture
window.addEventListener('beforeunload', cleanup);

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('❌ Erreur globale:', e.error);

    if (e.error?.message?.includes('WebGL')) {
        showErrorMessage(new Error('WebGL n\'est pas supporté par votre navigateur'));
    }
});

// Export pour les autres modules
export function getWebGL() {
    return webgl;
}