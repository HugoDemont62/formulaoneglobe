import { Vector2 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const gltfLoader = new GLTFLoader();

export function loadGLTF(url, opts) {
    return new Promise((res, rej) => {
        gltfLoader.load(url, data => {
            opts.onLoad(data);
            res(data);
        });
    });
}

export function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

export const mousePos = new Vector2();
window.addEventListener('mousemove', onMove);

function onMove(e) {
    mousePos.set(e.x, e.y);
}
