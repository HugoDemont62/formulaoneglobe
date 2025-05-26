import { getWebGL } from '../index.js';

export default class UI {
    constructor() {
        this.webgl = getWebGL();
        this.el = document.querySelector('.slider');
        this.buttons = this.el.querySelectorAll('button');
        this.active = null;
        this.init();
    }

    init() {
        this.buttons.forEach(el => {
            el.addEventListener('click', this.onClick.bind(this));
        });
    }

    onClick(value) {
        const el = value.target;
        const index = el.getAttribute('data-index');
        if (this.active) this.active.classList.toggle('active');
        this.active = this.buttons[index];
        this.active.classList.toggle('active');
        this.webgl.slider.setSlide(index);
    }

    destroy() {}
}
