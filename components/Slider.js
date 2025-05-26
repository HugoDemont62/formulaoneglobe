// components/Slider.js - Vues alignées sur les continents
import { getWebGL } from '../index.js';

/**
 * Classe pour gérer les différentes vues du globe
 * Avec positions de caméra alignées sur les continents
 */
export default class Slider {
  constructor() {
    this.webgl = getWebGL();
    this.currentSlide = 0;

    // Positions de caméra alignées sur les continents réels
    this.cameraPositions = [
      {
        x: 0, y: 0, z: 3,
        name: "🌍 Vue Globale",
        description: "Vue d'ensemble de la planète"
      },
      {
        x: 1.5, y: 10, z: 4,
        name: "🇪🇺 Europe",
        description: "Monaco, Spa, Silverstone, Imola"
      },
      {
        x: -3.5, y: 1, z: 3.5,
        name: "🇺🇸 Amérique du Nord",
        description: "Miami, Austin, Montréal, Las Vegas"
      },
      {
        x: 2.8, y: 0.5, z: -3.2,
        name: "🇯🇵 Asie-Pacifique",
        description: "Suzuka, Shanghai, Singapour, Bakou"
      },
      {
        x: -2.5, y: -2, z: 3,
        name: "🇧🇷 Amérique du Sud",
        description: "Interlagos, Mexique"
      },
      {
        x: 2.2, y: -2.5, z: 2.8,
        name: "🇦🇺 Océanie",
        description: "Melbourne (Albert Park)"
      },
      {
        x: 3, y: 0.8, z: 2.5,
        name: "🏜️ Moyen-Orient",
        description: "Bahreïn, Arabie Saoudite, Qatar, Abu Dhabi"
      }
    ];

    this.createControls();
  }

  /**
   * Crée les contrôles de vue avec meilleur design
   */
  createControls() {
    // Création du panneau de contrôle
    const controlPanel = document.createElement('div');
    controlPanel.id = 'view-controls';
    controlPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(15px);
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 280px;
    `;

    // Titre avec style amélioré
    const title = document.createElement('h4');
    title.textContent = '🎮 Vues Continents';
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #ff4444;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    `;
    controlPanel.appendChild(title);

    // Conteneur pour les boutons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // Boutons pour chaque vue
    this.cameraPositions.forEach((position, index) => {
      const button = document.createElement('button');
      button.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
          <span style="font-weight: 600; font-size: 14px;">${position.name}</span>
          <span style="font-size: 11px; opacity: 0.7; margin-top: 2px;">${position.description}</span>
        </div>
      `;

      button.style.cssText = `
        width: 100%;
        padding: 12px 15px;
        background: ${index === 0 ? 'linear-gradient(135deg, #ff0000, #cc0000)' : 'rgba(255, 255, 255, 0.08)'};
        color: white;
        border: 1px solid ${index === 0 ? '#ff0000' : 'rgba(255, 255, 255, 0.2)'};
        border-radius: 10px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        position: relative;
        overflow: hidden;
      `;

      button.addEventListener('click', () => this.setSlide(index));

      button.addEventListener('mouseenter', () => {
        if (index !== this.currentSlide) {
          button.style.background = 'rgba(255, 255, 255, 0.15)';
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 5px 15px rgba(255, 68, 68, 0.2)';
        }
      });

      button.addEventListener('mouseleave', () => {
        if (index !== this.currentSlide) {
          button.style.background = 'rgba(255, 255, 255, 0.08)';
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = 'none';
        }
      });

      buttonsContainer.appendChild(button);
    });

    controlPanel.appendChild(buttonsContainer);

    // Séparateur
    const separator = document.createElement('hr');
    separator.style.cssText = `
      margin: 20px 0 15px 0;
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    `;
    controlPanel.appendChild(separator);

    // Contrôles supplémentaires
    const extraControls = document.createElement('div');
    extraControls.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // Bouton rotation automatique avec gestion des vues
    const autoRotateButton = document.createElement('button');
    autoRotateButton.innerHTML = '🔄 <span>Rotation Auto</span>';
    autoRotateButton.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 15px;
      background: linear-gradient(135deg, #00aa00, #008800);
      color: white;
      border: 1px solid #00aa00;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    `;

    let autoRotateEnabled = true;
    autoRotateButton.addEventListener('click', () => {
      autoRotateEnabled = !autoRotateEnabled;

      if (this.webgl.globe) {
        if (autoRotateEnabled) {
          // Si on réactive la rotation, revenir à la vue globale
          this.setSlide(0);
          setTimeout(() => {
            this.webgl.globe.setAutoRotate(true);
          }, 500);
        } else {
          this.webgl.globe.setAutoRotate(false);
        }
      }

      if (autoRotateEnabled) {
        autoRotateButton.style.background = 'linear-gradient(135deg, #00aa00, #008800)';
        autoRotateButton.style.borderColor = '#00aa00';
        autoRotateButton.innerHTML = '🔄 <span>Rotation Auto</span>';
      } else {
        autoRotateButton.style.background = 'linear-gradient(135deg, #aa0000, #880000)';
        autoRotateButton.style.borderColor = '#aa0000';
        autoRotateButton.innerHTML = '⏸️ <span>Rotation Off</span>';
      }
    });

    extraControls.appendChild(autoRotateButton);

    // Bouton reset
    const resetButton = document.createElement('button');
    resetButton.innerHTML = '🏠 <span>Reset Vue</span>';
    resetButton.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    `;

    resetButton.addEventListener('click', () => {
      // Reset complet : vue globale + rotation réactivée
      this.setSlide(0);
      if (this.webgl.globe) {
        this.webgl.globe.resetPosition();

        // Réactiver la rotation après un délai
        setTimeout(() => {
          this.webgl.globe.setAutoRotate(true);

          // Mettre à jour le bouton rotation
          autoRotateEnabled = true;
          autoRotateButton.style.background = 'linear-gradient(135deg, #00aa00, #008800)';
          autoRotateButton.style.borderColor = '#00aa00';
          autoRotateButton.innerHTML = '🔄 <span>Rotation Auto</span>';
        }, 1000);
      }
    });

    resetButton.addEventListener('mouseenter', () => {
      resetButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    resetButton.addEventListener('mouseleave', () => {
      resetButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    extraControls.appendChild(resetButton);
    controlPanel.appendChild(extraControls);

    document.body.appendChild(controlPanel);

    // Sauvegarde des boutons pour la mise à jour
    this.buttons = buttonsContainer.querySelectorAll('button');
  }

  /**
   * Change la vue de la caméra avec réinitialisation de la terre
   */
  setSlide(index) {
    if (index < 0 || index >= this.cameraPositions.length) return;

    this.currentSlide = index;
    const position = this.cameraPositions[index];

    // CRUCIAL : Arrêter la rotation et remettre la terre à 0
    if (this.webgl.globe) {
      // Arrêter la rotation automatique
      this.webgl.globe.setAutoRotate(false);

      // Remettre la terre à sa position d'origine
      this.webgl.globe.resetPosition();

      console.log('🔄 Terre remise à zéro pour alignement continent');
    }

    // Attendre un peu que la terre soit stable, puis positionner la caméra
    setTimeout(() => {
      if (this.webgl.camera && this.webgl.camera.main) {
        const camera = this.webgl.camera.main;
        this.animateCamera(camera, position);
      }
    }, 100);

    // Mise à jour visuelle des boutons
    this.updateButtons();

    console.log(`📷 Vue changée: ${position.name} (terre fixe)`);
  }

  /**
   * Anime la transition de la caméra avec easing amélioré
   */
  animateCamera(camera, targetPosition) {
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    const duration = 2000; // 2 secondes pour transition smooth
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fonction d'easing (ease-in-out cubic)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Interpolation de la position
      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * eased;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * eased;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * eased;

      // La caméra regarde toujours le centre
      camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation terminée
        console.log(`✅ Vue ${targetPosition.name} atteinte`);
      }
    };

    animate();
  }

  /**
   * Met à jour l'apparence des boutons
   */
  updateButtons() {
    if (!this.buttons) return;

    this.buttons.forEach((button, index) => {
      if (index === this.currentSlide) {
        button.style.background = 'linear-gradient(135deg, #ff0000, #cc0000)';
        button.style.borderColor = '#ff0000';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 5px 15px rgba(255, 0, 0, 0.3)';
      } else {
        button.style.background = 'rgba(255, 255, 255, 0.08)';
        button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
      }
    });
  }

  /**
   * Navigation par raccourcis clavier
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          this.previousSlide();
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.nextSlide();
          e.preventDefault();
          break;
        case 'Home':
          this.setSlide(0);
          e.preventDefault();
          break;
      }
    });
  }

  /**
   * Retourne la vue actuelle
   */
  getCurrentSlide() {
    return this.currentSlide;
  }

  /**
   * Passe à la vue suivante
   */
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.cameraPositions.length;
    this.setSlide(nextIndex);
  }

  /**
   * Passe à la vue précédente
   */
  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.cameraPositions.length) % this.cameraPositions.length;
    this.setSlide(prevIndex);
  }

  /**
   * Va à un continent spécifique en bloquant la rotation
   */
  goToContinent(continentName) {
    const index = this.cameraPositions.findIndex(pos =>
      pos.name.toLowerCase().includes(continentName.toLowerCase())
    );

    if (index !== -1) {
      // Arrêter la rotation avant d'aller au continent
      if (this.webgl.globe) {
        this.webgl.globe.setAutoRotate(false);
      }

      this.setSlide(index);
      return true;
    }

    console.warn(`Continent "${continentName}" non trouvé`);
    return false;
  }

  /**
   * Retourne les circuits visibles dans la vue actuelle
   */
  getVisibleCircuits() {
    const currentView = this.cameraPositions[this.currentSlide];

    // Logique pour déterminer quels circuits sont visibles
    // basée sur la description de la vue
    const circuits = [];
    const description = currentView.description.toLowerCase();

    if (description.includes('monaco')) circuits.push('Monaco');
    if (description.includes('spa')) circuits.push('Spa-Francorchamps');
    if (description.includes('silverstone')) circuits.push('Silverstone');
    if (description.includes('miami')) circuits.push('Miami');
    if (description.includes('suzuka')) circuits.push('Suzuka');
    // ... etc

    return circuits;
  }

  /**
   * Nettoyage lors de la destruction
   */
  destroy() {
    const controlPanel = document.getElementById('view-controls');
    if (controlPanel) {
      controlPanel.remove();
    }
  }
}