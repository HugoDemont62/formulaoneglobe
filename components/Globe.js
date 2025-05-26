// components/Globe.js
import {
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  Group,
  Vector3,
  TextureLoader,
  BackSide,
  BoxGeometry,
  MeshBasicMaterial,
  DoubleSide,
  AdditiveBlending,
  Color,
  PlaneGeometry, ShaderMaterial,
} from 'three';
import { getWebGL } from '../index.js';

// Données des circuits de Formule 1 2025 avec coordonnées géographiques
const f1Circuits = [
  {
    name: "Bahrain International Circuit",
    location: "Sakhir, Bahrain",
    date: "2 Mars 2025",
    lat: 26.0325,
    lng: 50.5106,
    country: "Bahrain",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop"
  },
  {
    name: "Jeddah Corniche Circuit",
    location: "Jeddah, Arabie Saoudite",
    date: "9 Mars 2025",
    lat: 21.6319,
    lng: 39.1044,
    country: "Arabie Saoudite",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop"
  },
  {
    name: "Albert Park Circuit",
    location: "Melbourne, Australie",
    date: "16 Mars 2025",
    lat: -37.8497,
    lng: 144.9680,
    country: "Australie",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
  },
  {
    name: "Suzuka International Racing Course",
    location: "Suzuka, Japon",
    date: "6 Avril 2025",
    lat: 34.8431,
    lng: 136.5417,
    country: "Japon",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=250&fit=crop"
  },
  {
    name: "Shanghai International Circuit",
    location: "Shanghai, Chine",
    date: "13 Avril 2025",
    lat: 31.3389,
    lng: 121.2197,
    country: "Chine",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=250&fit=crop"
  },
  {
    name: "Miami International Autodrome",
    location: "Miami, États-Unis",
    date: "4 Mai 2025",
    lat: 25.9581,
    lng: -80.2389,
    country: "États-Unis",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
  },
  {
    name: "Autodromo Enzo e Dino Ferrari",
    location: "Imola, Italie",
    date: "18 Mai 2025",
    lat: 44.3439,
    lng: 11.7167,
    country: "Italie",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop"
  },
  {
    name: "Circuit de Monaco",
    location: "Monaco",
    date: "25 Mai 2025",
    lat: 43.7347,
    lng: 7.4206,
    country: "Monaco",
    image: "https://images.unsplash.com/photo-1563133340-d8b03ca2d1ff?w=400&h=250&fit=crop"
  },
  {
    name: "Circuit Gilles Villeneuve",
    location: "Montréal, Canada",
    date: "15 Juin 2025",
    lat: 45.5042,
    lng: -73.5228,
    country: "Canada",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=250&fit=crop"
  },
  {
    name: "Circuit de Barcelona-Catalunya",
    location: "Barcelone, Espagne",
    date: "29 Juin 2025",
    lat: 41.5700,
    lng: 2.2611,
    country: "Espagne",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73aeb?w=400&h=250&fit=crop"
  },
  {
    name: "Red Bull Ring",
    location: "Spielberg, Autriche",
    date: "6 Juillet 2025",
    lat: 47.2197,
    lng: 14.7647,
    country: "Autriche",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
  },
  {
    name: "Silverstone Circuit",
    location: "Silverstone, Royaume-Uni",
    date: "13 Juillet 2025",
    lat: 52.0786,
    lng: -1.0169,
    country: "Royaume-Uni",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop"
  }
];

export default class Globe {
  constructor() {
    this.webgl = getWebGL();
    this.scene = this.webgl.scene;
    this.group = new Group();
    this.textureLoader = new TextureLoader();

    this.selectedCircuit = null;
    this.markers = [];
    this.hoveredMarker = null;

    // Variables pour le drag
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };
    this.autoRotate = true;
    this.rotationSpeed = 0.002; // Un peu plus rapide pour voir la belle texture
    this.starfieldRotationSpeed = 0.0001; // Rotation très lente du fond d'étoiles

    this.createStarfield();
    this.createGlobe();
    this.createAtmosphere();
    this.createCircuitMarkers();
    this.setupInteraction();
    this.createSidebar();

    this.scene.add(this.group);
  }

  createStarfield() {
    // Skybox avec les étoiles qui tourne aussi
    const starGeometry = new SphereGeometry(100, 64, 64);

    // Chargement de la texture d'étoiles depuis tes assets
    const starTexture = this.textureLoader.load('./assets/milkyway.webp');

    const starMaterial = new MeshBasicMaterial({
      map: starTexture,
      side: BackSide // À l'intérieur de la sphère
    });

    this.starfield = new Mesh(starGeometry, starMaterial);
    this.starfield.rotation.x = Math.PI; // Flip pour avoir les bonnes étoiles
    this.scene.add(this.starfield);
  }

  createGlobe() {
    // Géométrie de la sphere principale
    const geometry = new SphereGeometry(2, 128, 128); // Plus de détails

    // Chargement de la texture Earth Color depuis tes assets
    const earthTexture = this.textureLoader.load('./assets/earth-color.jpg');

    const material = new MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      shininess: 10,
      specular: 0x111111 // Réflection subtile sur les océans
    });

    this.globe = new Mesh(geometry, material);
    this.globe.receiveShadow = true;
    this.globe.castShadow = true;
    this.group.add(this.globe);
  }

  createAtmosphere() {
    // Couche d'atmosphère/stratosphère réaliste
    const atmosphereGeometry = new SphereGeometry(2.05, 64, 64);

    // Shader personnalisé pour un effet atmosphère réaliste
    const atmosphereMaterial = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.6 }
      },
      vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float time;
                uniform float opacity;
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    
                    // Couleurs de l'atmosphère (bleu vers blanc)
                    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
                    
                    // Effet de scintillement subtil
                    float twinkle = sin(time * 2.0 + vPositionNormal.x * 10.0) * 0.1 + 0.9;
                    atmosphere *= twinkle;
                    
                    gl_FragColor = vec4(atmosphere, intensity * opacity);
                }
            `,
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true
    });

    this.atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
    this.group.add(this.atmosphere);

    // Couche externe d'atmosphère pour l'effet de halo
    const outerAtmosphereGeometry = new SphereGeometry(2.15, 32, 32);
    const outerAtmosphereMaterial = new ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
                varying vec3 vNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                
                void main() {
                    float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    vec3 glow = vec3(0.2, 0.4, 1.0) * intensity;
                    gl_FragColor = vec4(glow, intensity * 0.3);
                }
            `,
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true
    });

    this.outerAtmosphere = new Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
    this.group.add(this.outerAtmosphere);
  }

  createCircuitMarkers() {
    f1Circuits.forEach((circuit, index) => {
      const marker = this.createMarker(circuit, index);
      this.markers.push(marker);
      this.group.add(marker.group);
    });
  }

  createMarker(circuit, index) {
    const group = new Group();

    // Conversion coordonnées géographiques vers position 3D sur sphère
    const phi = (90 - circuit.lat) * (Math.PI / 180);
    const theta = (circuit.lng + 180) * (Math.PI / 180);

    const radius = 2.05;
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Marqueur diamond shape comme dans ton image
    const markerGeometry = new BoxGeometry(0.04, 0.04, 0.04);
    markerGeometry.rotateY(Math.PI / 4);
    markerGeometry.rotateX(Math.PI / 4);

    const markerMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const markerMesh = new Mesh(markerGeometry, markerMaterial);
    markerMesh.position.set(x, y, z);

    // Point central rouge
    const pointGeometry = new SphereGeometry(0.015, 8, 8);
    const pointMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0x440000
    });
    const pointMesh = new Mesh(pointGeometry, pointMaterial);
    pointMesh.position.set(x, y, z);

    group.add(markerMesh);
    group.add(pointMesh);

    // Données du circuit pour l'interaction
    group.userData = {
      circuit,
      index,
      markerMesh,
      pointMesh,
      position: new Vector3(x, y, z),
      isHovered: false
    };

    return { group, circuit };
  }

  setupInteraction() {
    const canvas = this.webgl.canvas;

    // Gestion du drag
    canvas.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (event) => {
      if (this.isDragging) {
        const deltaMove = {
          x: event.clientX - this.previousMousePosition.x,
          y: event.clientY - this.previousMousePosition.y
        };

        this.rotationVelocity.x = deltaMove.x * 0.005;
        this.rotationVelocity.y = deltaMove.y * 0.005;

        this.group.rotation.y += this.rotationVelocity.x;
        this.group.rotation.x += this.rotationVelocity.y;

        // Limiter la rotation verticale
        this.group.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.group.rotation.x));

        this.previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      } else {
        // Gestion du hover des marqueurs
        this.onMouseMove(event);
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      canvas.style.cursor = 'grab';

      // Inertie
      setTimeout(() => {
        this.autoRotate = true;
      }, 2000);
    });

    canvas.addEventListener('click', (event) => {
      if (!this.isDragging) {
        this.onMouseClick(event);
      }
    });

    // Style du curseur par défaut
    canvas.style.cursor = 'grab';
  }

  onMouseClick(event) {
    const mouse = this.getMousePosition(event);
    const intersectedMarker = this.getIntersectedMarker(mouse);

    if (intersectedMarker) {
      this.selectCircuit(intersectedMarker.userData);
    }
  }

  onMouseMove(event) {
    const mouse = this.getMousePosition(event);
    const intersectedMarker = this.getIntersectedMarker(mouse);

    // Reset du marqueur précédemment survolé
    if (this.hoveredMarker && this.hoveredMarker !== intersectedMarker) {
      this.hoveredMarker.userData.isHovered = false;
      this.hoveredMarker.userData.markerMesh.scale.setScalar(1);
      this.hoveredMarker.userData.pointMesh.scale.setScalar(1);
    }

    // Nouveau marqueur survolé
    if (intersectedMarker && intersectedMarker !== this.hoveredMarker) {
      intersectedMarker.userData.isHovered = true;
      intersectedMarker.userData.markerMesh.scale.setScalar(1.5);
      intersectedMarker.userData.pointMesh.scale.setScalar(1.3);
      this.webgl.canvas.style.cursor = 'pointer';
    } else if (!intersectedMarker && !this.isDragging) {
      this.webgl.canvas.style.cursor = 'grab';
    }

    this.hoveredMarker = intersectedMarker;
  }

  getMousePosition(event) {
    const rect = this.webgl.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
  }

  getIntersectedMarker(mouse) {
    // Raycasting simplifié pour détecter les marqueurs
    const camera = this.webgl.camera.active;

    for (let marker of this.markers) {
      const markerPosition = marker.group.userData.position.clone();
      markerPosition.project(camera);

      const distance = Math.sqrt(
        Math.pow(mouse.x - markerPosition.x, 2) +
        Math.pow(mouse.y - markerPosition.y, 2)
      );

      if (distance < 0.1) {
        return marker.group;
      }
    }
    return null;
  }

  selectCircuit(markerData) {
    this.selectedCircuit = markerData.circuit;

    // Mettre en évidence le circuit sélectionné dans la sidebar
    this.highlightCircuitInSidebar(markerData.circuit);

    // Animation pour faire face au circuit
    this.focusOnCircuit(markerData.position);
  }

  createSidebar() {
    // Créer la sidebar à droite
    const sidebar = document.createElement('div');
    sidebar.id = 'circuits-sidebar';
    sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            background: rgba(10, 15, 25, 0.95);
            backdrop-filter: blur(10px);
            overflow-y: auto;
            z-index: 1000;
            padding: 20px 15px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        `;

    // Header de la sidebar
    const header = document.createElement('div');
    header.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;
    header.innerHTML = `
            <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">Projects</h2>
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
                <span style="color: #ccc; font-size: 14px;">GP</span>
            </div>
        `;

    sidebar.appendChild(header);

    // Ajouter les circuits
    f1Circuits.forEach((circuit, index) => {
      const circuitCard = this.createCircuitCard(circuit, index);
      sidebar.appendChild(circuitCard);
    });

    document.body.appendChild(sidebar);
  }

  createCircuitCard(circuit, index) {
    const card = document.createElement('div');
    card.className = 'circuit-card';
    card.style.cssText = `
            margin-bottom: 20px;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

    card.innerHTML = `
            <div style="position: relative; width: 100%; height: 200px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); overflow: hidden;">
                <img src="${circuit.image}" 
                     style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;"
                     onerror="this.style.display='none'">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 15px;">
                    <h3 style="color: white; margin: 0; font-size: 16px; font-weight: 600;">${circuit.name}</h3>
                    <p style="color: #ccc; margin: 5px 0 0 0; font-size: 14px;">${circuit.location}</p>
                </div>
            </div>
        `;

    // Interaction hover
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      card.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
      card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });

    // Clic pour sélectionner le circuit
    card.addEventListener('click', () => {
      this.selectCircuitFromSidebar(circuit, index);
    });

    return card;
  }

  selectCircuitFromSidebar(circuit, index) {
    this.selectedCircuit = circuit;

    // Trouver la position du marqueur correspondant
    const marker = this.markers[index];
    if (marker) {
      this.focusOnCircuit(marker.group.userData.position);
    }

    this.highlightCircuitInSidebar(circuit);
  }

  highlightCircuitInSidebar(circuit) {
    // Retirer la sélection précédente
    document.querySelectorAll('.circuit-card').forEach(card => {
      card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });

    // Ajouter la sélection au circuit actuel
    const cards = document.querySelectorAll('.circuit-card');
    const selectedIndex = f1Circuits.findIndex(c => c.name === circuit.name);
    if (cards[selectedIndex]) {
      cards[selectedIndex].style.borderColor = '#ff0000';
    }

    // Afficher les détails du circuit
    this.showCircuitDetails(circuit);
  }

  showCircuitDetails(circuit) {
    let detailsPanel = document.getElementById('circuit-details');
    if (!detailsPanel) {
      detailsPanel = document.createElement('div');
      detailsPanel.id = 'circuit-details';
      detailsPanel.style.cssText = `
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
            `;
      document.body.appendChild(detailsPanel);
    }

    detailsPanel.innerHTML = `
            <h3 style="margin-top: 0; color: #ff4444; font-size: 18px;">${circuit.name}</h3>
            <p style="margin: 10px 0; color: #ccc;"><strong>📍 Lieu:</strong> ${circuit.location}</p>
            <p style="margin: 10px 0; color: #ccc;"><strong>📅 Date GP 2025:</strong> ${circuit.date}</p>
            <p style="margin: 10px 0; color: #ccc;"><strong>🏁 Pays:</strong> ${circuit.country}</p>
            <button onclick="document.getElementById('circuit-details').style.display='none'" 
                    style="background: #ff0000; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px; float: right;">
                Fermer
            </button>
        `;

    detailsPanel.style.display = 'block';
  }

  focusOnCircuit(position) {
    // Animation douce vers le circuit (optionnel)
    this.autoRotate = false;

    // Reprendre la rotation après 3 secondes
    setTimeout(() => {
      this.autoRotate = true;
    }, 3000);
  }

  update() {
    // Rotation automatique du globe quand pas de drag
    if (this.autoRotate && !this.isDragging) {
      this.group.rotation.y += this.rotationSpeed;
    }

    // Rotation lente et continue du champ d'étoiles
    if (this.starfield) {
      this.starfield.rotation.y += this.starfieldRotationSpeed;
      this.starfield.rotation.x += this.starfieldRotationSpeed * 0.5;
    }

    // Animation des marqueurs avec pulsation
    this.markers.forEach((marker, index) => {
      const time = Date.now() * 0.003 + index * 0.5;

      if (!marker.group.userData.isHovered) {
        // Pulsation subtile du point rouge
        const scale = 1 + Math.sin(time) * 0.15;
        marker.group.userData.pointMesh.scale.setScalar(scale);

        // Rotation du marqueur diamant
        marker.group.userData.markerMesh.rotation.y += 0.01;
      }
    });

    // Animation des shaders de l'atmosphère
    const time = Date.now() * 0.001;
    if (this.atmosphere && this.atmosphere.material.uniforms) {
      this.atmosphere.material.uniforms.time.value = time;
    }
    if (this.outerAtmosphere && this.outerAtmosphere.material.uniforms) {
      this.outerAtmosphere.material.uniforms.time.value = time;
    }
  }

  destroy() {
    // Nettoyer les éléments DOM
    const elements = [
      'circuits-sidebar',
      'circuit-details'
    ];

    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  }
}