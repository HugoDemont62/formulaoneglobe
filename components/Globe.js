// components/Globe.js - Globe principal refactorisé
import { Group, Vector2 } from 'three';
import { getWebGL } from '../index.js';

// Import des composants modulaires
import EarthSphere from './Globe/EarthSphere.js';
import CircuitMarkers from './Globe/CircuitMarkers.js';
import StarfieldBackground from './Globe/StarfieldBackground.js';

/**
 * Classe principale du Globe F1 2025
 * Orchestre tous les composants : terre, marqueurs, étoiles, interactions
 */
export default class Globe {
  constructor() {
    this.webgl = getWebGL();
    this.scene = this.webgl.scene;

    // Groupe principal contenant tous les éléments du globe
    this.group = new Group();

    // Composants du globe
    this.earthSphere = null;
    this.circuitMarkers = null;
    this.starfieldBackground = null;

    // État de l'interaction
    this.selectedCircuit = null;
    this.hoveredMarker = null;

    // Variables pour la rotation
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.rotationSpeed = 0.002;

    // Initialisation
    this.init();
  }

  /**
   * Initialise tous les composants du globe
   */
  async init() {
    console.log('🌍 Initialisation du Globe F1 2025...');

    try {
      // 1. Création du champ d'étoiles (arrière-plan)
      await this.createStarfield();

      // 2. Création de la sphère terrestre
      await this.createEarth();

      // 3. Création des marqueurs de circuits
      await this.createCircuitMarkers();

      // 4. Configuration des interactions
      this.setupInteractions();

      // 5. Ajout du groupe à la scène
      this.scene.add(this.group);

      console.log('✅ Globe F1 2025 initialisé avec succès !');

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du globe:', error);
    }
  }

  /**
   * Crée le champ d'étoiles en arrière-plan
   */
  async createStarfield() {
    console.log('✨ Création du champ d\'étoiles...');

    this.starfieldBackground = new StarfieldBackground();
    const starfieldMesh = this.starfieldBackground.getMesh();

    if (starfieldMesh) {
      this.scene.add(starfieldMesh); // Ajout direct à la scène, pas au groupe
      console.log('✅ Champ d\'étoiles ajouté');
    }
  }

  async createEarth() {
    console.log('🌍 Création de la Terre...');

    this.earthSphere = new EarthSphere();

    // ⏳ Attend que l'init se termine
    await this.earthSphere.ready;

    const earthMesh = this.earthSphere.getMesh();
    if (earthMesh) {
      this.group.add(earthMesh);
      console.log('✅ Terre ajoutée au globe');
    } else {
      console.warn('⚠️ earthMesh est null après init');
    }
  }


  /**
   * Crée les marqueurs des circuits F1
   */
  async createCircuitMarkers() {
    console.log('🏁 Création des marqueurs de circuits...');

    this.circuitMarkers = new CircuitMarkers();
    const markerGroups = this.circuitMarkers.getMarkerGroups();

    // Ajout de tous les marqueurs au groupe principal
    markerGroups.forEach(markerGroup => {
      this.group.add(markerGroup);
    });

    console.log(`✅ ${markerGroups.length} marqueurs ajoutés au globe`);
  }

  /**
   * Configure les interactions avec la souris
   */
  setupInteractions() {
    console.log('🖱️ Configuration des interactions...');

    const canvas = this.webgl.canvas;

    // Gestion du drag pour faire tourner le globe
    canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
    canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    canvas.addEventListener('mouseup', () => this.onMouseUp());
    canvas.addEventListener('click', (event) => this.onMouseClick(event));

    // Style du curseur
    canvas.style.cursor = 'grab';

    console.log('✅ Interactions configurées');
  }

  /**
   * Gestion du clic de souris (début du drag)
   */
  onMouseDown(event) {
    this.isDragging = true;
    this.autoRotate = false;
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    this.webgl.canvas.style.cursor = 'grabbing';
  }

  /**
   * Gestion du mouvement de la souris
   */
  onMouseMove(event) {
    if (this.isDragging) {
      // Calcul de la différence de mouvement
      const deltaMove = {
        x: event.clientX - this.previousMousePosition.x,
        y: event.clientY - this.previousMousePosition.y
      };

      // Application de la rotation au groupe principal
      this.group.rotation.y += deltaMove.x * 0.005;
      this.group.rotation.x += deltaMove.y * 0.005;

      // Limitation de la rotation verticale
      this.group.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.group.rotation.x));

      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    } else {
      // Gestion du survol des marqueurs
      this.handleMarkerHover(event);
    }
  }

  /**
   * Gestion du relâchement de la souris
   */
  onMouseUp() {
    this.isDragging = false;
    this.webgl.canvas.style.cursor = 'grab';

    // Reprise de la rotation automatique après 2 secondes
    setTimeout(() => {
      this.autoRotate = true;
    }, 2000);
  }

  /**
   * Gestion du clic pour sélectionner un circuit
   */
  onMouseClick(event) {
    if (!this.isDragging && this.circuitMarkers) {
      const mouse = this.getMousePosition(event);
      const intersectedMarker = this.circuitMarkers.getMarkerFromMouse(
        mouse,
        this.webgl.camera.active
      );

      if (intersectedMarker) {
        this.selectCircuit(intersectedMarker);
      }
    }
  }

  /**
   * Gestion du survol des marqueurs
   */
  handleMarkerHover(event) {
    if (!this.circuitMarkers) return;

    const mouse = this.getMousePosition(event);
    const intersectedMarker = this.circuitMarkers.getMarkerFromMouse(
      mouse,
      this.webgl.camera.active
    );

    // Mise à jour du survol
    this.circuitMarkers.highlightMarker(intersectedMarker);

    // Changement du curseur
    if (intersectedMarker) {
      this.webgl.canvas.style.cursor = 'pointer';
    } else if (!this.isDragging) {
      this.webgl.canvas.style.cursor = 'grab';
    }
  }

  /**
   * Convertit la position de la souris en coordonnées normalisées
   */
  getMousePosition(event) {
    const rect = this.webgl.canvas.getBoundingClientRect();
    return new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  /**
   * Sélectionne un circuit et affiche ses informations
   */
  selectCircuit(markerGroup) {
    if (!markerGroup || !this.circuitMarkers) return;

    const circuit = markerGroup.userData.circuit;
    this.selectedCircuit = circuit;

    // Mise à jour visuelle de la sélection
    this.circuitMarkers.selectMarker(markerGroup);

    // Affichage des informations du circuit
    this.displayCircuitInfo(circuit);

    console.log(`🏁 Circuit sélectionné: ${circuit.name}`);
  }

  /**
   * Affiche les informations d'un circuit
   */
  displayCircuitInfo(circuit) {
    // Supprimer l'ancien panneau s'il existe
    let infoPanel = document.getElementById('circuit-info');
    if (infoPanel) {
      infoPanel.remove();
    }

    // Créer le nouveau panneau d'informations
    infoPanel = document.createElement('div');
    infoPanel.id = 'circuit-info';
    infoPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 15px;
      border: 2px solid #ff0000;
      max-width: 350px;
      z-index: 2000;
      font-family: 'Arial', sans-serif;
      backdrop-filter: blur(10px);
      animation: slideIn 0.3s ease-out;
    `;

    infoPanel.innerHTML = `
      <h3 style="margin-top: 0; color: #ff4444; font-size: 18px;">
        🏁 ${circuit.name}
      </h3>
      <p style="margin: 10px 0; color: #ccc;">
        <strong>📍 Lieu:</strong> ${circuit.location}
      </p>
      <p style="margin: 10px 0; color: #ccc;">
        <strong>📅 Date GP 2025:</strong> ${circuit.date}
      </p>
      <p style="margin: 10px 0; color: #ccc;">
        <strong>🏁 Pays:</strong> ${circuit.country}
      </p>
      <p style="margin: 10px 0; color: #888; font-size: 12px;">
        Coordonnées: ${circuit.lat.toFixed(4)}°, ${circuit.lng.toFixed(4)}°
      </p>
      <button onclick="document.getElementById('circuit-info').remove()" 
              style="background: #ff0000; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px; float: right;">
        Fermer
      </button>
    `;

    document.body.appendChild(infoPanel);
  }

  /**
   * Met à jour l'animation du globe
   */
  update() {
    const time = Date.now();

    // Rotation automatique du globe
    if (this.autoRotate && !this.isDragging) {
      this.group.rotation.y += this.rotationSpeed;
    }

    // Mise à jour des composants
    if (this.earthSphere) {
      this.earthSphere.update(time);
    }

    if (this.circuitMarkers) {
      this.circuitMarkers.update(time);
    }

    if (this.starfieldBackground) {
      this.starfieldBackground.update(time);
    }
  }

  /**
   * Retourne le circuit actuellement sélectionné
   */
  getSelectedCircuit() {
    return this.selectedCircuit;
  }

  /**
   * Active/désactive la rotation automatique
   */
  setAutoRotate(enabled) {
    this.autoRotate = enabled;
  }

  /**
   * Change la vitesse de rotation
   */
  setRotationSpeed(speed) {
    this.rotationSpeed = speed;
  }

  /**
   * Réinitialise la position du globe
   */
  resetPosition() {
    this.group.rotation.set(0, 0, 0);
    this.autoRotate = true;
  }

  /**
   * Nettoie les ressources lors de la destruction
   */
  destroy() {
    console.log('🧹 Nettoyage du globe...');

    // Suppression des éléments DOM
    const elementsToRemove = ['circuit-info'];
    elementsToRemove.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });

    // Nettoyage des composants
    if (this.earthSphere) {
      this.earthSphere.dispose();
    }

    if (this.circuitMarkers) {
      this.circuitMarkers.dispose();
    }

    if (this.starfieldBackground) {
      this.starfieldBackground.dispose();
    }

    // Suppression du groupe de la scène
    if (this.scene && this.group) {
      this.scene.remove(this.group);
    }

    console.log('✅ Globe nettoyé');
  }
}