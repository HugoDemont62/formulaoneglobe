// shaders/earth.glsl
// Vertex shader pour la Terre
export const earthVertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // Légère déformation pour simuler les vents atmosphériques
    vec3 pos = position;
    pos.x += sin(time * 0.5 + position.y * 5.0) * 0.001;
    pos.z += cos(time * 0.3 + position.x * 3.0) * 0.001;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Fragment shader pour la Terre avec effets jour/nuit
export const earthFragmentShader = `
uniform float time;
uniform sampler2D earthDay;
uniform sampler2D earthNight;
uniform sampler2D earthClouds;
uniform vec3 sunDirection;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    // Textures de base
    vec3 dayColor = texture2D(earthDay, vUv).rgb;
    vec3 nightColor = texture2D(earthNight, vUv).rgb;
    vec3 clouds = texture2D(earthClouds, vUv + time * 0.0001).rgb;

    // Calcul de l'éclairage du soleil
    float sunAlignment = dot(vNormal, sunDirection);
    float dayIntensity = smoothstep(-0.1, 0.1, sunAlignment);

    // Mélange jour/nuit
    vec3 earthColor = mix(nightColor * 0.3, dayColor, dayIntensity);

    // Ajout des nuages avec transparence
    earthColor = mix(earthColor, clouds, clouds.r * 0.4);

    // Effet atmosphérique sur les bords
    float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
    earthColor = mix(earthColor, atmosphereColor, fresnel * 0.1);

    gl_FragColor = vec4(earthColor, 1.0);
}
`;

// Shader pour l'atmosphère avancée
export const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragmentShader = `
uniform float time;
uniform float opacity;
uniform vec3 sunDirection;

varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

    // Couleurs de l'atmosphère qui changent selon l'angle du soleil
    vec3 atmosphereBlue = vec3(0.3, 0.6, 1.0);
    vec3 atmosphereOrange = vec3(1.0, 0.7, 0.3);

    float sunEffect = dot(vNormal, sunDirection);
    vec3 atmosphere = mix(atmosphereBlue, atmosphereOrange, max(0.0, sunEffect * 0.5));

    atmosphere *= intensity;

    // Effet de scintillement atmosphérique
    float twinkle = sin(time * 3.0 + vPositionNormal.x * 20.0 + vPositionNormal.y * 15.0) * 0.1 + 0.9;
    atmosphere *= twinkle;

    gl_FragColor = vec4(atmosphere, intensity * opacity);
}
`;

// Shader pour les aurores boréales (bonus!)
export const auroraVertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;
    // Animation ondulante pour les aurores
    pos.y += sin(time * 2.0 + pos.x * 5.0) * 0.02;
    pos.x += cos(time * 1.5 + pos.z * 3.0) * 0.01;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const auroraFragmentShader = `
uniform float time;
uniform float opacity;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // Couleurs des aurores
    vec3 green = vec3(0.0, 1.0, 0.3);
    vec3 blue = vec3(0.0, 0.3, 1.0);
    vec3 purple = vec3(0.8, 0.0, 1.0);

    // Patterns d'aurores basés sur UV et temps
    float pattern1 = sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
    float pattern2 = sin(vUv.y * 8.0 + time * 1.5) * 0.5 + 0.5;
    float pattern3 = sin((vUv.x + vUv.y) * 6.0 + time * 3.0) * 0.5 + 0.5;

    // Mélange des couleurs selon les patterns
    vec3 color = mix(green, blue, pattern1);
    color = mix(color, purple, pattern2 * 0.5);

    // Intensité basée sur la position (plus fort aux pôles)
    float poleIntensity = abs(vUv.y - 0.5) * 2.0;
    poleIntensity = smoothstep(0.7, 1.0, poleIntensity);

    // Fresnel pour n'afficher que sur les bords
    float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
    fresnel = smoothstep(0.5, 1.0, fresnel);

    float finalIntensity = pattern3 * poleIntensity * fresnel * opacity;

    gl_FragColor = vec4(color, finalIntensity);
}
`;