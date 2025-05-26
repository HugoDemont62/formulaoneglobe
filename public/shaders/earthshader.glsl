export const earthFragmentShader = `
uniform sampler2D earthDay;
uniform sampler2D earthNight;
uniform vec3 sunDirection;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    float intensity = dot(normalize(vNormal), normalize(sunDirection));
    intensity = clamp(intensity, 0.0, 1.0);

    vec2 uv = vec2(
        atan(vPosition.z, vPosition.x) / (2.0 * 3.1415926) + 0.5,
        asin(vPosition.y / length(vPosition)) / 3.1415926 + 0.5
    );

    vec3 dayColor = texture2D(earthDay, uv).rgb;
    vec3 nightRaw = texture2D(earthNight, uv).rgb;

    // 🔆 Teinte jaune + boost
    vec3 nightColor = nightRaw * vec3(1.8, 1.5, 0.6); // plus chaud et plus intense

    // 💡 Mélange progressif entre nuit et jour
    float fade = smoothstep(0.0, 0.3, intensity); // transition douce
    vec3 finalColor = mix(nightColor, dayColor, fade);

    gl_FragColor = vec4(finalColor, 1.0);
}
`;
