// index.js - Version mobile optimisée pour Globe F1 2025
import gsap from 'gsap';
import { Scene, Vector2, WebGLRenderer } from 'three';
import Camera from './components/Camera.js';
import Globe from './components/Globe.js';
import Light from './components/Light.js';
import { Pane } from 'tweakpane';
import Slider from './components/Slider.js';
import CircuitsSidebar from './components/Globe/CircuitsSidebar.js';

const sidebar = new CircuitsSidebar((circuit, index) => {
    // Votre logique ici
    console.log('Circuit sélectionné :', circuit, index);
});

let canvas, webgl, renderer;

// Détection mobile/tactile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isSmallScreen = window.innerWidth <= 768;

// Objet global WebGL
webgl = {};
window.webgl = webgl;

// Variables pour gestion tactile optimisée
let lastTouchTime = 0;
let touchStartPos = { x: 0, y: 0 };
let isDragging = false;

// Création du canvas
canvas = document.createElement('canvas');
const app = document.querySelector('#app');
app.appendChild(canvas);

/**
 * Initialisation principale optimisée mobile
 */
async function init() {
    console.log('🚀 Initialisation Globe F1 2025 (Mobile optimisé)...');
    console.log(`📱 Détection: Mobile=${isMobile}, Touch=${isTouchDevice}, Small=${isSmallScreen}`);

    try {
        // Configuration WebGL optimisée
        await setupWebGL();

        // Préchargement adaptatif
        await preload();

        // Configuration mobile spécifique
        setupMobileOptimizations();

        // Démarrage application
        await start();

        // Démarrage boucle de rendu
        gsap.ticker.add(update);

        // Message de bienvenue adapté
        showWelcomeMessage();

        console.log('✅ Globe F1 2025 initialisé avec optimisations mobile !');

        // Exposition globale
        window.webgl = webgl;
        window.globe = webgl.globe;
        window.markers = webgl.globe?.circuitMarkers;

        console.log('🧪 Objets debug exposés');

    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        showErrorMessage(error);
    }
}

/**
 * Configuration WebGL optimisée pour mobile
 */
async function setupWebGL() {
    webgl.canvas = canvas;

    // Pixel ratio adaptatif (limite sur mobile pour les performances)
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);

    // Configuration renderer optimisée mobile
    const rendererConfig = {
        canvas,
        antialias: !isMobile, // Désactivé sur mobile pour les performances
        alpha: true,
        powerPreference: isMobile ? "default" : "high-performance",
        precision: isMobile ? "mediump" : "highp",
        logarithmicDepthBuffer: !isMobile, // Désactivé sur mobile
        stencil: false,
        depth: true
    };

    renderer = new WebGLRenderer(rendererConfig);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 1);

    // Ombres conditionnelles (désactivées sur mobile)
    if (!isMobile) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = renderer.PCFSoftShadowMap;
    }

    // Interface de débogage conditionnelle
    if (!isSmallScreen) {
        webgl.gui = new Pane({
            title: 'Globe F1 Controls',
            expanded: false
        });
    }

    // Configuration viewport
    webgl.viewport = new Vector2();
    webgl.viewportRatio = window.innerWidth / window.innerHeight;

    resize();

    console.log(`🎮 WebGL configuré (Mobile: ${isMobile}, PixelRatio: ${pixelRatio})`);
}

/**
 * Optimisations spécifiques mobile
 */
function setupMobileOptimizations() {
    if (!isTouchDevice) return;

    console.log('📱 Configuration optimisations tactiles...');

    // Empêche le zoom par pincement
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    // Empêche le menu contextuel sur long press
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Optimise les événements tactiles
    setupOptimizedTouchEvents();

    // Désactive certaines animations sur mobile
    if (isMobile) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }

    // Améliore les performances sur mobile
    setupMobilePerformanceOptimizations();
}

/**
 * Événements tactiles optimisés
 */
function setupOptimizedTouchEvents() {
    let touchCount = 0;
    let initialDistance = 0;
    let lastTap = 0;

    // Touch start optimisé
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchCount = e.touches.length;
        lastTouchTime = Date.now();

        if (touchCount === 1) {
            const touch = e.touches[0];
            touchStartPos = {
                x: touch.clientX,
                y: touch.clientY
            };
            isDragging = false;

            // Détection double tap
            const now = Date.now();
            if (now - lastTap < 300) {
                handleDoubleTap(touch);
            }
            lastTap = now;

        } else if (touchCount === 2) {
            // Calcul distance initiale pour zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.sqrt(
              Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2)
            );
        }
    }, { passive: false });

    // Touch move optimisé
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();

        if (touchCount === 1) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartPos.x;
            const deltaY = touch.clientY - touchStartPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Commence le drag seulement après un certain mouvement
            if (distance > 10 && !isDragging) {
                isDragging = true;
                if (webgl.globe) {
                    webgl.globe.setAutoRotate(false);
                }
            }

            if (isDragging && webgl.globe) {
                // Rotation du globe optimisée pour mobile
                const sensitivity = isMobile ? 0.003 : 0.005;
                webgl.globe.group.rotation.y += deltaX * sensitivity;
                webgl.globe.group.rotation.x += deltaY * sensitivity;
                webgl.globe.group.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, webgl.globe.group.rotation.x));

                touchStartPos = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            }

        } else if (touchCount === 2) {
            // Gestion zoom avec deux doigts (optionnel)
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.sqrt(
              Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2)
            );

            if (initialDistance > 0 && webgl.camera) {
                const scale = currentDistance / initialDistance;
                const camera = webgl.camera.main;
                const newZ = Math.max(1.5, Math.min(5, camera.position.z / scale));
                camera.position.z = newZ;
            }
        }
    }, { passive: false });

    // Touch end optimisé
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchCount = e.touches.length;

        if (touchCount === 0) {
            const touchDuration = Date.now() - lastTouchTime;

            // Si c'est un tap court sans drag
            if (!isDragging && touchDuration < 200) {
                handleSingleTap(e.changedTouches[0]);
            }

            // Reset après drag
            if (isDragging) {
                isDragging = false;
                setTimeout(() => {
                    if (webgl.globe) {
                        webgl.globe.setAutoRotate(true);
                    }
                }, 1000); // Délai plus court sur mobile
            }
        }

        initialDistance = 0;
    }, { passive: false });
}

/**
 * Gestion tap simple
 */
function handleSingleTap(touch) {
    if (!webgl.globe || !webgl.globe.circuitMarkers) return;

    const rect = canvas.getBoundingClientRect();
    const mouse = new Vector2(
      ((touch.clientX - rect.left) / rect.width) * 2 - 1,
      -((touch.clientY - rect.top) / rect.height) * 2 + 1
    );

    const intersectedMarker = webgl.globe.circuitMarkers.getMarkerFromMouse(
      mouse,
      webgl.camera.active
    );

    if (intersectedMarker) {
        webgl.globe.selectCircuit(intersectedMarker);
        console.log('🎯 Circuit sélectionné via tap mobile');
    } else {
        // Désélection
        if (webgl.globe.selectedCircuit) {
            webgl.globe.circuitMarkers.selectMarker(null);
            webgl.globe.selectedCircuit = null;
            webgl.globe.hideCircuitInfo();
        }
    }
}

/**
 * Gestion double tap
 */
function handleDoubleTap(touch) {
    console.log('👆 Double tap détecté');

    // Reset position du globe
    if (webgl.globe) {
        webgl.globe.resetPosition();
    }

    // Retour vue globale
    if (webgl.slider) {
        webgl.slider.setSlide(0);
    }
}

/**
 * Optimisations performances mobile
 */
function setupMobilePerformanceOptimizations() {
    if (!isMobile) return;

    // Réduit la fréquence de mise à jour sur mobile
    gsap.ticker.fps(isMobile ? 30 : 60);

    // Désactive certaines fonctionnalités gourmandes
    window.mobileOptimizations = {
        reducedAnimations: true,
        simplifiedShaders: true,
        lowerParticleCount: true
    };

    // Gestion mémoire mobile
    setupMobileMemoryManagement();

    console.log('⚡ Optimisations performances mobile activées');
}

/**
 * Gestion mémoire mobile
 */
function setupMobileMemoryManagement() {
    // Nettoyage automatique de la mémoire
    let memoryCheckInterval;

    const checkMemory = () => {
        if (performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            const totalMemory = performance.memory.totalJSHeapSize / 1024 / 1024; // MB

            console.log(`📊 Mémoire: ${usedMemory.toFixed(1)}MB / ${totalMemory.toFixed(1)}MB`);

            // Si mémoire > 100MB, force le garbage collection
            if (usedMemory > 100 && window.gc) {
                window.gc();
                console.log('🗑️ Garbage collection forcé');
            }
        }
    };

    if (isMobile) {
        memoryCheckInterval = setInterval(checkMemory, 30000); // Toutes les 30s
    }

    // Nettoyage avant fermeture
    window.addEventListener('beforeunload', () => {
        if (memoryCheckInterval) {
            clearInterval(memoryCheckInterval);
        }
    });
}

/**
 * Préchargement adaptatif
 */
async function preload() {
    console.log('📦 Préchargement adaptatif...');

    // Simulation de préchargement avec délai réduit sur mobile
    return new Promise(resolve => {
        const delay = isMobile ? 300 : 500;
        setTimeout(() => {
            console.log('✅ Ressources prêtes');
            resolve();
        }, delay);
    });
}

/**
 * Démarrage de l'application
 */
async function start() {
    console.log('🌟 Démarrage application...');

    // Création de la scène
    webgl.scene = new Scene();

    // Création des composants avec priorité mobile
    webgl.light = new Light();
    webgl.camera = new Camera();
    webgl.globe = new Globe();

    // Slider seulement sur desktop ou grands écrans
    if (!isSmallScreen) {
        webgl.slider = new Slider();
    }

    console.log('🎬 Application démarrée');
}

/**
 * Boucle de mise à jour optimisée
 */
function update(time, deltaTime, frame) {
    // Throttling sur mobile - met à jour moins souvent
    if (isMobile && frame % 2 !== 0) {
        render();
        return;
    }

    // Mise à jour caméra
    if (webgl.camera) {
        webgl.camera.update();
    }

    // Mise à jour éclairage (réduite sur mobile)
    if (webgl.light && (!isMobile || frame % 5 === 0)) {
        webgl.light.update();
    }

    // Mise à jour globe
    if (webgl.globe) {
        webgl.globe.update();
    }

    // Rendu
    render();
}

/**
 * Rendu optimisé
 */
function render() {
    if (renderer && webgl.scene && webgl.camera) {
        renderer.render(webgl.scene, webgl.camera.active);
    }
}

/**
 * Redimensionnement responsive
 */
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    webgl.viewportRatio = width / height;
    webgl.viewport.set(width, height);
    webgl.pixelRatio = window.devicePixelRatio;

    // Mise à jour caméra
    if (webgl.camera) {
        webgl.camera.resize();
    }

    // Mise à jour renderer avec pixel ratio adaptatif
    if (renderer) {
        const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height);
    }

    console.log(`📐 Resize: ${width}x${height} (ratio: ${webgl.viewportRatio.toFixed(2)})`);
}

/**
 * Message de bienvenue adapté mobile
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
        padding: ${isMobile ? '20px' : '30px'};
        border-radius: 15px;
        border: 2px solid #ff0000;
        text-align: center;
        z-index: 3000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: ${isMobile ? 'calc(100vw - 20px)' : '400px'};
        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
        animation: fadeIn 0.5s ease-out;
    `;

    // Contenu adapté mobile/desktop
    const controlsText = isTouchDevice ?
      `<p style="margin: 5px 0; font-size: ${isMobile ? '13px' : '14px'};">👆 <strong>Tap :</strong> Sélectionner un circuit</p>
         <p style="margin: 5px 0; font-size: ${isMobile ? '13px' : '14px'};">👆👆 <strong>Double tap :</strong> Réinitialiser</p>
         <p style="margin: 5px 0; font-size: ${isMobile ? '13px' : '14px'};">✋ <strong>Drag :</strong> Faire tourner le globe</p>
         <p style="margin: 5px 0; font-size: ${isMobile ? '13px' : '14px'};">🏎️ <strong>Menu :</strong> Liste des circuits</p>` :
      `<p style="margin: 5px 0; font-size: 14px;">🖱️ <strong>Drag :</strong> Faire tourner le globe</p>
         <p style="margin: 5px 0; font-size: 14px;">🖱️ <strong>Clic :</strong> Sélectionner un circuit</p>
         <p style="margin: 5px 0; font-size: 14px;">🎮 <strong>Panneau droit :</strong> Vues prédéfinies</p>`;

    welcomeDiv.innerHTML = `
        <h2 style="color: #ff4444; margin-top: 0; font-size: ${isMobile ? '20px' : '24px'};">🏎️ Globe F1 2025</h2>
        <p style="font-size: ${isMobile ? '14px' : '16px'}; line-height: 1.5; margin: 15px 0;">
            Explorez tous les circuits de Formule 1 2025 sur un globe interactif !
        </p>
        
        <div style="text-align: left; margin: 15px 0; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
            <h3 style="color: #ff4444; margin-top: 0; font-size: ${isMobile ? '13px' : '14px'};">${isTouchDevice ? '📱' : '🎮'} Contrôles :</h3>
            ${controlsText}
            <p style="margin: 5px 0; font-size: ${isMobile ? '13px' : '14px'};">🎯 <strong>Points rouges :</strong> Circuits F1</p>
        </div>
        
        <button onclick="this.parentElement.remove()" 
                style="background: #ff0000; color: white; border: none; padding: ${isMobile ? '10px 16px' : '12px 20px'}; border-radius: 8px; cursor: pointer; font-size: ${isMobile ? '14px' : '16px'}; font-weight: 600; margin-top: 15px; transition: background 0.3s ease; min-height: 44px;">
            🚀 ${isMobile ? 'C\'est parti !' : 'Commencer l\'exploration !'}
        </button>
    `;

    document.body.appendChild(welcomeDiv);

    // Auto-fermeture adaptée
    const autoCloseDelay = isMobile ? 6000 : 8000;
    setTimeout(() => {
        if (welcomeDiv.parentElement) {
            welcomeDiv.style.animation = 'fadeOut 0.5s ease-out';
            welcomeDiv.style.animationFillMode = 'forwards';
            setTimeout(() => welcomeDiv.remove(), 500);
        }
    }, autoCloseDelay);
}

/**
 * Message d'erreur
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
        padding: ${isMobile ? '20px' : '30px'};
        border-radius: 15px;
        border: 2px solid #ff6b6b;
        text-align: center;
        z-index: 4000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: ${isMobile ? 'calc(100vw - 20px)' : '400px'};
    `;

    errorDiv.innerHTML = `
        <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ Erreur</h2>
        <p>Une erreur s'est produite lors du chargement :</p>
        <code style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; display: block; margin: 15px 0; font-size: ${isMobile ? '12px' : '14px'};">
            ${error.message}
        </code>
        <p style="font-size: ${isMobile ? '13px' : '14px'}; margin-top: 20px;">
            ${isMobile ? 'Vérifiez votre connexion et' : 'Vérifiez que votre navigateur supporte WebGL et'} rechargez la page.
        </p>
        <button onclick="window.location.reload()" 
                style="background: #ff6b6b; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin-top: 15px; min-height: 44px;">
            🔄 Recharger
        </button>
    `;

    document.body.appendChild(errorDiv);
}

/**
 * Raccourcis clavier (desktop uniquement)
 */
function setupKeyboardControls() {
    if (isTouchDevice) return; // Pas de clavier sur mobile

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
                // Reset
                if (webgl.globe) {
                    webgl.globe.resetPosition();
                }
                if (webgl.slider) {
                    webgl.slider.setSlide(0);
                }
                break;

            case 'escape':
                // Fermer modales
                closeAllModals();
                break;

            case 'arrowright':
                if (webgl.slider) {
                    webgl.slider.nextSlide();
                }
                e.preventDefault();
                break;

            case 'arrowleft':
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
 * Aide adaptée mobile/desktop
 */
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
        padding: ${isMobile ? '10px' : '0'};
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
        color: white;
        padding: ${isMobile ? '20px' : '30px'};
        border-radius: 15px;
        border: 2px solid #ff0000;
        max-width: ${isMobile ? '100%' : '500px'};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        max-height: ${isMobile ? 'calc(100vh - 20px)' : '80vh'};
        overflow-y: auto;
    `;

    const controlsContent = isTouchDevice ? `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
            <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">📱 Contrôles Tactiles</h3>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Tap :</strong> Sélectionner un circuit</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Double tap :</strong> Réinitialiser la vue</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Drag :</strong> Faire tourner le globe</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Pincement :</strong> Zoomer (2 doigts)</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
            <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">📋 Menu Mobile</h3>
            <p style="margin: 3px 0; font-size: 13px;">• <strong>Bouton "Circuits"</strong> en haut</p>
            <p style="margin: 3px 0; font-size: 13px;">• <strong>Liste déroulante</strong> des 23 circuits</p>
            <p style="margin: 3px 0; font-size: 13px;">• <strong>Tap sur un circuit</strong> pour le voir</p>
        </div>` : `
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
            <p style="margin: 3px 0; font-size: 13px;"><strong>R :</strong> Réinitialiser</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Espace :</strong> Pause rotation</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>← → :</strong> Changer de vue</p>
        </div>`;

    content.innerHTML = `
        <h2 style="color: #ff4444; margin-top: 0; text-align: center; font-size: ${isMobile ? '18px' : '20px'};">🏎️ Guide d'utilisation</h2>
        
        <div style="display: grid; gap: 15px; margin: 20px 0;">
            ${controlsContent}
            
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                <h3 style="color: #ff4444; margin: 0 0 8px 0; font-size: 14px;">🏁 Circuits F1 2025</h3>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>23 circuits</strong> de la saison 2025</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Points rouges</strong> sur le globe</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Infos détaillées</strong> par circuit</p>
                <p style="margin: 3px 0; font-size: 13px;">• <strong>Navigation</strong> par continent</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="document.getElementById('help-modal').style.display='none'" 
                    style="background: #ff0000; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; min-height: 44px;">
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
 * Fermer toutes les modales
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
 * Configuration responsive avancée
 */
function setupResponsive() {
    // Gestion redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 100);
    });

    // Gestion orientation mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            resize();
            // Force un refresh des éléments UI sur mobile
            if (isMobile && webgl.globe) {
                webgl.globe.forceOcclusionUpdate();
            }
        }, 100);
    });

    // Détection support WebGL
    if (!renderer || !renderer.capabilities.isWebGL2) {
        console.warn('⚠️ WebGL2 non supporté, utilisation WebGL1');
    }

    // Gestion visibilité page (optimisation mobile)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page masquée : ralentir les animations
            gsap.ticker.fps(10);
        } else {
            // Page visible : reprendre la vitesse normale
            gsap.ticker.fps(isMobile ? 30 : 60);
        }
    });
}

/**
 * Nettoyage optimisé
 */
function cleanup() {
    console.log('🧹 Nettoyage application...');

    // Arrêt boucle de rendu
    gsap.ticker.remove(update);

    // Nettoyage composants
    if (webgl.globe) {
        webgl.globe.destroy();
    }

    if (webgl.slider) {
        webgl.slider.destroy();
    }

    if (webgl.light && webgl.light.destroy) {
        webgl.light.destroy();
    }

    if (webgl.camera && webgl.camera.destroy) {
        webgl.camera.destroy();
    }

    // Nettoyage renderer
    if (renderer) {
        renderer.dispose();
    }

    // Suppression éléments DOM
    const elementsToRemove = [
        'welcome-message',
        'help-modal',
        'circuit-info',
        'view-controls',
        'f1-circuits-sidebar',
        'f1-mobile-menu'
    ];

    elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
    });

    console.log('✅ Nettoyage terminé');
}

// === INITIALISATION ===

// Démarrage application
window.addEventListener('DOMContentLoaded', () => {
    init();
    setupKeyboardControls();
    setupResponsive();
});

// Nettoyage fermeture
window.addEventListener('beforeunload', cleanup);

// Gestion erreurs globales
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

// Ajout styles pour animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
`;
document.head.appendChild(style);