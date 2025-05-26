import { Group, Vector2 } from 'three';
import { getWebGL } from '../index.js';

import EarthSphere from './Globe/EarthSphere.js';
import CircuitMarkers from './Globe/CircuitMarkers.js';
import StarfieldBackground from './Globe/StarfieldBackground.js';
import AtmosphereShader from './Globe/AtmosphereShader.js';
import CircuitsSidebar from './Globe/CircuitsSidebar.js';

export default class Globe {
  constructor() {
    this.webgl = getWebGL();
    this.scene = this.webgl.scene;

    this.group = new Group();

    this.earthSphere = null;
    this.circuitMarkers = null;
    this.starfieldBackground = null;
    this.atmosphere = null;
    this.sidebar = null; // Référence vers la sidebar pour synchronisation

    this.selectedCircuit = null;
    this.hoveredMarker = null;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.rotationSpeed = 0.002;

    this.init();
  }

  /**
   * Définit la référence vers la sidebar pour synchronisation
   */
  setSidebar(sidebar) {
    this.sidebar = sidebar;
    console.log('🔗 Sidebar synchronisée avec le globe');
  }

  async init() {
    console.log('🌍 Initialisation du Globe F1 2025...');

    try {
      await this.createStarfield();
      await this.createEarth();
      await this.createAtmosphere();
      await this.createCircuitMarkers();
      await this.createCircuitsSidebar();

      this.setSidebar(this.sidebar);

      this.attachMarkersToEarth();
      this.setupAtmosphereControls();
      this.setupInteractions();
      this.scene.add(this.group);

      console.log('✅ Globe F1 2025 initialisé avec synchronisation sidebar !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du globe:', error);
    }
  }

  createSidebarLinkLine() {
    // Crée ou récupère l'élément ligne
    let line = document.getElementById('sidebar-link-line');
    if (!line) {
      line = document.createElement('div');
      line.id = 'sidebar-link-line';
      line.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 2001;
      width: 2px;
      background: linear-gradient(180deg, #ff4444 60%, #fff 100%);
      border-radius: 2px;
      transition: opacity 0.2s;
      opacity: 0;
    `;
      document.body.appendChild(line);
    }
    return line;
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
  updateSidebarLinkLine(circuitIndex) {
    const line = this.createSidebarLinkLine();
    if (circuitIndex < 0 || !this.circuitMarkers?.markers[circuitIndex]) {
      line.style.opacity = 0;
      return;
    }

    // 1. Position du marqueur sur le globe (3D → 2D)
    const marker = this.circuitMarkers.markers[circuitIndex];
    const markerPos = marker.group.getWorldPosition(new THREE.Vector3());
    const camera = this.webgl.camera.active;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Projection 3D → 2D
    markerPos.project(camera);
    const markerScreen = {
      x: (markerPos.x * 0.5 + 0.5) * width,
      y: (-markerPos.y * 0.5 + 0.5) * height
    };

    // 2. Position de l'élément sidebar sélectionné
    const sidebar = document.getElementById('f1-circuits-sidebar');
    if (!sidebar) return;
    const items = sidebar.querySelectorAll('div');
    const item = items[circuitIndex + 1]; // +1 à cause du titre
    if (!item) return;
    const itemRect = item.getBoundingClientRect();
    const sidebarPoint = {
      x: itemRect.left,
      y: itemRect.top + itemRect.height / 2
    };

    // 3. Calcul de la ligne
    const dx = markerScreen.x - sidebarPoint.x;
    const dy = markerScreen.y - sidebarPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    line.style.left = `${sidebarPoint.x}px`;
    line.style.top = `${sidebarPoint.y}px`;
    line.style.width = `${length}px`;
    line.style.height = `2px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.opacity = 1;
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

  async createAtmosphere() {
    console.log('🌌 Création de l\'atmosphère...');

    this.atmosphere = new AtmosphereShader();
    const atmosphereMesh = this.atmosphere.getMesh();

    if (atmosphereMesh) {
      this.group.add(atmosphereMesh);
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

  async createCircuitsSidebar() {
    console.log('📋 Création de la sidebar des circuits...');
    if (!this.sidebar) {
      this.sidebar = new CircuitsSidebar({
        onSelect: (index) => {
          this.selectCircuitFromSidebar(index);
        },
        onHover: (index) => {
          if (this.circuitMarkers) {
            this.circuitMarkers.highlightMarkerByIndex(index);
          }
        }
      });
      console.log('✅ Sidebar des circuits créée');
    } else {
      console.warn('⚠️ Sidebar déjà initialisée, réutilisation de l\'instance existante');
    }
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

  setupAtmosphereControls() {
    if (!this.atmosphere) return;

    window.halo = {
      realistic: () => this.atmosphere.applyPreset('realistic'),
      soft: () => this.atmosphere.applyPreset('soft'),
      dramatic: () => this.atmosphere.applyPreset('dramatic'),
      subtle: () => this.atmosphere.applyPreset('subtle'),
      custom: () => this.atmosphere.applyPreset('custom'),

      setIntensity: (intensity) => this.atmosphere.setIntensity(intensity),
      setSmoothness: (smoothness) => this.atmosphere.setSmoothness(smoothness),
      hide: () => this.atmosphere.setVisible(false),
      show: () => this.atmosphere.setVisible(true)
    };

    console.log(`🌌 CONTRÔLES HALO disponibles`);
  }

  setupInteractions() {
    console.log('🖱️ Configuration des interactions avec synchronisation...');
    const canvas = this.webgl.canvas;

    canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
    canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    canvas.addEventListener('mouseup', () => this.onMouseUp());
    canvas.addEventListener('click', (event) => this.onMouseClick(event));

    canvas.style.cursor = 'grab';
    console.log('✅ Interactions configurées avec synchronisation sidebar');
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

          // Synchronisation avec sidebar
          if (this.sidebar && this.sidebar.onMarkerSelect) {
            this.sidebar.onMarkerSelect(-1);
          }

          console.log('🔄 Sélection annulée');
        }
      }
    }
  }

  /**
   * Gestion du hover avec synchronisation sidebar
   */
  handleMarkerHover(event) {
    if (!this.circuitMarkers) return;

    const mouse = this.getMousePosition(event);
    const intersectedMarker = this.circuitMarkers.getMarkerFromMouse(
      mouse,
      this.webgl.camera.active
    );

    // Highlight du marker
    this.circuitMarkers.highlightMarker(intersectedMarker);

    // Synchronisation avec la sidebar
    if (intersectedMarker) {
      const markerIndex = intersectedMarker.userData.index;

      // Vérifier si c'est un nouveau hover
      if (this.hoveredMarker !== intersectedMarker) {
        this.hoveredMarker = intersectedMarker;

        // Synchroniser avec la sidebar
        if (this.sidebar && this.sidebar.onMarkerHover) {
          this.sidebar.onMarkerHover(markerIndex);
        }
      }

      this.webgl.canvas.style.cursor = 'pointer';
    } else {
      // Plus de hover
      if (this.hoveredMarker) {
        this.hoveredMarker = null;

        // Synchroniser avec la sidebar
        if (this.sidebar && this.sidebar.onMarkerHover) {
          this.sidebar.onMarkerHover(-1);
        }
      }

      if (!this.isDragging) {
        this.webgl.canvas.style.cursor = 'grab';
      }
    }
  }

  getMousePosition(event) {
    const rect = this.webgl.canvas.getBoundingClientRect();
    return new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  /**
   * Sélection de circuit avec synchronisation sidebar
   */
  selectCircuit(markerGroup) {
    if (!markerGroup || !this.circuitMarkers) return;

    const circuit = markerGroup.userData.circuit;
    const markerIndex = markerGroup.userData.index;
    this.selectedCircuit = circuit;

    this.circuitMarkers.selectMarker(markerGroup);
    this.displayCircuitInfo(circuit);

    // Synchronisation avec la sidebar
    if (this.sidebar && this.sidebar.onMarkerSelect) {
      this.sidebar.onMarkerSelect(markerIndex);
    }

    console.log(`🏁 Circuit sélectionné: ${circuit.name} (sync sidebar)`);
  }

  /**
   * Méthode publique pour sélection depuis la sidebar
   */
  selectCircuitFromSidebar(circuitIndex) {
    if (this.circuitMarkers && this.circuitMarkers.markers[circuitIndex]) {
      const marker = this.circuitMarkers.markers[circuitIndex];
      this.selectCircuit(marker.group);

      // Centrer la vue sur le circuit sélectionné
      this.focusOnCircuit(circuitIndex);
      this.updateSidebarLinkLine(circuitIndex);
    }
  }

  /**
   * Focus sur un circuit spécifique
   */
  focusOnCircuit(circuitIndex) {
    if (!this.circuitMarkers || !this.circuitMarkers.markers[circuitIndex]) return;

    const marker = this.circuitMarkers.markers[circuitIndex];
    const circuit = marker.circuit;

    // Arrêter la rotation
    this.setAutoRotate(false);

    // Calculer la position optimale de la caméra pour ce circuit
    const lat = circuit.lat * Math.PI / 180;
    const lng = circuit.lng * Math.PI / 180;

    // Position de caméra optimale pour voir le circuit
    const distance = 2.5;
    const cameraX = distance * Math.cos(lat) * Math.cos(lng);
    const cameraY = distance * Math.sin(lat);
    const cameraZ = distance * Math.cos(lat) * Math.sin(lng);

    // Animation vers la position
    if (this.webgl.camera && this.webgl.camera.main) {
      this.animateCameraToPosition(this.webgl.camera.main, {
        x: cameraX,
        y: cameraY,
        z: cameraZ
      });
    }

    console.log(`🎯 Focus sur ${circuit.name}`);
  }

  /**
   * Animation de caméra
   */
  animateCameraToPosition(camera, targetPosition) {
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * eased;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * eased;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * eased;

      camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log(`✅ Animation caméra terminée`);
      }
    };

    animate();
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
        <button onclick="window.open('https://www.formula1.com/en/racing/2025.html', '_blank')" 
                style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.3); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease; flex: 1;">
          ℹ️ F1.com
        </button>
      </div>
    `;

    // Styles pour animations
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

    // Mise à jour de l'atmosphère
    if (this.atmosphere && this.earthSphere) {
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

  // Méthodes publiques pour contrôle externe

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

      // Synchronisation avec sidebar
      if (this.sidebar && this.sidebar.onMarkerSelect) {
        this.sidebar.onMarkerSelect(-1);
      }
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

    if (this.atmosphere) {
      this.atmosphere.dispose();
    }

    if (this.scene && this.group) {
      this.scene.remove(this.group);
    }

    this.selectedCircuit = null;
    this.hoveredMarker = null;
    this.sidebar = null;

    console.log('✅ Globe nettoyé complètement (avec synchronisation sidebar)');
  }
}