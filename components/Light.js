// components/Light.js
import {
  DirectionalLight,
  AmbientLight,
  PointLight,
  Color
} from 'three';
import { getWebGL } from '../index.js';

export default class Light {
  constructor() {
    this.webgl = getWebGL();
    this.scene = this.webgl.scene;

    this.createAmbientLight();
    this.createDirectionalLight();
    this.createPointLights();
    this.createPaneFolder();
  }

  createAmbientLight() {
    // Lumière ambiante douce pour éclairer uniformément le globe
    this.ambientLight = new AmbientLight(0x404040, 0.3);
    this.scene.add(this.ambientLight);
  }

  createDirectionalLight() {
    // Lumière directionnelle principale (simule le soleil)
    this.directionalLight = new DirectionalLight(0xffffff, 1.2);
    this.directionalLight.position.set(5, 3, 5);

    this.scene.add(this.directionalLight);
  }

  createPointLights() {
    // Lumières ponctuelles pour mettre en valeur les marqueurs F1
    this.pointLights = [];

    // Lumière rouge pour l'effet F1
    const redLight = new PointLight(0xff0000, 0.5, 10);
    redLight.position.set(3, 2, 3);
    this.pointLights.push(redLight);
    this.scene.add(redLight);

    // Lumière bleue pour contraster
    const blueLight = new PointLight(0x0066ff, 0.3, 8);
    blueLight.position.set(-3, 2, -3);
    this.pointLights.push(blueLight);
    this.scene.add(blueLight);

    // Lumière d'appoint blanche
    const whiteLight = new PointLight(0xffffff, 0.4, 12);
    whiteLight.position.set(0, 5, 0);
    this.pointLights.push(whiteLight);
    this.scene.add(whiteLight);
  }

  createPaneFolder() {
    const folder = this.webgl.gui.addFolder({
      title: 'Lighting Controls',
      expanded: false
    });

    // Contrôles pour la lumière ambiante
    const ambientFolder = folder.addFolder({
      title: 'Ambient Light',
      expanded: false
    });

    ambientFolder.addBinding(this.ambientLight, 'intensity', {
      label: 'Intensity',
      min: 0,
      max: 2,
      step: 0.1
    });

    ambientFolder.addBinding(this.ambientLight.color, 'r', {
      label: 'Red',
      min: 0,
      max: 1,
      step: 0.01
    });

    ambientFolder.addBinding(this.ambientLight.color, 'g', {
      label: 'Green',
      min: 0,
      max: 1,
      step: 0.01
    });

    ambientFolder.addBinding(this.ambientLight.color, 'b', {
      label: 'Blue',
      min: 0,
      max: 1,
      step: 0.01
    });

    // Contrôles pour la lumière directionnelle
    const directionalFolder = folder.addFolder({
      title: 'Directional Light',
      expanded: false
    });

    directionalFolder.addBinding(this.directionalLight, 'intensity', {
      label: 'Intensity',
      min: 0,
      max: 3,
      step: 0.1
    });

    directionalFolder.addBinding(this.directionalLight.position, 'x', {
      label: 'Position X',
      min: -10,
      max: 10,
      step: 0.5
    });

    directionalFolder.addBinding(this.directionalLight.position, 'y', {
      label: 'Position Y',
      min: -10,
      max: 10,
      step: 0.5
    });

    directionalFolder.addBinding(this.directionalLight.position, 'z', {
      label: 'Position Z',
      min: -10,
      max: 10,
      step: 0.5
    });

    // Contrôles pour les lumières ponctuelles
    const pointFolder = folder.addFolder({
      title: 'Point Lights',
      expanded: false
    });

    pointFolder.addBinding(this.pointLights[0], 'intensity', {
      label: 'Red Light Intensity',
      min: 0,
      max: 2,
      step: 0.1
    });

    pointFolder.addBinding(this.pointLights[1], 'intensity', {
      label: 'Blue Light Intensity',
      min: 0,
      max: 2,
      step: 0.1
    });

    pointFolder.addBinding(this.pointLights[2], 'intensity', {
      label: 'White Light Intensity',
      min: 0,
      max: 2,
      step: 0.1
    });

    // Presets d'éclairage
    folder.addButton({
      title: 'Day Mode'
    }).on('click', () => {
      this.setDayMode();
    });

    folder.addButton({
      title: 'Night Mode'
    }).on('click', () => {
      this.setNightMode();
    });

    folder.addButton({
      title: 'F1 Mode'
    }).on('click', () => {
      this.setF1Mode();
    });
  }

  setDayMode() {
    // Mode jour : éclairage naturel
    this.ambientLight.intensity = 0.4;
    this.ambientLight.color.setHex(0x404040);

    this.directionalLight.intensity = 1.5;
    this.directionalLight.color.setHex(0xffffff);
    this.directionalLight.position.set(5, 5, 5);

    this.pointLights.forEach(light => {
      light.intensity = 0.2;
    });
  }

  setNightMode() {
    // Mode nuit : éclairage tamisé avec accent sur les points F1
    this.ambientLight.intensity = 0.1;
    this.ambientLight.color.setHex(0x202040);

    this.directionalLight.intensity = 0.3;
    this.directionalLight.color.setHex(0x8888ff);

    this.pointLights[0].intensity = 0.8; // Rouge plus intense
    this.pointLights[1].intensity = 0.4; // Bleu modéré
    this.pointLights[2].intensity = 0.2; // Blanc faible
  }

  setF1Mode() {
    // Mode F1 : éclairage dramatique rouge et blanc
    this.ambientLight.intensity = 0.2;
    this.ambientLight.color.setHex(0x330011);

    this.directionalLight.intensity = 1.0;
    this.directionalLight.color.setHex(0xffffff);

    this.pointLights[0].intensity = 1.2; // Rouge F1
    this.pointLights[0].color.setHex(0xff0000);
    this.pointLights[1].intensity = 0.1; // Bleu faible
    this.pointLights[2].intensity = 0.8; // Blanc contrasté
  }

  update() {
    // Animation subtile des lumières ponctuelles
    const time = Date.now() * 0.001;

    this.pointLights.forEach((light, index) => {
      const originalIntensity = light.userData?.originalIntensity || light.intensity;
      if (!light.userData?.originalIntensity) {
        light.userData = { originalIntensity: light.intensity };
      }

      // Variation subtile de l'intensité
      light.intensity = originalIntensity + Math.sin(time + index * 2) * 0.1;
    });

    // Rotation lente de la lumière directionnelle pour simuler le mouvement du soleil
    this.directionalLight.position.x = Math.cos(time * 0.1) * 5;
    this.directionalLight.position.z = Math.sin(time * 0.1) * 5;
  }
}