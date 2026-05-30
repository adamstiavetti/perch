"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./page.module.css";

const TEXTURES = {
  day: "/cinematic/textures/deadhead-earth-albedo-v4.webp",
  night: "/cinematic/textures/deadhead-earth-emission-v4.webp",
  nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
  clouds: "/cinematic/textures/deadhead-earth-clouds-v4.webp",
  oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
  desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
  iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
};

const INITIAL_GLOBE_ROTATION = {
  x: 0.2,
  y: -0.78,
  z: -0.025,
};

export default function LiveGlobeProofPage() {
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const handleGlobeReady = useCallback(() => setIsGlobeReady(true), []);

  return (
    <main className={styles.page} aria-label="Deadhead live globe proof lab">
      <div className={styles.backgroundPlate} />
      <div className={styles.wakeLayer} />
      <LiveGlobeCanvas onReady={handleGlobeReady} />
      <div className={styles.topGlowLayer} />
      <div className={styles.vignetteLayer} />
      <div className={`${styles.loadingLayer} ${isGlobeReady ? styles.loadingLayerReady : ""}`} aria-hidden="true">
        <div className={styles.loadingOrb} />
        <div className={styles.loadingLine} />
      </div>
      <h1 className={styles.srOnly}>Live CGTrader Earth globe proof</h1>
    </main>
  );
}

function LiveGlobeCanvas({ onReady }: { onReady: () => void }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      mount.dataset.webgl = "unavailable";
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    const clock = new THREE.Clock();
    const globeRig = new THREE.Group();
    let frame = 0;
    let disposed = false;

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(globeRig);
    scene.add(new THREE.AmbientLight(0x08182a, 0.28));

    const coolFill = new THREE.DirectionalLight(0x4aa4ff, 1.25);
    coolFill.position.set(-2.8, 2.15, 3.4);
    scene.add(coolFill);

    const softKey = new THREE.DirectionalLight(0xf3f8ff, 0.88);
    softKey.position.set(2.5, 2.7, 4.0);
    scene.add(softKey);

    const rim = new THREE.DirectionalLight(0x1598ff, 4.4);
    rim.position.set(-3.8, 3.4, -2.2);
    scene.add(rim);

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = () => {
      window.setTimeout(() => {
        if (!disposed) {
          onReady();
        }
      }, 180);
    };
    loadingManager.onError = () => {
      if (!disposed) {
        onReady();
      }
    };

    const textureLoader = new THREE.TextureLoader(loadingManager);
    const loadTexture = (path: string, colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace) => {
      const texture = textureLoader.load(path);
      texture.colorSpace = colorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const dayMap = loadTexture(TEXTURES.day);
    const nightMap = loadTexture(TEXTURES.night);
    const nightHaloMap = loadTexture(TEXTURES.nightHalo);
    const cloudMap = loadTexture(TEXTURES.clouds);
    const oceanMaskMap = loadTexture(TEXTURES.oceanMask, THREE.NoColorSpace);
    const desertMaskMap = loadTexture(TEXTURES.desertMask, THREE.NoColorSpace);
    const iceMaskMap = loadTexture(TEXTURES.iceMask, THREE.NoColorSpace);

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: dayMap },
        nightMap: { value: nightMap },
        cloudMap: { value: cloudMap },
        oceanMaskMap: { value: oceanMaskMap },
        desertMaskMap: { value: desertMaskMap },
        iceMaskMap: { value: iceMaskMap },
        lightDirection: { value: new THREE.Vector3(0.28, 0.42, 0.86).normalize() },
        oceanTint: { value: new THREE.Color(0x010f26) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform sampler2D cloudMap;
        uniform sampler2D oceanMaskMap;
        uniform sampler2D desertMaskMap;
        uniform sampler2D iceMaskMap;
        uniform vec3 lightDirection;
        uniform vec3 oceanTint;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 day = texture2D(dayMap, vUv).rgb;
          vec4 nightTex = texture2D(nightMap, vUv);
          vec4 cloudTex = texture2D(cloudMap, vUv);
          float oceanMask = texture2D(oceanMaskMap, vUv).r;
          float desertMask = texture2D(desertMaskMap, vUv).r;
          float iceMask = texture2D(iceMaskMap, vUv).r;
          float landMask = 1.0 - oceanMask;
          vec2 texel = vec2(1.0 / 4096.0, 1.0 / 2048.0);
          float oceanNorth = texture2D(oceanMaskMap, vUv + vec2(0.0, texel.y)).r;
          float oceanSouth = texture2D(oceanMaskMap, vUv - vec2(0.0, texel.y)).r;
          float oceanEast = texture2D(oceanMaskMap, vUv + vec2(texel.x, 0.0)).r;
          float oceanWest = texture2D(oceanMaskMap, vUv - vec2(texel.x, 0.0)).r;
          float coastline = smoothstep(0.06, 0.34, abs(oceanNorth - oceanSouth) + abs(oceanEast - oceanWest)) * landMask;
          float daylight = smoothstep(-0.16, 0.8, dot(normalize(vWorldNormal), lightDirection));
          float nightSide = 1.0 - daylight;
          float cloudSignal = cloudTex.a;
          float oceanDetail = smoothstep(0.1, 0.52, day.b) * oceanMask;
          float oceanSwirl = smoothstep(0.08, 0.44, day.b - day.g * 0.18) * oceanMask;
          vec3 landGrade = day * mix(0.42, 1.0, daylight * 0.72);
          vec3 oceanGrade = mix(oceanTint, vec3(0.018, 0.11, 0.26), oceanDetail * 0.38 + daylight * 0.12);
          vec3 darkDay = mix(landGrade, oceanGrade, oceanMask * 0.88);
          darkDay = mix(darkDay, darkDay * vec3(0.84, 0.86, 0.9), desertMask * 0.36);
          darkDay = mix(darkDay, vec3(0.24, 0.36, 0.48), iceMask * 0.32);
          float coastLift = smoothstep(0.16, 0.46, day.g + day.b * 0.48) * landMask * (1.0 - desertMask * 0.55);
          vec3 twilightLand = day * vec3(0.68, 0.74, 0.81) * nightSide * (0.22 + coastLift * 0.22 + coastline * 0.12 + cloudSignal * 0.08);
          vec3 twilightOcean = vec3(0.024, 0.1, 0.21) * oceanMask * nightSide * (0.42 + oceanDetail * 0.4);
          darkDay += twilightLand + twilightOcean;
          darkDay += vec3(0.016, 0.064, 0.155) * oceanSwirl * (0.28 + nightSide * 0.3 + cloudSignal * 0.14);
          vec3 continentOutline = vec3(0.24, 0.16, 0.07) * coastline * (0.22 + nightSide * 0.46 + daylight * 0.12);
          darkDay += vec3(0.036, 0.052, 0.068) * coastline * (0.34 + daylight * 0.52);
          darkDay += cloudTex.rgb * cloudSignal * (0.07 + daylight * 0.16 + nightSide * 0.12);
          float topLift = smoothstep(0.1, 0.95, normalize(vWorldPosition).y);
          darkDay += vec3(0.11, 0.16, 0.23) * iceMask * (0.18 + topLift * 0.48);
          darkDay += vec3(0.026, 0.056, 0.11) * (0.34 + oceanMask * 0.32 + landMask * 0.18);
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = 1.0 - max(dot(normalize(vNormal), viewDirection), 0.0);
          float rim = pow(fresnel, 3.7);
          float thinRim = pow(fresnel, 8.8);
          float upperBias = smoothstep(-0.08, 0.82, normalize(vWorldPosition).y);
          vec3 blueFill = vec3(0.008, 0.078, 0.18) * (0.025 + rim * 0.1 + thinRim * 0.12 + topLift * 0.06) * (0.08 + upperBias * 0.92);
          float cityMask = nightTex.a;
          float cityCore = smoothstep(0.18, 0.92, max(max(nightTex.r, nightTex.g), nightTex.b));
          vec3 coastalAmber = vec3(0.3, 0.18, 0.07) * coastline * nightSide * 0.34;
          vec3 cities = nightTex.rgb * cityMask * (1.5 + cityCore * 1.2 + coastline * 0.4) * (1.02 + nightSide * 1.24) + coastalAmber;
          vec3 color = darkDay * (1.18 + daylight * 0.26) + blueFill + continentOutline * 0.7 + cities;
          color = pow(max(color, vec3(0.0)), vec3(0.94));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const cityMaterial = new THREE.MeshBasicMaterial({
      map: nightMap,
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.56,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cityHaloMaterial = new THREE.MeshBasicMaterial({
      map: nightHaloMap,
      color: new THREE.Color(0xfff0d6),
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudMap,
      color: new THREE.Color(0xd7e3ef),
      transparent: true,
      opacity: 0.16,
      roughness: 0.95,
      depthWrite: false,
    });

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color(0x1c8fff) },
        strength: { value: 0.24 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float strength;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float rim = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 16.5);
          float topEdge = smoothstep(0.16, 0.92, normalize(vWorldPosition).y);
          float lowerFade = smoothstep(-0.72, -0.18, normalize(vWorldPosition).y);
          float upperBias = smoothstep(-0.02, 0.88, normalize(vWorldPosition).y);
          gl_FragColor = vec4(glowColor, rim * strength * (0.1 + topEdge * 1.35) * lowerFade * upperBias);
        }
      `,
    });

    const addGlobeSphere = () => {
      const geometry = new THREE.SphereGeometry(1.42, 192, 112);
      const earth = new THREE.Mesh(geometry, earthMaterial);
      const cities = new THREE.Mesh(new THREE.SphereGeometry(1.424, 192, 112), cityMaterial);
      const cityHalo = new THREE.Mesh(new THREE.SphereGeometry(1.43, 192, 112), cityHaloMaterial);
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.438, 192, 112), cloudMaterial);
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.448, 192, 112), atmosphereMaterial);
      globeRig.add(earth, cities, cityHalo, clouds, atmosphere);
    };

    addGlobeSphere();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      const isMobile = rect.width < 760;
      const cameraZ = isMobile ? 6.35 : 6.15;
      const visibleHeight = 2 * cameraZ * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
      const visibleWidth = visibleHeight * camera.aspect;
      const targetDiameter = isMobile ? Math.min(visibleWidth * 0.92, visibleHeight * 0.59) : visibleHeight * 0.72;
      const scale = THREE.MathUtils.clamp(targetDiameter / 2.84, isMobile ? 0.46 : 0.78, isMobile ? 0.64 : 0.96);
      camera.position.set(0, isMobile ? 0.02 : 0.04, cameraZ);
      globeRig.position.set(0, isMobile ? 0.84 : 0.24, 0);
      globeRig.scale.setScalar(scale);
    };

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (!prefersReducedMotion) {
        globeRig.rotation.y = INITIAL_GLOBE_ROTATION.y + elapsed * 0.006;
        globeRig.rotation.x = INITIAL_GLOBE_ROTATION.x + Math.sin(elapsed * 0.28) * 0.003;
        globeRig.rotation.z = INITIAL_GLOBE_ROTATION.z;
      } else {
        globeRig.rotation.set(INITIAL_GLOBE_ROTATION.x, INITIAL_GLOBE_ROTATION.y, INITIAL_GLOBE_ROTATION.z);
      }

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
      renderer.dispose();
      dayMap.dispose();
      nightMap.dispose();
      nightHaloMap.dispose();
      cloudMap.dispose();
      oceanMaskMap.dispose();
      desertMaskMap.dispose();
      iceMaskMap.dispose();
      earthMaterial.dispose();
      cityMaterial.dispose();
      cityHaloMaterial.dispose();
      cloudMaterial.dispose();
      atmosphereMaterial.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [onReady]);

  return <div ref={mountRef} className={styles.canvasMount} aria-hidden="true" />;
}
