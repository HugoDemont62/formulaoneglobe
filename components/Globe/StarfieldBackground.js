// components/Globe/StarfieldBackground.js - Import corrigé
import {
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  BackSide,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  Color,
  TextureLoader,
  LinearMipMapLinearFilter,
  LinearFilter,
  RepeatWrapping
} from 'three';

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
   * Crée un champ d'étoiles - Force l'utilisation de la texture
   */
  createStarfield() {
    // Forcer l'utilisation de ta texture d'étoiles
    this.loadYourStarTexture();
  }

  /**
   * Charge directement ta texture d'étoiles
   */
  loadYourStarTexture() {
    const textureLoader = new TextureLoader();

    // REMPLACE par le nom exact de ton fichier d'étoiles
    const starTexturePath = './assets/milkyway.webp'; // 🔄 CHANGE ÇA !

    console.log(`🌌 Chargement de ta texture: ${starTexturePath}`);

    textureLoader.load(
      starTexturePath,
      (texture) => {
        // Configuration optimale pour ta texture
        texture.generateMipmaps = true;
        texture.minFilter = LinearMipMapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.needsUpdate = true;

        // Créer la skybox avec ta texture
        this.createTexturedStarfield(texture);
        console.log(`✅ Ta texture d'étoiles chargée avec succès !`);
      },
      (progress) => {
        console.log(`📈 Chargement texture: ${Math.round(progress.loaded / progress.total * 100)}%`);
      },
      (error) => {
        console.error(`❌ Erreur chargement texture: ${starTexturePath}`, error);
        console.log('🔄 Utilisation du fallback particules...');
        this.createParticleStarfield();
      }
    );
  }

  /**
   * Crée un champ d'étoiles avec ta texture
   */
  createTexturedStarfield(texture) {
    const skyGeometry = new SphereGeometry(150, 64, 64); // Plus grand pour meilleur effet

    const skyMaterial = new MeshBasicMaterial({
      map: texture,
      side: BackSide, // Rendu à l'intérieur de la sphère
      transparent: false,
      opacity: 1.0
    });

    this.starfield = new Mesh(skyGeometry, skyMaterial);

    // Orientation pour que ta texture soit dans le bon sens
    this.starfield.rotation.x = 0;
    this.starfield.rotation.y = 0;
    this.starfield.rotation.z = 0;

    console.log('🌌 Skybox avec ta texture créée');
  }

  /**
   * Crée un champ d'étoiles avec des particules (fallback)
   */
  createParticleStarfield() {
    const starsGeometry = new BufferGeometry();
    const starsCount = 2000; // Réduit pour de meilleures performances

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
      const radius = 80; // Plus loin pour éviter les conflits
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
      size: 1.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false // Taille constante
    });

    this.starfield = new Points(starsGeometry, starsMaterial);
    console.log('✨ Champ d\'étoiles particules créé');
  }

  /**
   * Crée une skybox simple en tant qu'alternative
   */
  createSimpleSkybox() {
    const skyGeometry = new SphereGeometry(90, 32, 32);

    // Gradient simple du noir vers le bleu foncé
    const skyMaterial = new MeshBasicMaterial({
      color: new Color(0x000011), // Bleu très foncé
      side: BackSide,
      transparent: true,
      opacity: 0.8
    });

    this.starfield = new Mesh(skyGeometry, skyMaterial);
    console.log('🌌 Skybox simple créée');
  }

  /**
   * Met à jour l'animation du champ d'étoiles
   */
  update(time) {
    if (this.starfield) {
      // Rotation très lente pour donner l'impression de mouvement cosmique
      this.starfield.rotation.y += this.rotationSpeed;
      this.starfield.rotation.x += this.rotationSpeed * 0.3;
    }
  }

  /**
   * Retourne le mesh du champ d'étoiles
   */
  getMesh() {
    return this.starfield;
  }

  /**
   * Change la vitesse de rotation du champ d'étoiles
   */
  setRotationSpeed(speed) {
    this.rotationSpeed = speed;
  }

  /**
   * Active/désactive la visibilité du champ d'étoiles
   */
  setVisible(visible) {
    if (this.starfield) {
      this.starfield.visible = visible;
    }
  }

  /**
   * Change le style du champ d'étoiles
   */
  setStyle(style) {
    switch(style) {
      case 'particles':
        this.createParticleStarfield();
        break;
      case 'skybox':
        this.createSimpleSkybox();
        break;
      default:
        this.createParticleStarfield();
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