// components/Globe/CircuitMarkers.js - Complet avec pins ajustés
import {
  SphereGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  Group,
  Vector3,
  Raycaster,
  Vector2
} from 'three';

// Données des circuits F1 2025
export const F1_CIRCUITS_2025 = [
  {
    name: "Bahrain International Circuit",
    location: "Sakhir, Bahrain",
    date: "2 Mars 2025",
    lat: 26.0325,
    lng: 50.5106,
    country: "Bahrain"
  },
  {
    name: "Jeddah Corniche Circuit",
    location: "Jeddah, Arabie Saoudite",
    date: "9 Mars 2025",
    lat: 21.6319,
    lng: 39.1044,
    country: "Arabie Saoudite"
  },
  {
    name: "Albert Park Circuit",
    location: "Melbourne, Australie",
    date: "16 Mars 2025",
    lat: -37.8497,
    lng: 144.9680,
    country: "Australie"
  },
  {
    name: "Suzuka International Racing Course",
    location: "Suzuka, Japon",
    date: "6 Avril 2025",
    lat: 34.8431,
    lng: 136.5417,
    country: "Japon"
  },
  {
    name: "Shanghai International Circuit",
    location: "Shanghai, Chine",
    date: "13 Avril 2025",
    lat: 31.3389,
    lng: 121.2197,
    country: "Chine"
  },
  {
    name: "Miami International Autodrome",
    location: "Miami, États-Unis",
    date: "4 Mai 2025",
    lat: 25.9581,
    lng: -80.2389,
    country: "États-Unis"
  },
  {
    name: "Autodromo Enzo e Dino Ferrari",
    location: "Imola, Italie",
    date: "18 Mai 2025",
    lat: 44.3439,
    lng: 11.7167,
    country: "Italie"
  },
  {
    name: "Circuit de Monaco",
    location: "Monaco",
    date: "25 Mai 2025",
    lat: 43.7347,
    lng: 7.4206,
    country: "Monaco"
  },
  {
    name: "Circuit Gilles Villeneuve",
    location: "Montréal, Canada",
    date: "15 Juin 2025",
    lat: 45.5042,
    lng: -73.5228,
    country: "Canada"
  },
  {
    name: "Circuit de Barcelona-Catalunya",
    location: "Barcelone, Espagne",
    date: "29 Juin 2025",
    lat: 41.5700,
    lng: 2.2611,
    country: "Espagne"
  },
  {
    name: "Red Bull Ring",
    location: "Spielberg, Autriche",
    date: "6 Juillet 2025",
    lat: 47.2197,
    lng: 14.7647,
    country: "Autriche"
  },
  {
    name: "Silverstone Circuit",
    location: "Silverstone, Royaume-Uni",
    date: "13 Juillet 2025",
    lat: 52.0786,
    lng: -1.0169,
    country: "Royaume-Uni"
  },
  {
    name: "Hungaroring",
    location: "Budapest, Hongrie",
    date: "27 Juillet 2025",
    lat: 47.5811,
    lng: 19.2506,
    country: "Hongrie"
  },
  {
    name: "Circuit de Spa-Francorchamps",
    location: "Spa, Belgique",
    date: "31 Août 2025",
    lat: 50.4372,
    lng: 5.9714,
    country: "Belgique"
  },
  {
    name: "Autodromo Nazionale di Monza",
    location: "Monza, Italie",
    date: "7 Septembre 2025",
    lat: 45.6156,
    lng: 9.2814,
    country: "Italie"
  },
  {
    name: "Baku City Circuit",
    location: "Bakou, Azerbaïdjan",
    date: "21 Septembre 2025",
    lat: 40.3725,
    lng: 49.8533,
    country: "Azerbaïdjan"
  },
  {
    name: "Marina Bay Street Circuit",
    location: "Singapour",
    date: "5 Octobre 2025",
    lat: 1.2914,
    lng: 103.8644,
    country: "Singapour"
  },
  {
    name: "Circuit of the Americas",
    location: "Austin, États-Unis",
    date: "19 Octobre 2025",
    lat: 30.1328,
    lng: -97.6411,
    country: "États-Unis"
  },
  {
    name: "Autódromo Hermanos Rodríguez",
    location: "Mexico, Mexique",
    date: "26 Octobre 2025",
    lat: 19.4042,
    lng: -99.0907,
    country: "Mexique"
  },
  {
    name: "Interlagos",
    location: "São Paulo, Brésil",
    date: "9 Novembre 2025",
    lat: -23.7014,
    lng: -46.6997,
    country: "Brésil"
  },
  {
    name: "Las Vegas Strip Circuit",
    location: "Las Vegas, États-Unis",
    date: "22 Novembre 2025",
    lat: 36.1147,
    lng: -115.1728,
    country: "États-Unis"
  },
  {
    name: "Losail International Circuit",
    location: "Losail, Qatar",
    date: "30 Novembre 2025",
    lat: 25.4900,
    lng: 51.4542,
    country: "Qatar"
  },
  {
    name: "Yas Marina Circuit",
    location: "Abu Dhabi, Émirats Arabes Unis",
    date: "7 Décembre 2025",
    lat: 24.4672,
    lng: 54.6031,
    country: "Émirats Arabes Unis"
  }
];

export default class CircuitMarkers {
  constructor() {
    this.markers = [];
    this.markerMeshes = [];
    this.hoveredMarker = null;
    this.selectedMarker = null;
    this.raycaster = new Raycaster();
    this.occlusionRaycaster = new Raycaster();
    this.earthMesh = null;
    this.createMarkers();
  }

  setEarthMesh(earthMesh) {
    this.earthMesh = earthMesh;
    console.log('🌍 Référence terre définie pour test d\'occlusion');
  }

  /**
   * Formule de conversion géographique vers 3D
   */
  geoToVector3(lat, lng, radius = 1.04) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (-lng + 180) * (Math.PI / 180); // Remarque le signe moins devant lng

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new Vector3(x, y, z);
  }

  createSingleMarker(circuit, index) {
    const group = new Group();
    const position = this.geoToVector3(circuit.lat, circuit.lng);

    // Pin principal - Plus petit et stylé
    const pinGeometry = new BoxGeometry(0.01, 0.05, 0.01);  // Plus petit
    const pinMaterial = new MeshStandardMaterial({
      color: 0x444444,        // Gris foncé au lieu de blanc
      emissive: 0x111111,
      metalness: 0.7,         // Aspect métallique
      roughness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    const pinMesh = new Mesh(pinGeometry, pinMaterial);
    pinMesh.position.copy(position);
    pinMesh.lookAt(position.clone().multiplyScalar(2));

    // Point rouge principal - Plus petit et plus lumineux
    const pointGeometry = new SphereGeometry(0.015, 12, 12);  // Plus petit
    const pointMaterial = new MeshStandardMaterial({
      color: 0xff2020,        // Rouge plus vif
      emissive: 0xaa0000,     // Plus d'émission
      transparent: true,
      opacity: 1.0
    });
    const pointMesh = new Mesh(pointGeometry, pointMaterial);
    pointMesh.position.copy(position);

    // Halo plus petit et plus subtil
    const haloGeometry = new SphereGeometry(0.025, 8, 8);     // Plus petit
    const haloMaterial = new MeshBasicMaterial({
      color: 0xff6666,        // Rouge plus clair
      transparent: true,
      opacity: 0.2,           // Plus transparent
      depthWrite: false
    });
    const haloMesh = new Mesh(haloGeometry, haloMaterial);
    haloMesh.position.copy(position);

    group.add(haloMesh);
    group.add(pinMesh);
    group.add(pointMesh);

    // Debug pour premiers marqueurs
    if (index < 5) {
      console.log(`📍 ${circuit.name} (${circuit.lat}°, ${circuit.lng}°) → Position:`, position);
    }

    // Stockage pour raycasting
    pinMesh.userData = { circuit, index, type: 'marker' };
    pointMesh.userData = { circuit, index, type: 'marker' };

    this.markerMeshes.push(pinMesh, pointMesh);

    group.userData = {
      circuit,
      index,
      pinMesh,
      pointMesh,
      haloMesh,
      position: position.clone(),
      worldPosition: position.clone(),
      isHovered: false,
      isSelected: false,
      isVisible: true
    };

    return { group, circuit, position };
  }

  isMarkerOccludedByEarth(markerWorldPosition, camera) {
    if (!this.earthMesh) return false;

    const direction = markerWorldPosition.clone().sub(camera.position).normalize();
    const distance = camera.position.distanceTo(markerWorldPosition);

    this.occlusionRaycaster.set(camera.position, direction);
    this.occlusionRaycaster.far = distance - 0.01;

    const intersects = this.occlusionRaycaster.intersectObject(this.earthMesh, false);
    return intersects.length > 0;
  }

  updateMarkersVisibility(camera, globeGroup) {
    if (!camera) return;

    this.markers.forEach(marker => {
      const worldPosition = marker.group.userData.position.clone();

      if (globeGroup) {
        worldPosition.applyMatrix4(globeGroup.matrixWorld);
      }

      marker.group.userData.worldPosition = worldPosition;
      const isOccluded = this.isMarkerOccludedByEarth(worldPosition, camera);

      marker.group.userData.isVisible = !isOccluded;
      marker.group.visible = !isOccluded;
    });
  }

  createMarkers() {
    console.log(`🏁 Création de ${F1_CIRCUITS_2025.length} marqueurs de circuits F1...`);

    F1_CIRCUITS_2025.forEach((circuit, index) => {
      const marker = this.createSingleMarker(circuit, index);
      this.markers.push(marker);
    });

    console.log(`✅ ${this.markers.length} marqueurs créés avec pins ajustés`);
  }

  getMarkerGroups() {
    return this.markers.map(marker => marker.group);
  }

  update(time, camera = null, globeGroup = null) {
    if (camera) {
      this.updateMarkersVisibility(camera, globeGroup);
    }

    this.markers.forEach((marker, index) => {
      if (!marker.group.userData.isVisible) return;

      const { pinMesh, pointMesh, haloMesh, isHovered, isSelected } = marker.group.userData;

      if (!isHovered && !isSelected) {
        const pulseTime = time * 0.002 + index * 0.3;
        const scale = 1 + Math.sin(pulseTime) * 0.15; // Animation plus subtile
        pointMesh.scale.setScalar(scale);

        const haloScale = 1 + Math.sin(pulseTime * 1.2) * 0.08;
        haloMesh.scale.setScalar(haloScale);

        pinMesh.rotation.y += 0.005; // Rotation plus lente
      }
    });
  }

  getMarkerFromMouse(mouse, camera) {
    this.raycaster.setFromCamera(mouse, camera);

    const visibleMeshes = this.markerMeshes.filter(mesh => {
      const markerIndex = mesh.userData.index;
      return this.markers[markerIndex].group.userData.isVisible;
    });

    const intersects = this.raycaster.intersectObjects(visibleMeshes);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;
      const markerData = intersectedMesh.userData;

      if (markerData && markerData.type === 'marker') {
        return this.markers[markerData.index].group;
      }
    }

    return null;
  }

  highlightMarker(markerGroup) {
    if (this.hoveredMarker && this.hoveredMarker !== markerGroup) {
      this.resetMarker(this.hoveredMarker);
    }

    if (markerGroup && markerGroup.userData.isVisible) {
      const userData = markerGroup.userData;
      userData.isHovered = true;

      // Effet de survol plus subtil
      userData.pinMesh.scale.setScalar(1.2);
      userData.pointMesh.scale.setScalar(1.3);
      userData.haloMesh.scale.setScalar(1.4);

      // Couleurs de survol
      userData.pinMesh.material.color.setHex(0xffff44); // Jaune
      userData.pointMesh.material.emissive.setHex(0xff6600); // Orange
      userData.haloMesh.material.opacity = 0.4;
    }

    this.hoveredMarker = markerGroup;
  }

  selectMarker(markerGroup) {
    if (this.selectedMarker) {
      this.selectedMarker.userData.isSelected = false;
      this.resetMarker(this.selectedMarker);
    }

    if (markerGroup) {
      const userData = markerGroup.userData;
      userData.isSelected = true;

      // Effet de sélection plus visible
      userData.pinMesh.scale.setScalar(1.5);
      userData.pointMesh.scale.setScalar(1.6);
      userData.haloMesh.scale.setScalar(1.8);

      // Couleurs de sélection
      userData.pinMesh.material.color.setHex(0x00ff44); // Vert vif
      userData.pointMesh.material.color.setHex(0x00ff44);
      userData.pointMesh.material.emissive.setHex(0x006600);
      userData.haloMesh.material.color.setHex(0x44ff44);
      userData.haloMesh.material.opacity = 0.6;

      console.log(`✅ Marqueur sélectionné: ${userData.circuit.name}`);
    }

    this.selectedMarker = markerGroup;
  }

  resetMarker(markerGroup) {
    if (markerGroup && !markerGroup.userData.isSelected) {
      const userData = markerGroup.userData;
      userData.isHovered = false;

      // Retour à l'état normal
      userData.pinMesh.scale.setScalar(1);
      userData.pointMesh.scale.setScalar(1);
      userData.haloMesh.scale.setScalar(1);

      // Couleurs par défaut
      userData.pinMesh.material.color.setHex(0x444444); // Gris foncé
      userData.pointMesh.material.color.setHex(0xff2020); // Rouge vif
      userData.pointMesh.material.emissive.setHex(0xaa0000);
      userData.haloMesh.material.color.setHex(0xff6666); // Rouge clair
      userData.haloMesh.material.opacity = 0.2;
    }
  }

  getSelectedCircuit() {
    return this.selectedMarker ? this.selectedMarker.userData.circuit : null;
  }

  dispose() {
    this.markerMeshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });

    this.markers.forEach(marker => {
      const { pinMesh, pointMesh, haloMesh } = marker.group.userData;
      if (pinMesh?.geometry) pinMesh.geometry.dispose();
      if (pinMesh?.material) pinMesh.material.dispose();
      if (pointMesh?.geometry) pointMesh.geometry.dispose();
      if (pointMesh?.material) pointMesh.material.dispose();
      if (haloMesh?.geometry) haloMesh.geometry.dispose();
      if (haloMesh?.material) haloMesh.material.dispose();
    });

    this.markers = [];
    this.markerMeshes = [];
    this.earthMesh = null;
  }
}