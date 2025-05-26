// components/Globe/EarthSphere.js - Avec décalage de texture
import {
  SphereGeometry,
  Mesh,
  TextureLoader,
  ShaderMaterial,
  Vector3,
  Group,
  Vector2
} from 'three';

export default class EarthSphere {
  constructor() {
    this.textureLoader = new TextureLoader();
    this.mesh = null;
    this.earthGroup = new Group();
    this.markersGroup = new Group();

    // NOUVEAUX PARAMÈTRES pour décaler la texture
    this.textureOffset = new Vector2(0.0, 0.0); // Décalage U, V
    this.textureRotation = 0; // Rotation de la texture en radians

    this.ready = this.init();
  }

  async init() {
    const [vertexShader, fragmentShader] = await this.createShaders();

    const [dayTex, nightTex] = await Promise.all([
      this.loadTexture('./assets/earth_color.webp'),
      this.loadTexture('./assets/earth_lights.webp')
    ]);

    const uniforms = {
      earthDay: { value: dayTex },
      earthNight: { value: nightTex },
      sunDirection: { value: new Vector3(1.0, 0.2, 1.0).normalize() },
      // NOUVEAUX UNIFORMS pour le décalage
      uTextureOffset: { value: this.textureOffset },
      uTextureRotation: { value: this.textureRotation }
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new SphereGeometry(1, 128, 128);
    this.mesh = new Mesh(geometry, material);

    // Orientation de base
    this.mesh.rotation.y = Math.PI;

    this.earthGroup.add(this.mesh);
    this.earthGroup.add(this.markersGroup);

    console.log('🌍 Terre créée avec contrôle décalage texture');
  }

  /**
   * MÉTHODES pour ajuster la texture en temps réel
   */
  setTextureOffset(offsetX, offsetY) {
    this.textureOffset.set(offsetX, offsetY);
    if (this.mesh && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.uTextureOffset.value = this.textureOffset;
    }
    console.log(`🔄 Décalage texture: ${offsetX}, ${offsetY}`);
  }

  setTextureRotation(rotation) {
    this.textureRotation = rotation;
    if (this.mesh && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.uTextureRotation.value = this.textureRotation;
    }
    console.log(`🔄 Rotation texture: ${rotation} radians`);
  }

  /**
   * Méthodes rapides pour ajustements courants
   */
  offsetTextureEast(amount = 0.1) {
    this.setTextureOffset(this.textureOffset.x + amount, this.textureOffset.y);
  }

  offsetTextureWest(amount = 0.1) {
    this.setTextureOffset(this.textureOffset.x - amount, this.textureOffset.y);
  }

  offsetTextureNorth(amount = 0.1) {
    this.setTextureOffset(this.textureOffset.x, this.textureOffset.y + amount);
  }

  offsetTextureSouth(amount = 0.1) {
    this.setTextureOffset(this.textureOffset.x, this.textureOffset.y - amount);
  }

  /**
   * Crée les shaders avec support du décalage de texture
   */
  async createShaders() {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D earthDay;
      uniform sampler2D earthNight;
      uniform vec3 sunDirection;
      uniform vec2 uTextureOffset;
      uniform float uTextureRotation;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      // Fonction pour faire tourner les coordonnées UV
      vec2 rotateUV(vec2 uv, float rotation) {
        float cosAngle = cos(rotation);
        float sinAngle = sin(rotation);
        
        // Centrer autour de (0.5, 0.5)
        uv -= 0.5;
        
        // Appliquer la rotation
        uv = mat2(cosAngle, -sinAngle, sinAngle, cosAngle) * uv;
        
        // Remettre dans l'espace [0,1]
        uv += 0.5;
        
        return uv;
      }

      void main() {
        // Appliquer le décalage et la rotation aux coordonnées UV
        vec2 adjustedUV = vUv + uTextureOffset;
        adjustedUV = rotateUV(adjustedUV, uTextureRotation);
        
        // S'assurer que les UV restent dans [0,1] avec wrapping
        adjustedUV = fract(adjustedUV);

        vec3 viewDirection = normalize(vPosition - cameraPosition);
        vec3 normal = normalize(vNormal);
        
        float sunOrientation = dot(sunDirection, normal);
        float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
        
        // Utiliser les UV ajustées pour échantillonner les textures
        vec3 dayColor = texture2D(earthDay, adjustedUV).rgb;
        vec3 nightColor = texture2D(earthNight, adjustedUV).rgb;
        
        vec3 color = mix(nightColor, dayColor, dayMix);
        
        // Effet atmosphérique simple
        float fresnel = dot(viewDirection, normal) + 1.0;
        fresnel = pow(fresnel, 2.0);
        
        vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
        color = mix(color, atmosphereColor, fresnel * 0.1);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return [vertexShader, fragmentShader];
  }

  async loadShaders() {
    // Fallback vers fichier externe si disponible
    try {
      const response = await fetch('/shaders/earth.glsl');
      const text = await response.text();

      const vertexMatch = text.match(/export const earthVertexShader = `([\s\S]*?)`;/);
      const fragmentMatch = text.match(/export const earthFragmentShader = `([\s\S]*?)`;/);

      if (vertexMatch && fragmentMatch) {
        return [vertexMatch[1], fragmentMatch[1]];
      }
    } catch (error) {
      console.log('📄 Utilisation des shaders intégrés');
    }

    // Utiliser les shaders intégrés
    return this.createShaders();
  }

  loadTexture(path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(path, resolve, undefined, reject);
    });
  }

  addMarkersToEarth(markersArray) {
    while(this.markersGroup.children.length > 0) {
      this.markersGroup.remove(this.markersGroup.children[0]);
    }

    markersArray.forEach(markerGroup => {
      this.markersGroup.add(markerGroup);
    });

    console.log(`📍 ${markersArray.length} marqueurs attachés à la terre`);
  }

  getEarthGroupWithMarkers() {
    return this.earthGroup;
  }

  update() {
    if (this.mesh && this.mesh.material.uniforms) {
      // Rotation de la terre
      this.earthGroup.rotation.y += 0.0005;

      // Recalculer la direction du soleil
      const worldSunDirection = new Vector3(1, 0.2, 1).normalize();
      const inverseMatrix = this.earthGroup.matrixWorld.clone().invert();
      worldSunDirection.applyMatrix4(inverseMatrix);

      this.mesh.material.uniforms.sunDirection.value.copy(worldSunDirection);
    }
  }

  getMesh() {
    return this.mesh;
  }

  getCompleteGroup() {
    return this.earthGroup;
  }

  getMarkersGroup() {
    return this.markersGroup;
  }

  dispose() {
    this.mesh?.geometry.dispose();
    this.mesh?.material.dispose();

    while(this.earthGroup.children.length > 0) {
      this.earthGroup.remove(this.earthGroup.children[0]);
    }

    while(this.markersGroup.children.length > 0) {
      this.markersGroup.remove(this.markersGroup.children[0]);
    }
  }
}