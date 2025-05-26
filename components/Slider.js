// components/Slider.js - Gestionnaire de vues simplifié
import { getWebGL } from '../index.js';

/**
 * Classe pour gérer les différentes vues du globe
 * Simplifié pour se concentrer sur l'essentiel
 */
export default class Slider {
  constructor() {
    this.webgl = getWebGL();
    this.currentSlide = 0;

    // Positions de caméra pour différentes vues
    this.cameraPositions = [
      { x: 0, y: 0, z: 5, name: "Vue Globale" },
      { x: 3, y: 2, z: 4, name: "Vue Europe" },
      { x: -4, y: 1, z: 3, name: "Vue Amériques" },
      { x: 2, y: 0, z: -4, name: "Vue Asie" },
    ];

    this.createControls();
  }

  /**
   * Crée les contrôles de vue
   */
  createControls() {
    // Création du panneau de contrôle
    const controlPanel = document.createElement('div');
    controlPanel.id = 'view-controls';
    controlPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;

    // Titre
    const title = document.createElement('h4');
    title.textContent = '🎮 Vues du Globe';
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #ff4444;
      font-size: 14px;
    `;
    controlPanel.appendChild(title);

    // Boutons pour chaque vue
    this.cameraPositions.forEach((position, index) => {
      const button = document.createElement('button');
      button.textContent = position.name;
      button.style.cssText = `
        display: block;
        width: 100%;
        margin: 5px 0;
        padding: 8px 12px;
        background: ${index === 0 ? '#ff0000' : 'rgba(255, 255, 255, 0.1)'};
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.3s ease;
      `;

      button.addEventListener('click', () => this.setSlide(index));
      button.addEventListener('mouseenter', () => {
        if (index !== this.currentSlide) {
          button.style.background = 'rgba(255, 255, 255, 0.2)';
        }
      });
      button.addEventListener('mouseleave', () => {
        if (index !== this.currentSlide) {
          button.style.background = 'rgba(255, 255, 255, 0.1)';
        }
      });

      controlPanel.appendChild(button);
    });

    // Contrôles supplémentaires
    const separator = document.createElement('hr');
    separator.style.cssText = `
      margin: 15px 0;
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    `;
    controlPanel.appendChild(separator);

    // Bouton rotation automatique
    const autoRotateButton = document.createElement('button');
    autoRotateButton.textContent = '🔄 Rotation Auto';
    autoRotateButton.style.cssText = `
      display: block;
      width: 100%;
      margin: 5px 0;
      padding: 8px 12px;
      background: '#00aa00';
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    `;

    let autoRotateEnabled = true;
    autoRotateButton.addEventListener('click', () => {
      autoRotateEnabled = !autoRotateEnabled;
      if (this.webgl.globe) {
        this.webgl.globe.setAutoRotate(autoRotateEnabled);
      }
      autoRotateButton.style.background = autoRotateEnabled ? '#00aa00' : '#aa0000';
      autoRotateButton.textContent = autoRotateEnabled ? '🔄 Rotation Auto' : '⏸️ Rotation Off';
    });

    controlPanel.appendChild(autoRotateButton);

    // Bouton reset
    const resetButton = document.createElement('button');
    resetButton.textContent = '🏠 Reset Vue';
    resetButton.style.cssText = `
      display: block;
      width: 100%;
      margin: 5px 0;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    `;

    resetButton.addEventListener('click', () => {
      this.setSlide(0);
      if (this.webgl.globe) {
        this.webgl.globe.resetPosition();
      }
    });

    controlPanel.appendChild(resetButton);

    document.body.appendChild(controlPanel);

    // Sauvegarde des boutons pour la mise à jour
    this.buttons = controlPanel.querySelectorAll('button');
  }

  /**
   * Change la vue de la caméra
   * @param {number} index - Index de la vue
   */
  setSlide(index) {
    if (index < 0 || index >= this.cameraPositions.length) return;

    this.currentSlide = index;
    const position = this.cameraPositions[index];

    // Mise à jour de la position de la caméra
    if (this.webgl.camera && this.webgl.camera.main) {
      const camera = this.webgl.camera.main;

      // Animation douce vers la nouvelle position
      this.animateCamera(camera, position);
    }

    // Mise à jour visuelle des boutons
    this.updateButtons();

    console.log(`📷 Vue changée: ${position.name}`);
  }

  /**
   * Anime la transition de la caméra
   * @param {Camera} camera - Caméra Three.js
   * @param {Object} targetPosition - Position cible
   */
  animateCamera(camera, targetPosition) {
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    const duration = 1500; // 1.5 secondes
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fonction d'easing (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolation de la position
      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * eased;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * eased;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * eased;

      // La caméra regarde toujours le centre
      camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Met à jour l'apparence des boutons
   */
  updateButtons() {
    if (!this.buttons) return;

    // Les 5 premiers boutons sont les vues de caméra
    for (let i = 0; i < Math.min(5, this.buttons.length); i++) {
      const button = this.buttons[i];
      if (i === this.currentSlide) {
        button.style.background = '#ff0000';
      } else {
        button.style.background = 'rgba(255, 255, 255, 0.1)';
      }
    }
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
   * Nettoyage lors de la destruction
   */
  destroy() {
    const controlPanel = document.getElementById('view-controls');
    if (controlPanel) {
      controlPanel.remove();
    }
  }
}