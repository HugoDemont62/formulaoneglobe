// components/Globe/AtmosphereShader.js - Halo smooth avec sync jour/nuit
import {
  SphereGeometry,
  Mesh,
  ShaderMaterial,
  BackSide,
  AdditiveBlending,
  Color,
  Vector3
} from 'three';

export default class AtmosphereShader {
  constructor() {
    this.atmosphereMesh = null;
    this.createSmoothHalo();
  }

  /**
   * Crée un halo léger et discret
   */
  createSmoothHalo() {
    console.log('🌌 Création du halo atmosphérique léger...');

    // Sphère plus proche de la terre et moins de subdivisions
    const atmosphereGeometry = new SphereGeometry(1.08, 32, 32);

    // Shader vertex simplifié
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Shader fragment ultra-léger
    const fragmentShader = `
      uniform float uIntensity;
      uniform vec3 uSunDirection;
      
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        // Direction de la caméra
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        
        // Fresnel très subtil
        float fresnel = 1.0 - dot(viewDirection, vNormal);
        fresnel = pow(fresnel, 4.0);
        
        // Couleur de base très légère
        vec3 baseColor = vec3(0.3, 0.6, 1.0);
        
        // Opacité très faible
        float alpha = fresnel * uIntensity;
        
        gl_FragColor = vec4(baseColor, alpha);
      }
    `;

    // Matériau minimaliste
    const atmosphereMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uIntensity: { value: 0.15 },  // Très léger
        uSunDirection: { value: new Vector3(1.0, 0.2, 1.0).normalize() }
      },
      transparent: true,
      blending: AdditiveBlending,
      side: BackSide,
      depthWrite: false
    });

    this.atmosphereMesh = new Mesh(atmosphereGeometry, atmosphereMaterial);

    console.log('✅ Halo atmosphérique léger créé');
  }

  /**
   * Ajuste l'intensité (très léger par défaut)
   */
  setIntensity(intensity) {
    if (this.atmosphereMesh && this.atmosphereMesh.material.uniforms) {
      this.atmosphereMesh.material.uniforms.uIntensity.value = intensity;
    }
  }

  /**
   * Méthode vide pour compatibilité (pas utilisée dans la version légère)
   */
  setSunDirection(sunDirection) {
    // Méthode vide pour éviter l'erreur, pas utilisée dans la version légère
  }

  /**
   * Pas d'animation par défaut pour rester léger
   */
  update(time) {
    // Rien pour rester ultra-léger
  }

  /**
   * Presets minimalistes
   */
  applyPreset(preset) {
    switch(preset) {
      case 'subtle':
        this.setIntensity(0.1);
        break;

      case 'normal':
        this.setIntensity(0.15);
        break;

      case 'visible':
        this.setIntensity(0.25);
        break;

      default:
        this.setIntensity(0.15);
    }
  }

  /**
   * Active/désactive le halo
   */
  setVisible(visible) {
    if (this.atmosphereMesh) {
      this.atmosphereMesh.visible = visible;
    }
  }

  /**
   * Retourne le mesh
   */
  getMesh() {
    return this.atmosphereMesh;
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    if (this.atmosphereMesh) {
      if (this.atmosphereMesh.geometry) this.atmosphereMesh.geometry.dispose();
      if (this.atmosphereMesh.material) this.atmosphereMesh.material.dispose();
    }
  }
}