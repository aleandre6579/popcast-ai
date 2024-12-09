import * as THREE from 'three';

export const GlitchShader = {
  uniforms: {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2() },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_resolution;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 st = vUv * u_resolution.xy / min(u_resolution.x, u_resolution.y);
      float glitch = step(0.9, random(vec2(st.x * sin(u_time), st.y + cos(u_time))));
      gl_FragColor = vec4(vec3(glitch), 1.0);
    }
  `,
};
