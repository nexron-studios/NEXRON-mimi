<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { useRecorderStore } from '@/stores/recorder'

const canvas = ref<HTMLCanvasElement | null>(null)

const settings = useSettingsStore()
const recorder = useRecorderStore()
const { theme } = storeToRefs(settings)
const { status, level } = storeToRefs(recorder)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let mesh: THREE.Mesh | null = null
let material: THREE.ShaderMaterial | null = null
let frame = 0
let smoothedLevel = 0
const timer = new THREE.Timer()

const palette = {
  dark: {
    bg: new THREE.Color('#141021'),
    a: new THREE.Color('#2a2170'),
    b: new THREE.Color('#6d5cff'),
    c: new THREE.Color('#c061ff'),
  },
  light: {
    bg: new THREE.Color('#f1eefb'),
    a: new THREE.Color('#d9d2ff'),
    b: new THREE.Color('#a890ff'),
    c: new THREE.Color('#7c5cff'),
  },
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_level;
  uniform vec2 u_res;
  uniform vec3 u_bg;
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;
  uniform vec3 u_colorC;

  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      s += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec2 p = (vUv - 0.5);
    p.x *= u_res.x / u_res.y;

    float t = u_time * 0.05;
    float lvl = u_level;
    float scale = 1.5 + lvl * 0.6;

    vec2 q = vec2(
      fbm(p * scale + vec2(0.0, t)),
      fbm(p * scale + vec2(5.2, t * 1.3))
    );
    vec2 r = vec2(
      fbm(p * scale + q * 1.2 + vec2(1.7, 9.2) + t * 0.8),
      fbm(p * scale + q * 1.2 + vec2(8.3, 2.8) + t * 0.7)
    );
    float n = fbm(p * scale + r * 1.4 + t * 0.5);

    float f = smoothstep(-0.6, 0.85, n);
    vec3 col = u_bg;
    col = mix(col, u_colorA, smoothstep(0.15, 0.9, f + 0.15 * sin(t * 2.0)));
    col = mix(col, u_colorB, smoothstep(0.35, 1.0, length(q) * 0.85));
    col = mix(col, u_colorC, smoothstep(0.55, 1.1, length(r)));

    float glow = clamp(1.0 - length(p) * 0.85, 0.0, 1.0);
    col += u_colorC * glow * (0.06 + lvl * 0.55);

    col *= 1.0 - 0.28 * length(p);

    gl_FragColor = vec4(col, 1.0);
  }
`

const applyTheme = () => {
  if (!material) return
  const p = palette[theme.value]
  material.uniforms.u_bg.value.copy(p.bg)
  material.uniforms.u_colorA.value.copy(p.a)
  material.uniforms.u_colorB.value.copy(p.b)
  material.uniforms.u_colorC.value.copy(p.c)
}

const animate = () => {
  frame = requestAnimationFrame(animate)
  if (!renderer || !scene || !camera || !material) return

  timer.update()
  const target = status.value === 'recording' ? level.value : 0
  smoothedLevel += (target - smoothedLevel) * 0.08

  material.uniforms.u_time.value = timer.getElapsed()
  material.uniforms.u_level.value = smoothedLevel
  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!renderer || !material || !canvas.value) return
  const { clientWidth, clientHeight } = canvas.value
  renderer.setSize(clientWidth, clientHeight, false)
  material.uniforms.u_res.value.set(clientWidth, clientHeight)
}

watch(theme, applyTheme)

onMounted(() => {
  if (!canvas.value) return
  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_level: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_bg: { value: new THREE.Color() },
      u_colorA: { value: new THREE.Color() },
      u_colorB: { value: new THREE.Color() },
      u_colorC: { value: new THREE.Color() },
    },
  })

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  applyTheme()
  handleResize()
  window.addEventListener('resize', handleResize)
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', handleResize)
  mesh?.geometry.dispose()
  material?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
</template>
