// utils/texture-utils.js
import {
  TextureLoader,
  RepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  MeshPhongMaterial
} from 'three';

/**
 * Utilitaires pour gérer les textures dans l'application
 */
const textureLoader = new TextureLoader();

/**
 * Charge une texture avec des paramètres optimisés pour éviter les artefacts visuels
 * @param {string} path - Chemin de la texture
 * @param {Object} options - Options additionnelles pour la texture
 * @returns {Promise} - Promise contenant la texture ou une erreur
 */
export function loadOptimizedTexture(path, options = {}) {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      path,
      (texture) => {
        // Paramètres par défaut pour une meilleure qualité
        texture.wrapS = texture.wrapT = options.wrap || RepeatWrapping;
        texture.minFilter = options.minFilter || LinearMipmapLinearFilter;
        texture.magFilter = options.magFilter || LinearFilter;
        texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : true;
        texture.anisotropy = options.anisotropy || 16;

        if (options.repeat) {
          texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
        }

        if (options.offset) {
          texture.offset.set(options.offset.x || 0, options.offset.y || 0);
        }

        if (options.flipY !== undefined) {
          texture.flipY = options.flipY;
        }

        resolve(texture);
      },
      // Progress callback
      (progress) => {
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
      // Error callback
      (error) => {
        console.error(`❌ Erreur de chargement de texture: ${path}`, error);
        reject(error);
      }
    );
  });
}

/**
 * Crée un matériau standard avec texture optimisée pour la terre
 * @param {string} texturePath - Chemin de la texture
 * @param {Object} materialOptions - Options pour le matériau
 * @returns {Promise<MeshStandardMaterial>} - Promise contenant le matériau créé
 */
export async function createEarthMaterial(texturePath, materialOptions = {}) {
  try {
    const texture = await loadOptimizedTexture(texturePath);

    // Options par défaut pour un matériau terre
    const options = {
      map: texture,
      roughness: 1.0,
      metalness: 0.0,
      color: 0xffffff,
      ...materialOptions
    };

    return new MeshStandardMaterial(options);
  } catch (error) {
    console.error('❌ Erreur création matériau terre:', error);

    // Matériau de fallback
    return new MeshStandardMaterial({
      roughness: 1.0,
      metalness: 0.0
    });
  }
}

/**
 * Crée un matériau Phong avec texture optimisée (moins gourmand en ressources)
 * @param {string} texturePath - Chemin de la texture
 * @param {Object} materialOptions - Options pour le matériau
 * @returns {Promise<MeshPhongMaterial>} - Promise contenant le matériau créé
 */
export async function createOptimizedPhongMaterial(texturePath, materialOptions = {}) {
  try {
    const texture = await loadOptimizedTexture(texturePath);

    // Options par défaut pour un matériau Phong
    const options = {
      map: texture,
      color: 0xffffff,
      shininess: 30,
      specular: 0x222222,
      ...materialOptions
    };

    return new MeshPhongMaterial(options);
  } catch (error) {
    console.error('❌ Erreur création matériau phong:', error);

    // Matériau de fallback
    return new MeshPhongMaterial({
      shininess: 30,
      specular: 0x222222
    });
  }
}