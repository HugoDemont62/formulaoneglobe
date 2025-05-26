import {
  SphereGeometry,
  Mesh,
  TextureLoader,
  ShaderMaterial,
  Vector3
} from 'three';

export default class EarthSphere {
  constructor() {
    this.textureLoader = new TextureLoader();
    this.mesh = null;
    this.clock = null;
    this.ready = this.init();
  }

  async init() {
    const [vertexShader, fragmentShader] = await this.loadShaders();

    const [dayTex, nightTex] = await Promise.all([
      this.loadTexture('./assets/earth_color.webp'),
      this.loadTexture('./assets/earth_lights.webp')
    ]);

    const uniforms = {
      earthDay: { value: dayTex },
      earthNight: { value: nightTex },
      sunDirection: { value: new Vector3(1.0, 0.2, 1.0).normalize() }
    };

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new SphereGeometry(1, 128, 128);
    this.mesh = new Mesh(geometry, material);
    this.mesh.rotation.y = Math.PI;
  }

  async loadShaders() {
    const response = await fetch('/shaders/earth.glsl');
    const text = await response.text();

    const vertexMatch = text.match(/export const earthVertexShader = `([\s\S]*?)`;/);
    const fragmentMatch = text.match(/export const earthFragmentShader = `([\s\S]*?)`;/);

    return [vertexMatch[1], fragmentMatch[1]];
  }

  loadTexture(path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(path, resolve, undefined, reject);
    });
  }

  update() {
    if (this.mesh && this.mesh.material.uniforms) {
      // Tourne la Terre
      this.mesh.rotation.y += 0.0005;

      // Recalculer la direction du soleil en repère local
      const worldSunDirection = new Vector3(1, 0.2, 1).normalize();

      // Appliquer l'inverse de la rotation du globe à la direction du soleil
      const inverseMatrix = this.mesh.matrixWorld.clone().invert();
      worldSunDirection.applyMatrix4(inverseMatrix);

      this.mesh.material.uniforms.sunDirection.value.copy(worldSunDirection);
    }
  }


  getMesh() {
    return this.mesh;
  }

  dispose() {
    this.mesh?.geometry.dispose();
    this.mesh?.material.dispose();
  }
}
