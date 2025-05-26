import gsap from 'gsap';
import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import Camera from './components/Camera';
import Cube from './components/Cube';
import { Pane } from 'tweakpane';
import Slider from './components/Slider';
import Light from './components/Light';

import { loadGLTF } from './utils.js';
import UI from './components/UI';

let canvas, webgl, renderer;

webgl = {};

canvas = document.createElement('canvas');
const app = document.querySelector('#app');
app.appendChild(canvas);

async function init() {
    webgl.canvas = canvas;

    const pr = window.devicePixelRatio;
    renderer = new WebGLRenderer({
        canvas,
    });
    renderer.setPixelRatio(pr);

    // DOM
    webgl.viewport = new Vector2();
    webgl.gui = new Pane();

    resize();

    await preload();

    start();

    // Start Update
    gsap.ticker.add(update);
}

async function preload() {
    await loadGLTF('/models/model.glb', {
        onLoad: gltf => {
            const scene = gltf.scene;

            scene.traverse(node => {
                if (node.name === 'TEE') {
                    webgl.shirt = node;
                }
            });
        },
    });
}

function start() {
    webgl.scene = new Scene();
    webgl.slider = new Slider();
    webgl.camera = new Camera();
    webgl.light = new Light();

    webgl.ui = new UI();

    webgl.cube = new Cube();
}

function update(time, deltaTime, frame) {
    webgl.camera.update();
    webgl.cube.update();

    webgl.slider.slides.forEach(slide => {
        slide?.update();
    });
    render();
}

function render() {
    renderer.render(webgl.scene, webgl.camera.active);
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    webgl.viewportRatio = width / height;
    webgl.viewport.set(width, height);
    webgl.pixelRatio = window.devicePixelRatio;

    webgl.camera?.resize();

    renderer?.setSize(width, height);
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', resize);

export function getWebGL() {
    return webgl;
}
