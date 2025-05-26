// components/Globe.js - Avec effet atmosphère intégré
import { Group, Vector2 } from 'three';
import { getWebGL } from '../index.js';

import EarthSphere from './Globe/EarthSphere.js';
import CircuitMarkers from './Globe/CircuitMarkers.js';
import StarfieldBackground from './Globe/StarfieldBackground.js';
import AtmosphereShader from './Globe/AtmosphereShader.js'; // NOUVEAU

export default class Globe {
  constructor() {
    this.webgl = getWebGL();
    this.scene = this.webgl.scene;

    this.group = new Group();

    this.earthSphere = null;
    this.circuitMarkers = null;
    this.starfieldBackground = null;
    this.atmosphere = null; // NOUVEAU

    this.selectedCircuit = null;
    this.hoveredMarker = null;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.rotationSpeed = 0.002;

    this.init();
  }

  async init() {
    console.log('🌍 Initialisation du Globe F1 2025...');

    try {
      await this.createStarfield();
      await this.createEarth();
      await this.createAtmosphere();        // NOUVEAU
      await this.createCircuitMarkers();

      this.attachMarkersToEarth();
      this.setupAtmosphereControls();      // NOUVEAU
      this.setupInteractions();
      this.scene.add(this.group);

      console.log('✅ Globe F1 2025 initialisé avec atmosphère !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du globe:', error);
    }
  }

  async createStarfield() {
    console.log('✨ Création du champ d\'étoiles...');
    this.starfieldBackground = new StarfieldBackground();
    const starfieldMesh = this.starfieldBackground.getMesh();

    if (starfieldMesh) {
      this.scene.add(starfieldMesh);
      console.log('✅ Champ d\'étoiles ajouté');
    }
  }

  async createEarth() {
    console.log('🌍 Création de la Terre...');
    this.earthSphere = new EarthSphere();
    await this.earthSphere.ready;

    const earthGroup = this.earthSphere.getCompleteGroup();
    if (earthGroup) {
      this.group.add(earthGroup);
      console.log('✅ Terre ajoutée au globe');
    } else {
      console.warn('⚠️ earthGroup est null après init');
    }
  }

  /**
   * NOUVEAU : Crée l'effet d'atmosphère
   */
  async createAtmosphere() {
    console.log('🌌 Création de l\'atmosphère...');

    this.atmosphere = new AtmosphereShader();
    const atmosphereMesh = this.atmosphere.getMesh();

    if (atmosphereMesh) {
      // Ajouter l'atmosphère au groupe principal
      this.group.add(atmosphereMesh);

      // Appliquer le preset "realistic" par défaut
      this.atmosphere.applyPreset('realistic');

      console.log('✅ Atmosphère ajoutée avec succès');
    } else {
      console.warn('⚠️ atmosphereMesh est null');
    }
  }

  async createCircuitMarkers() {
    console.log('🏁 Création des marqueurs de circuits...');
    this.circuitMarkers = new CircuitMarkers();
    console.log(`✅ Marqueurs créés, en attente d'attachement à la terre`);
  }

  attachMarkersToEarth() {
    if (!this.earthSphere || !this.circuitMarkers) {
      console.warn('⚠️ Impossible d\'attacher les marqueurs : composants manquants');
      return;
    }

    const markerGroups = this.circuitMarkers.getMarkerGroups();
    this.earthSphere.addMarkersToEarth(markerGroups);

    const earthMesh = this.earthSphere.getMesh();
    if (earthMesh) {
      this.circuitMarkers.setEarthMesh(earthMesh);
    }

    console.log('🔗 Marqueurs attachés et synchronisés avec la terre !');
  }

  /**
   * NOUVEAU : Configure les contrôles pour le halo simple
   */
  setupAtmosphereControls() {
    if (!this.atmosphere) return;

    // Exposer les contrôles halo sur window
    window.halo = {
      // Presets avec sync jour/nuit
      realistic: () => this.atmosphere.applyPreset('realistic'),   // Réaliste
      soft: () => this.atmosphere.applyPreset('soft'),             // Doux
      dramatic: () => this.atmosphere.applyPreset('dramatic'),     // Dramatique
      subtle: () => this.atmosphere.applyPreset('subtle'),         // Subtil
      custom: () => this.atmosphere.applyPreset('custom'),         // Ton style

      // Contrôles
      setIntensity: (intensity) => this.atmosphere.setIntensity(intensity),
      setSmoothness: (smoothness) => this.atmosphere.setSmoothness(smoothness),
      hide: () => this.atmosphere.setVisible(false),
      show: () => this.atmosphere.setVisible(true)
    };

    console.log(`
🌌 CONTRÔLES HALO JOUR/NUIT disponibles :

halo.realistic()      // Halo réaliste jour/nuit
halo.soft()           // Halo doux
halo.dramatic()       // Halo dramatique  
halo.subtle()         // Halo très subtil
halo.custom()         // Ton style actuel

halo.setIntensity(0.6)    // Ajuster intensité
halo.setSmoothness(2.0)   // Ajuster douceur
halo.hide() / halo.show()

✨ Le halo suit automatiquement le cycle jour/nuit de la terre !
    `);
  }

  setupInteractions() {
    console.log('🖱️ Configuration des interactions...');
    const canvas = this.webgl.canvas;

    canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
    canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    canvas.addEventListener('mouseup', () => this.onMouseUp());
    canvas.addEventListener('click', (event) => this.onMouseClick(event));

    canvas.style.cursor = 'grab';
    console.log('✅ Interactions configurées');
  }

  onMouseDown(event) {
    this.isDragging = true;
    this.autoRotate = false;
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    this.webgl.canvas.style.cursor = 'grabbing';
  }

  onMouseMove(event) {
    if (this.isDragging) {
      const deltaMove = {
        x: event.clientX - this.previousMousePosition.x,
        y: event.clientY - this.previousMousePosition.y
      };

      this.group.rotation.y += deltaMove.x * 0.005;
      this.group.rotation.x += deltaMove.y * 0.005;
      this.group.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.group.rotation.x));

      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    } else {
      this.handleMarkerHover(event);
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.webgl.canvas.style.cursor = 'grab';

    setTimeout(() => {
      this.autoRotate = true;
    }, 2000);
  }

  onMouseClick(event) {
    if (!this.isDragging && this.circuitMarkers) {
      const mouse = this.getMousePosition(event);
      const intersectedMarker = this.circuitMarkers.getMarkerFromMouse(
        mouse,
        this.webgl.camera.active
      );

      if (intersectedMarker) {
        this.selectCircuit(intersectedMarker);
        console.log('🎯 Marqueur cliqué avec succès !');
      } else {
        if (this.selectedCircuit) {
          this.circuitMarkers.selectMarker(null);
          this.selectedCircuit = null;
          this.hideCircuitInfo();
          console.log('🔄 Sélection annulée');
        }
      }
    }
  }

  handleMarkerHover(event) {
    if (!this.circuitMarkers) return;

    const mouse = this.getMousePosition(event);
    const intersectedMarker = this.circuitMarkers.getMarkerFromMouse(
      mouse,
      this.webgl.camera.active
    );

    this.circuitMarkers.highlightMarker(intersectedMarker);

    if (intersectedMarker) {
      this.webgl.canvas.style.cursor = 'pointer';
    } else if (!this.isDragging) {
      this.webgl.canvas.style.cursor = 'grab';
    }
  }

  getMousePosition(event) {
    const rect = this.webgl.canvas.getBoundingClientRect();
    return new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  selectCircuit(markerGroup) {
    if (!markerGroup || !this.circuitMarkers) return;

    const circuit = markerGroup.userData.circuit;
    this.selectedCircuit = circuit;

    this.circuitMarkers.selectMarker(markerGroup);
    this.displayCircuitInfo(circuit);

    console.log(`🏁 Circuit sélectionné: ${circuit.name}`);
  }

  displayCircuitInfo(circuit) {
    this.hideCircuitInfo();

    const infoPanel = document.createElement('div');
    infoPanel.id = 'circuit-info';
    infoPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.92);
      color: white;
      padding: 25px;
      border-radius: 15px;
      border: 2px solid #ff0000;
      max-width: 380px;
      z-index: 2000;
      font-family: 'Arial', sans-serif;
      backdrop-filter: blur(15px);
      animation: slideInFromLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;

    infoPanel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #ff4444; font-size: 20px;">
          🏁 ${circuit.name}
        </h3>
      </div>
      
      <div style="display: grid; gap: 12px; margin: 15px 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #ff6666;">📍</span>
          <span style="color: #ccc; font-weight: 500;">${circuit.location}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #ff6666;">📅</span>
          <span style="color: #ccc; font-weight: 500;">${circuit.date}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #ff6666;">🏁</span>
          <span style="color: #ccc; font-weight: 500;">${circuit.country}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <span style="color: #888;">📐</span>
          <span style="color: #888; font-size: 12px;">
            ${circuit.lat.toFixed(4)}°, ${circuit.lng.toFixed(4)}°
          </span>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button onclick="document.getElementById('circuit-info').remove()" 
                style="background: #ff0000; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease; flex: 1;">
          ✕ Fermer
        </button>
        <button onclick="console.log('🔍 Plus d\'infos sur ${circuit.name}')" 
                style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.3); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease; flex: 1;">
          ℹ️ Détails
        </button>
      </div>
    `;

    if (!document.getElementById('circuit-info-styles')) {
      const style = document.createElement('style');
      style.id = 'circuit-info-styles';
      style.textContent = `
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        #circuit-info button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        #circuit-info button:first-child:hover {
          background: #cc0000 !important;
        }
        
        #circuit-info button:last-child:hover {
          background: rgba(255, 255, 255, 0.2) !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(infoPanel);
  }

  hideCircuitInfo() {
    const infoPanel = document.getElementById('circuit-info');
    if (infoPanel) {
      infoPanel.style.animation = 'slideOutToLeft 0.3s ease-in-out';
      setTimeout(() => infoPanel.remove(), 300);
    }
  }

  /**
   * MISE À JOUR avec synchronisation atmosphère
   */
  update() {
    const time = Date.now();

    // Rotation automatique
    if (this.autoRotate && !this.isDragging) {
      this.group.rotation.y += this.rotationSpeed;
    }

    this.group.updateMatrixWorld();

    // Mise à jour de la terre
    if (this.earthSphere) {
      this.earthSphere.update(time);
    }

    // NOUVEAU : Mise à jour de l'atmosphère avec sync soleil
    if (this.atmosphere && this.earthSphere) {
      // Récupérer la direction du soleil de la terre pour synchronisation
      const earthMesh = this.earthSphere.getMesh();
      if (earthMesh && earthMesh.material.uniforms && earthMesh.material.uniforms.sunDirection) {
        const sunDirection = earthMesh.material.uniforms.sunDirection.value;
        this.atmosphere.setSunDirection(sunDirection);
      }

      this.atmosphere.update(time);
    }

    // Mise à jour des marqueurs
    if (this.circuitMarkers && this.webgl.camera && this.earthSphere) {
      const earthGroup = this.earthSphere.getCompleteGroup();
      this.circuitMarkers.update(time, this.webgl.camera.active, earthGroup);
    }

    // Mise à jour du champ d'étoiles
    if (this.starfieldBackground) {
      this.starfieldBackground.update(time);
    }
  }

  getSelectedCircuit() {
    return this.selectedCircuit;
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
    console.log(`🔄 Rotation automatique: ${enabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`);
  }

  setRotationSpeed(speed) {
    this.rotationSpeed = speed;
    console.log(`⚡ Vitesse de rotation: ${speed}`);
  }

  resetPosition() {
    this.group.rotation.set(0, 0, 0);
    this.autoRotate = true;

    if (this.selectedCircuit) {
      this.circuitMarkers.selectMarker(null);
      this.selectedCircuit = null;
      this.hideCircuitInfo();
    }

    console.log('🏠 Position du globe réinitialisée');
  }

  forceOcclusionUpdate() {
    if (this.circuitMarkers && this.webgl.camera && this.earthSphere) {
      const earthGroup = this.earthSphere.getCompleteGroup();
      earthGroup.updateMatrixWorld();
      this.circuitMarkers.updateMarkersVisibility(this.webgl.camera.active, earthGroup);
      console.log('🔄 Occlusion mise à jour manuellement');
    }
  }

  getMarkersStats() {
    if (!this.circuitMarkers) return null;

    const stats = {
      total: this.circuitMarkers.markers.length,
      visible: 0,
      hidden: 0,
      selected: this.selectedCircuit ? 1 : 0
    };

    this.circuitMarkers.markers.forEach(marker => {
      if (marker.group.userData.isVisible) {
        stats.visible++;
      } else {
        stats.hidden++;
      }
    });

    return stats;
  }

  destroy() {
    console.log('🧹 Nettoyage du globe...');

    const elementsToRemove = ['circuit-info', 'circuit-info-styles'];
    elementsToRemove.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });

    if (this.earthSphere) {
      this.earthSphere.dispose();
    }

    if (this.circuitMarkers) {
      this.circuitMarkers.dispose();
    }

    if (this.starfieldBackground) {
      this.starfieldBackground.dispose();
    }

    // NOUVEAU : Nettoyage atmosphère
    if (this.atmosphere) {
      this.atmosphere.dispose();
    }

    if (this.scene && this.group) {
      this.scene.remove(this.group);
    }

    this.selectedCircuit = null;
    this.hoveredMarker = null;

    console.log('✅ Globe nettoyé complètement (avec atmosphère)');
  }
}