// index.js
import gsap from 'gsap';
import { Scene, Vector2, WebGLRenderer } from 'three';
import Camera from './components/Camera.js';
import { Pane } from 'tweakpane';
import Globe from './components/Globe.js';
import Light from './components/Light.js';
import UI from './components/UI.js';

let canvas, webgl, renderer;

webgl = {};

canvas = document.createElement('canvas');
const app = document.querySelector('#app');
app.appendChild(canvas);

async function init() {
    webgl.canvas = canvas;

    const pr = window.devicePixelRatio;
    renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 1);

    // Activer les ombres pour un meilleur rendu du globe
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = renderer.PCFSoftShadowMap;

    // DOM
    webgl.viewport = new Vector2();
    webgl.gui = new Pane({
        title: 'F1 Globe Controls',
        expanded: false // Replié par défaut pour ne pas gêner
    });

    resize();

    await preload();

    start();

    // Start Update Loop
    gsap.ticker.add(update);

    // Initialiser les descriptions
    showWelcomeMessage();
}

async function preload() {
    // Preload des assets essentiels
    console.log('🌍 Préchargement des textures...');

    // Les textures seront chargées par le TextureLoader dans Globe.js
    // Assure-toi d'avoir ces fichiers dans ton dossier assets/ :
    // - assets/earth-texture.jpg (texture de la Terre)
    // - assets/stars.jpg (texture du champ d'étoiles)

    return new Promise(resolve => {
        setTimeout(() => {
            console.log('✅ Textures chargées !');
            resolve();
        }, 500);
    });
}

function start() {
    webgl.scene = new Scene();

    // Créer les composants dans l'ordre
    webgl.light = new Light();
    webgl.camera = new Camera();
    webgl.globe = new Globe(); // Un seul globe maintenant
    webgl.ui = new UI();

    console.log('🏎️ Globe F1 2025 initialisé !');
}

function update(time, deltaTime, frame) {
    // Mise à jour de la caméra
    webgl.camera.update();

    // Mise à jour de l'éclairage
    webgl.light.update();

    // Mise à jour du globe principal
    webgl.globe.update();

    render();
}

function render() {
    renderer.render(webgl.scene, webgl.camera.active);
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    webgl.viewportRatio = width / height;
    webgl.viewport.set(width, height);
    webgl.pixelRatio = window.devicePixelRatio;

    webgl.camera?.resize();
    renderer?.setSize(width, height);
}

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
        padding: 40px;
        border-radius: 20px;
        border: 2px solid #ff0000;
        text-align: center;
        z-index: 3000;
        font-family: 'Arial', sans-serif;
        max-width: 450px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
    `;

    welcomeDiv.innerHTML = `
        <h2 style="color: #ff4444; margin-top: 0; font-size: 24px;">🏎️ Globe F1 2025</h2>
        <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">Explorez les circuits de Formule 1 2025 sur un globe terrestre interactif !</p>
        
        <div style="text-align: left; margin: 25px 0; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px;">
            <h3 style="color: #ff4444; margin-top: 0; font-size: 16px;">🎮 Contrôles :</h3>
            <p style="margin: 8px 0;">🖱️ <strong>Drag :</strong> Faites tourner le globe</p>
            <p style="margin: 8px 0;">🖱️ <strong>Clic :</strong> Sélectionner un circuit</p>
            <p style="margin: 8px 0;">📱 <strong>Sidebar :</strong> Liste des circuits (droite)</p>
            <p style="margin: 8px 0;">✨ <strong>Points blancs :</strong> Marqueurs des circuits</p>
        </div>
        
        <button onclick="this.parentElement.remove()" 
                style="background: #ff0000; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; margin-top: 20px;">
            🚀 Explorer les circuits !
        </button>
    `;

    document.body.appendChild(welcomeDiv);

    // Auto-fermeture après 8 secondes
    setTimeout(() => {
        if (welcomeDiv.parentElement) {
            welcomeDiv.style.opacity = '0';
            welcomeDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => welcomeDiv.remove(), 500);
        }
    }, 8000);
}

// Gestion des événements
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', resize);

// Gestion du plein écran et raccourcis clavier
window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'f':
            // Plein écran
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
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
                webgl.globe.group.rotation.set(0, 0, 0);
                webgl.globe.autoRotate = true;
            }
            break;

        case 'escape':
            // Fermer les modals
            closeAllModals();
            break;
    }
});

function showHelpModal() {
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
        padding: 40px;
        border-radius: 20px;
        border: 2px solid #ff0000;
        max-width: 500px;
        font-family: 'Arial', sans-serif;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    `;

    content.innerHTML = `
        <h2 style="color: #ff4444; margin-top: 0; text-align: center;">🏎️ Guide d'utilisation</h2>
        
        <div style="display: grid; gap: 20px; margin: 30px 0;">
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                <h3 style="color: #ff4444; margin: 0 0 10px 0;">🖱️ Navigation</h3>
                <p style="margin: 5px 0;"><strong>Drag :</strong> Faire tourner le globe</p>
                <p style="margin: 5px 0;"><strong>Hover :</strong> Survoler les marqueurs</p>
                <p style="margin: 5px 0;"><strong>Clic :</strong> Sélectionner un circuit</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                <h3 style="color: #ff4444; margin: 0 0 10px 0;">⌨️ Raccourcis</h3>
                <p style="margin: 5px 0;"><strong>F :</strong> Plein écran</p>
                <p style="margin: 5px 0;"><strong>H :</strong> Cette aide</p>
                <p style="margin: 5px 0;"><strong>R :</strong> Réinitialiser la vue</p>
                <p style="margin: 5px 0;"><strong>Échap :</strong> Fermer les fenêtres</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                <h3 style="color: #ff4444; margin: 0 0 10px 0;">🏁 Circuits F1 2025</h3>
                <p style="margin: 5px 0;">• <strong>23 circuits</strong> de la saison 2025</p>
                <p style="margin: 5px 0;">• <strong>Marqueurs blancs</strong> sur le globe</p>
                <p style="margin: 5px 0;">• <strong>Sidebar droite</strong> avec images</p>
                <p style="margin: 5px 0;">• <strong>Détails</strong> en bas à gauche</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button onclick="document.getElementById('help-modal').style.display='none'" 
                    style="background: #ff0000; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
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

function closeAllModals() {
    const modals = ['help-modal', 'circuit-details', 'welcome-message'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

// Nettoyage à la fermeture
window.addEventListener('beforeunload', () => {
    webgl.globe?.destroy();

    // Nettoyer les éléments DOM
    const elements = [
        'welcome-message',
        'help-modal',
        'circuits-sidebar',
        'circuit-details'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
    });
});

// Gestion responsive de la sidebar
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('circuits-sidebar');
    if (sidebar && window.innerWidth < 1024) {
        // Sur mobile/tablette, réduire la largeur de la sidebar
        sidebar.style.width = '300px';
    } else if (sidebar) {
        sidebar.style.width = '400px';
    }
});

export function getWebGL() {
    return webgl;
}