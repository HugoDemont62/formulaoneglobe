// components/Globe/EarthSphere.js
import {
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  TextureLoader,
  Color
} from 'three';

/**
 * Classe pour créer la sphère terrestre principale
 * Gère la géométrie, les matériaux et les textures de la Terre
 */
export default class EarthSphere {
  constructor() {
    this.textureLoader = new TextureLoader();
    this.mesh = null;
    this.createEarth();
  }

  /**
   * Crée la sphère terrestre avec texture
   */
  createEarth() {
    // Géométrie de la sphère - plus de détails pour un rendu lisse
    const geometry = new SphereGeometry(2, 128, 128);

    // Matériau initial (sera remplacé par la texture)
    const material = new MeshPhongMaterial({
      flatShading: false,
      side: 2,
      transparent: false, // Ajoute cette ligne
      opacity: 1,         // Et celle-ci
    });

    // Création du mesh
    this.mesh = new Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;

    // Rotation initiale pour orienter la terre
    this.mesh.rotation.y = Math.PI;

    // Chargement automatique de la texture
    this.loadEarthTexture();
  }

  /**
   * Charge la texture de la terre
   */
  loadEarthTexture() {
    // Essaie plusieurs chemins possibles pour la texture terre
    const possiblePaths = [
      './assets/earth_color.webp'
    ];

    this.tryLoadTexture(possiblePaths, 0);
  }

  /**
   * Essaie de charger les textures dans l'ordre
   */
  tryLoadTexture(paths, index) {
    if (index >= paths.length) {
      console.log('🌍 Utilisation du matériau par défaut (aucune texture trouvée)');
      return;
    }

    const currentPath = paths[index];
    console.log(`📦 Tentative de chargement: ${currentPath}`);

    this.textureLoader.load(
      currentPath,
      (texture) => {
        // Succès du chargement
        texture.wrapS = texture.wrapT = 1000; // RepeatWrapping
        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
        console.log(`✅ Texture terre chargée: ${currentPath}`);
      },
      (progress) => {
        // Progression du chargement
        if (progress.total > 0) {
          console.log(`📊 Chargement texture: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        }
      },
      (error) => {
        // Erreur - essayer le suivant
        console.warn(`⚠️ Échec chargement: ${currentPath}`);
        this.tryLoadTexture(paths, index + 1);
      }
    );
  }

  /**
   * Charge une texture spécifique (pour usage externe)
   * @param {string} texturePath - Chemin vers la texture
   */
  loadTexture(texturePath) {
    if (!texturePath) return;

    this.textureLoader.load(
      texturePath,
      (texture) => {
        texture.wrapS = texture.wrapT = 1000;
        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
        console.log('✅ Texture personnalisée chargée');
      },
      undefined,
      (error) => {
        console.warn('⚠️ Impossible de charger la texture personnalisée:', error);
      }
    );
  }

  /**
   * Met à jour l'apparence de la terre
   * @param {number} time - Temps pour les animations
   */
  update(time) {
    // Rotation lente autour de l'axe Y
    if (this.mesh) {
      this.mesh.rotation.y += 0.001; // Rotation de la terre
    }
  }

  /**
   * Retourne le mesh de la terre
   * @returns {Mesh} Le mesh Three.js de la terre
   */
  getMesh() {
    return this.mesh;
  }

  /**
   * Libère les ressources utilisées
   */
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) {
        if (this.mesh.material.map) this.mesh.material.map.dispose();
        this.mesh.material.dispose();
      }
    }
  }
}