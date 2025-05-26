// components/Globe/StarfieldBackground.js
import {
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  BackSide,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  Color
} from 'three';
import * as THREE from 'three';

/**
 * Classe pour créer un arrière-plan étoilé immersif
 * Utilise des particules pour créer un champ d'étoiles réaliste
 */
export default class StarfieldBackground {
  constructor() {
    this.starfield = null;
    this.rotationSpeed = 0.0001; // Rotation très lente
    this.createStarfield();
  }

  /**
   * Crée un champ d'étoiles avec texture si disponible, sinon avec des particules
   */
  createStarfield() {
    // D'abord essayer de charger une texture de fond étoilé
    this.tryLoadStarfieldTexture();
  }

  /**
   * Essaie de charger une texture de champ d'étoiles
   */
  async tryLoadStarfieldTexture() {
    const textureLoader = new (await import('three')).TextureLoader();

    // Chemins possibles pour la texture de fond étoilé
    const possiblePaths = [
      './assets/milkyway.webp',
    ];

    this.tryLoadStarTexture(textureLoader, possiblePaths, 0);
  }

  /**
   * Essaie de charger les textures d'étoiles dans l'ordre
   */
  tryLoadStarTexture(textureLoader, paths, index) {
    if (index >= paths.length) {
      console.log('✨ Création du champ d\'étoiles par particules');
      this.createParticleStarfield();
      return;
    }

    const currentPath = paths[index];
    console.log(`🌌 Tentative chargement texture étoiles: ${currentPath}`);

    textureLoader.load(
      currentPath,
      (texture) => {
        // Correction du filtrage et des mipmaps
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;

        // Succès - créer la skybox avec texture
        this.createTexturedStarfield(texture);
        console.log(`✅ Texture étoiles chargée: ${currentPath}`);
      },
      undefined,
      (error) => {
        // Échec - essayer le suivant
        console.warn(`⚠️ Échec texture étoiles: ${currentPath}`);
        this.tryLoadStarTexture(textureLoader, paths, index + 1);
      }
    );
  }

  /**
   * Crée un champ d'étoiles avec texture
   */
  createTexturedStarfield(texture) {
    const skyGeometry = new SphereGeometry(100, 64, 64);

    const skyMaterial = new MeshBasicMaterial({
      map: texture,
      side: BackSide // Rendu à l'intérieur de la sphère
    });

    this.starfield = new Mesh(skyGeometry, skyMaterial);
    this.starfield.rotation.x = Math.PI; // Orientation correcte
  }

  /**
   * Crée un champ d'étoiles avec des particules (fallback)
   */
  createParticleStarfield() {
    const starsGeometry = new BufferGeometry();
    const starsCount = 3000;

    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    // Couleurs d'étoiles réalistes
    const starColors = [
      new Color(1, 1, 1),     // Blanc
      new Color(1, 0.8, 0.6), // Jaune-orange
      new Color(0.8, 0.8, 1), // Bleu pâle
      new Color(1, 0.6, 0.4), // Rouge-orange
      new Color(0.9, 0.9, 1)  // Blanc-bleu
    ];

    // Génération des étoiles
    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;

      // Position aléatoire sur une sphère
      const radius = 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Couleur aléatoire
      const starColor = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;
    }

    starsGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new BufferAttribute(colors, 3));

    const starsMaterial = new PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.starfield = new Points(starsGeometry, starsMaterial);
  }

  /**
   * Crée une skybox simple en tant qu'alternative
   * Utilisée si on veut un arrière-plan plus simple
   */
  createSimpleSkybox() {
    const skyGeometry = new SphereGeometry(80, 32, 32);

    // Gradient simple du noir vers le bleu foncé
    const skyMaterial = new MeshBasicMaterial({
      color: new Color(0x000011), // Bleu très foncé
      side: BackSide, // Rendu à l'intérieur de la sphère
      transparent: true,
      opacity: 0.8
    });

    this.starfield = new Mesh(skyGeometry, skyMaterial);

    console.log('🌌 Skybox simple créée');
  }

  /**
   * Met à jour l'animation du champ d'étoiles
   * @param {number} time - Temps pour l'animation
   */
  update(time) {
    if (this.starfield) {
      // Rotation très lente pour donner l'impression de mouvement cosmique
      this.starfield.rotation.y += this.rotationSpeed;
      this.starfield.rotation.x += this.rotationSpeed * 0.5;
    }
  }

  /**
   * Retourne le mesh du champ d'étoiles
   * @returns {Points|Mesh} L'objet Three.js du champ d'étoiles
   */
  getMesh() {
    return this.starfield;
  }

  /**
   * Change la vitesse de rotation du champ d'étoiles
   * @param {number} speed - Nouvelle vitesse de rotation
   */
  setRotationSpeed(speed) {
    this.rotationSpeed = speed;
  }

  /**
   * Active/désactive la visibilité du champ d'étoiles
   * @param {boolean} visible - Visibilité
   */
  setVisible(visible) {
    if (this.starfield) {
      this.starfield.visible = visible;
    }
  }

  /**
   * Libère les ressources utilisées
   */
  dispose() {
    if (this.starfield) {
      if (this.starfield.geometry) this.starfield.geometry.dispose();
      if (this.starfield.material) this.starfield.material.dispose();
    }
  }
}