import { AxesHelper, CameraHelper, Object3D, PerspectiveCamera, Vector2 } from 'three';
import { getWebGL } from '../index.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mousePos } from '../utils.js';
import { map, lerp } from '../utils.js';

export default class Camera {
    constructor() {
        this.webgl = getWebGL();
        this.scene = this.webgl.scene;

        this.main = this.createCamera();
        this.debug = this.createDebug();

        this.active = this.main;

        this.createPaneFolder();

        this.resize();
    }

    createCamera() {
        const camera = new PerspectiveCamera(55, this.webgl.viewportRatio, 0.01, 100);
        const helper = new CameraHelper(camera);

        camera.position.set(0, 0, 2);
        camera.lookAt(0, 0, 0);

        // this.scene.add(helper);
        this.scene.add(camera);
        return camera;
    }

    createDebug() {
        const camera = new PerspectiveCamera(55, this.webgl.viewportRatio, 0.01, 100);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        this.scene.add(camera);
        this.orbitControl = new OrbitControls(camera, this.webgl.canvas);
        return camera;
    }

    createPaneFolder() {
        const folder = this.webgl.gui.addFolder({ title: 'Cameras', expanded: true });
        const opts = [
            { text: 'Main', value: this.main },
            { text: 'Debug', value: this.debug },
        ];

        folder
            .addBlade({
                view: 'list',
                label: 'Cameras',
                options: opts,
                value: this.active,
            })
            .on('change', e => {
                this.setCamera(e.value);
            });
    }

    setCamera(value) {
        this.active = value;
    }

    init() {}

    update() {
        this.orbitControl?.update();

        const x = map(mousePos.x, 0, this.webgl.viewport.x, -1, 1);
        const y = map(mousePos.y, 0, this.webgl.viewport.y, -1, 1);

        const mult = 0.8;
        this.main.position.x = lerp(this.main.position.x, x * mult, 0.05);
        this.main.position.y = lerp(this.main.position.y, -y * mult, 0.05);

        this.main.lookAt(0, 0, 0);
    }

    resize() {
        this.main.aspect = this.webgl.viewportRatio;
        this.main.updateProjectionMatrix();

        this.debug.aspect = this.webgl.viewportRatio;
        this.debug.updateProjectionMatrix();
    }
}
