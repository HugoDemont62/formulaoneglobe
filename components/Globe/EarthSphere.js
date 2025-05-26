// components/Globe/EarthSphere.js
import {
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  TextureLoader,
  DoubleSide,
  RepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter
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
    // Augmentation du nombre de segments pour réduire les artefacts en zoom
    const geometry = new SphereGeometry(2, 192, 192);

    // Matériau initial optimisé pour éviter les triangles noirs
    const material = new MeshPhongMaterial({
      specular: 0x333333,      // Réflexion spéculaire légère pour l'océan
      shininess: 25,           // Moins brillant pour un aspect plus naturel
      flatShading: false,      // Shader lisse pour éviter les facettes
      side: DoubleSide,        // Rendu des deux côtés de la géométrie
      transparent: false,
      opacity: 1,
    });

    // Création du mesh
    this.mesh = new Mesh(geometry, material);

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
      './assets/earth_color.webp',
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
        // Configuration optimisée de la texture pour éviter les triangles noirs
        texture.wrapS = texture.wrapT = RepeatWrapping;

        // Amélioration du filtrage pour éviter les artefacts en zoom
        texture.minFilter = LinearMipmapLinearFilter; // Meilleur filtrage pour zoom arrière
        texture.magFilter = LinearFilter;             // Meilleur filtrage pour zoom avant

        // Génération des mipmaps pour différents niveaux de détail
        texture.generateMipmaps = true;
        texture.anisotropy = 16;  // Améliore la qualité des textures en angle

        // Application de la texture
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
        console.warn(`⚠️ Échec chargement: ${currentPath}`, error);
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
        // Configuration optimisée identique
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;

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