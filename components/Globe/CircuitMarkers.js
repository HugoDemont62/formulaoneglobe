// components/Globe/CircuitMarkers.js
import {
  SphereGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Group,
  Vector3
} from 'three';

// Données des circuits F1 2025 avec coordonnées géographiques précises
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

/**
 * Classe pour gérer les marqueurs des circuits de F1 sur le globe
 * Convertit les coordonnées géographiques en positions 3D
 */
export default class CircuitMarkers {
  constructor() {
    this.markers = [];
    this.hoveredMarker = null;
    this.selectedMarker = null;
    this.createMarkers();
  }

  /**
   * Convertit les coordonnées géographiques (lat, lng) en position 3D sur une sphère
   * @param {number} lat - Latitude en degrés
   * @param {number} lng - Longitude en degrés
   * @param {number} radius - Rayon de la sphère (par défaut 2.05 pour être au-dessus de la terre)
   * @returns {Vector3} Position 3D sur la sphère
   */
  geoToVector3(lat, lng, radius = 2.05) {
    // Conversion degrés vers radians
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    // Calcul des coordonnées cartésiennes
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new Vector3(x, y, z);
  }

  /**
   * Crée un marqueur visuel pour un circuit
   * @param {Object} circuit - Données du circuit
   * @param {number} index - Index du circuit
   * @returns {Object} Objet contenant le groupe du marqueur et ses données
   */
  createSingleMarker(circuit, index) {
    const group = new Group();

    // Position 3D du circuit sur la sphère
    const position = this.geoToVector3(circuit.lat, circuit.lng);

    // Marqueur principal (forme diamant)
    const markerGeometry = new BoxGeometry(0.05, 0.05, 0.05);
    const markerMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const markerMesh = new Mesh(markerGeometry, markerMaterial);
    markerMesh.position.copy(position);
    // Rotation pour créer un effet diamant
    markerMesh.rotation.x = Math.PI / 4;
    markerMesh.rotation.y = Math.PI / 4;

    // Point rouge central (plus visible)
    const pointGeometry = new SphereGeometry(0.02, 12, 12);
    const pointMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0x440000 // Légère émission pour le faire briller
    });
    const pointMesh = new Mesh(pointGeometry, pointMaterial);
    pointMesh.position.copy(position);

    // Ajout des éléments au groupe
    group.add(markerMesh);
    group.add(pointMesh);

    // Stockage des données pour l'interaction
    group.userData = {
      circuit,
      index,
      markerMesh,
      pointMesh,
      position: position.clone(),
      isHovered: false,
      isSelected: false
    };

    return {
      group,
      circuit,
      position
    };
  }

  /**
   * Crée tous les marqueurs pour tous les circuits
   */
  createMarkers() {
    console.log(`🏁 Création de ${F1_CIRCUITS_2025.length} marqueurs de circuits F1...`);

    F1_CIRCUITS_2025.forEach((circuit, index) => {
      const marker = this.createSingleMarker(circuit, index);
      this.markers.push(marker);
    });

    console.log(`✅ ${this.markers.length} marqueurs créés avec succès`);
  }

  /**
   * Retourne tous les groupes de marqueurs pour les ajouter à la scène
   * @returns {Group[]} Tableau des groupes Three.js
   */
  getMarkerGroups() {
    return this.markers.map(marker => marker.group);
  }

  /**
   * Met à jour l'animation des marqueurs
   * @param {number} time - Temps pour l'animation
   */
  update(time) {
    this.markers.forEach((marker, index) => {
      const { markerMesh, pointMesh, isHovered, isSelected } = marker.group.userData;

      if (!isHovered && !isSelected) {
        // Animation de pulsation pour le point rouge
        const pulseTime = time * 0.003 + index * 0.5;
        const scale = 1 + Math.sin(pulseTime) * 0.2;
        pointMesh.scale.setScalar(scale);

        // Rotation du marqueur diamant
        markerMesh.rotation.y += 0.015;
        markerMesh.rotation.x += 0.01;
      }
    });
  }

  /**
   * Trouve le marqueur le plus proche d'une position de souris
   * @param {Vector2} mouse - Position de la souris normalisée (-1 à 1)
   * @param {Camera} camera - Caméra pour la projection
   * @returns {Group|null} Le groupe du marqueur trouvé ou null
   */
  getMarkerFromMouse(mouse, camera) {
    // Projection des marqueurs sur l'écran pour détection
    for (let marker of this.markers) {
      const screenPosition = marker.position.clone();
      screenPosition.project(camera);

      // Calcul de la distance entre la souris et le marqueur projeté
      const distance = Math.sqrt(
        Math.pow(mouse.x - screenPosition.x, 2) +
        Math.pow(mouse.y - screenPosition.y, 2)
      );

      // Seuil de détection
      if (distance < 0.08) {
        return marker.group;
      }
    }
    return null;
  }

  /**
   * Met en surbrillance un marqueur
   * @param {Group} markerGroup - Groupe du marqueur à mettre en surbrillance
   */
  highlightMarker(markerGroup) {
    if (this.hoveredMarker && this.hoveredMarker !== markerGroup) {
      // Réinitialiser le marqueur précédent
      this.resetMarker(this.hoveredMarker);
    }

    if (markerGroup) {
      markerGroup.userData.isHovered = true;
      markerGroup.userData.markerMesh.scale.setScalar(1.5);
      markerGroup.userData.pointMesh.scale.setScalar(1.3);
      markerGroup.userData.markerMesh.material.color.setHex(0xffff00); // Jaune en survol
    }

    this.hoveredMarker = markerGroup;
  }

  /**
   * Sélectionne un marqueur
   * @param {Group} markerGroup - Groupe du marqueur à sélectionner
   */
  selectMarker(markerGroup) {
    if (this.selectedMarker) {
      this.selectedMarker.userData.isSelected = false;
      this.resetMarker(this.selectedMarker);
    }

    if (markerGroup) {
      markerGroup.userData.isSelected = true;
      markerGroup.userData.markerMesh.scale.setScalar(2);
      markerGroup.userData.pointMesh.scale.setScalar(1.5);
      markerGroup.userData.markerMesh.material.color.setHex(0x00ff00); // Vert pour sélection
    }

    this.selectedMarker = markerGroup;
  }

  /**
   * Remet un marqueur à son état par défaut
   * @param {Group} markerGroup - Groupe du marqueur à réinitialiser
   */
  resetMarker(markerGroup) {
    if (markerGroup && !markerGroup.userData.isSelected) {
      markerGroup.userData.isHovered = false;
      markerGroup.userData.markerMesh.scale.setScalar(1);
      markerGroup.userData.pointMesh.scale.setScalar(1);
      markerGroup.userData.markerMesh.material.color.setHex(0xffffff); // Blanc par défaut
    }
  }

  /**
   * Retourne le circuit sélectionné
   * @returns {Object|null} Données du circuit sélectionné
   */
  getSelectedCircuit() {
    return this.selectedMarker ? this.selectedMarker.userData.circuit : null;
  }

  /**
   * Libère les ressources
   */
  dispose() {
    this.markers.forEach(marker => {
      const { markerMesh, pointMesh } = marker.group.userData;
      if (markerMesh) {
        markerMesh.geometry.dispose();
        markerMesh.material.dispose();
      }
      if (pointMesh) {
        pointMesh.geometry.dispose();
        pointMesh.material.dispose();
      }
    });
    this.markers = [];
  }
}