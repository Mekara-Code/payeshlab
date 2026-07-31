"use client";
// @refresh reset

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Bubble = {
  baseZ: number;
  glow: THREE.Sprite;
  glowMaterial: THREE.SpriteMaterial;
  horizontalBias: number;
  material: THREE.MeshPhysicalMaterial;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  phase: number;
  size: number;
  speed: number;
  sway: number;
};

type LabAtmosphereTone = "default" | "on-teal";

const bubbleDefinitions = [
  { color: 0x5eead4, phase: 0.04, size: 0.045, speed: 0.09, sway: 0.08, x: -0.48, z: 0.16 },
  { color: 0x2dd4bf, phase: 0.15, size: 0.07, speed: 0.075, sway: 0.12, x: -0.24, z: 0.28 },
  { color: 0x14b8a6, phase: 0.28, size: 0.052, speed: 0.105, sway: 0.09, x: -0.08, z: -0.04 },
  { color: 0x99f6e4, phase: 0.39, size: 0.038, speed: 0.095, sway: 0.07, x: 0.16, z: 0.2 },
  { color: 0x0d9488, phase: 0.5, size: 0.064, speed: 0.07, sway: 0.1, x: 0.42, z: 0.08 },
  { color: 0x5eead4, phase: 0.61, size: 0.042, speed: 0.115, sway: 0.08, x: -0.36, z: -0.12 },
  { color: 0x2dd4bf, phase: 0.72, size: 0.058, speed: 0.082, sway: 0.1, x: -0.02, z: 0.05 },
  { color: 0x14b8a6, phase: 0.83, size: 0.046, speed: 0.1, sway: 0.07, x: 0.24, z: -0.18 },
  { color: 0x99f6e4, phase: 0.92, size: 0.034, speed: 0.12, sway: 0.06, x: 0.5, z: 0.18 },
] as const;

const denseBubbleDefinitions = [
  ...bubbleDefinitions,
  { color: 0x5eead4, phase: 0.1, size: 0.039, speed: 0.085, sway: 0.1, x: -0.12, z: 0.12 },
  { color: 0x14b8a6, phase: 0.22, size: 0.058, speed: 0.095, sway: 0.08, x: 0.34, z: -0.08 },
  { color: 0x99f6e4, phase: 0.34, size: 0.045, speed: 0.11, sway: 0.12, x: -0.42, z: 0.24 },
  { color: 0x2dd4bf, phase: 0.47, size: 0.051, speed: 0.078, sway: 0.09, x: 0.08, z: -0.16 },
  { color: 0x0d9488, phase: 0.68, size: 0.043, speed: 0.102, sway: 0.11, x: 0.48, z: 0.14 },
  { color: 0x5eead4, phase: 0.86, size: 0.037, speed: 0.118, sway: 0.07, x: -0.3, z: -0.2 },
] as const;

const onTealBubbleColors = [0xf0fdfa, 0xccfbf1, 0xbae6fd, 0xfef3c7] as const;

const bubbleRegion = {
  centerX: 1.6,
  centerY: 0.04,
  radiusX: 1.55,
  radiusY: 1.82,
};

function createGlowTexture() {
  const glowCanvas = document.createElement("canvas");
  glowCanvas.height = 128;
  glowCanvas.width = 128;

  const context = glowCanvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the bubble glow texture.");
  }

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(236, 253, 245, 0.76)");
  gradient.addColorStop(0.25, "rgba(94, 234, 212, 0.34)");
  gradient.addColorStop(1, "rgba(45, 212, 191, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(glowCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

function smoothstep(start: number, end: number, value: number) {
  const progress = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

export function LabAtmosphere({
  density = "standard",
  scale = 1,
  tone = "default",
}: {
  density?: "standard" | "dense";
  scale?: number;
  tone?: LabAtmosphereTone;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    scene.add(new THREE.HemisphereLight(0xf0fdfa, 0x0f766e, 1.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(-3.5, 4.5, 5);
    scene.add(keyLight);

    const aquaLight = new THREE.PointLight(0x2dd4bf, 10, 11, 2);
    aquaLight.position.set(2.5, 1.8, 3.6);
    scene.add(aquaLight);

    const sphereGeometry = new THREE.SphereGeometry(1, 20, 14);
    const glowTexture = createGlowTexture();
    const bubbleGroup = new THREE.Group();
    scene.add(bubbleGroup);

    const definitions = density === "dense" ? denseBubbleDefinitions : bubbleDefinitions;
    const bubbles: Bubble[] = definitions.map((definition, index) => {
      const color =
        tone === "on-teal"
          ? onTealBubbleColors[index % onTealBubbleColors.length]
          : definition.color;
      const material = new THREE.MeshPhysicalMaterial({
        clearcoat: 0.92,
        clearcoatRoughness: 0.1,
        color,
        depthWrite: false,
        emissive: color,
        emissiveIntensity: 0.15,
        iridescence: 0.28,
        iridescenceIOR: 1.28,
        metalness: 0.06,
        opacity: 0.8,
        reflectivity: 0.55,
        roughness: 0.16,
        transparent: true,
      });
      const mesh = new THREE.Mesh(sphereGeometry, material);

      const glowMaterial = new THREE.SpriteMaterial({
        blending: THREE.AdditiveBlending,
        color,
        depthWrite: false,
        map: glowTexture,
        opacity: 0.28,
        transparent: true,
      });
      const glow = new THREE.Sprite(glowMaterial);

      bubbleGroup.add(glow, mesh);

      return {
        baseZ: definition.z,
        glow,
        glowMaterial,
        horizontalBias: definition.x,
        material,
        mesh,
        phase: definition.phase,
        size: definition.size,
        speed: definition.speed,
        sway: definition.sway,
      };
    });

    const pointerPosition = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    let isPointerActive = false;

    const resize = () => {
      const { clientHeight, clientWidth } = canvas;
      if (!clientWidth || !clientHeight) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const updateBubbles = (seconds: number) => {
      const horizontalScale = THREE.MathUtils.clamp(camera.aspect / 1.5, 0.38, 1);
      const regionCenterX = bubbleRegion.centerX * horizontalScale;
      const regionRadiusX = bubbleRegion.radiusX * horizontalScale;

      pointerPosition.lerp(pointerTarget, isPointerActive ? 0.13 : 0.025);

      bubbles.forEach((bubble) => {
        const progress = (seconds * bubble.speed + bubble.phase) % 1;
        const rise = 1 - (1 - progress) ** 1.65;
        const fadeIn = smoothstep(0, 0.14, progress);
        const fadeOut = 1 - smoothstep(0.72, 1, progress);
        const opacity = fadeIn * fadeOut;
        const verticalPosition = rise * 2 - 1;
        const availableWidth = regionRadiusX * Math.sqrt(Math.max(0, 1 - verticalPosition ** 2));
        const baseX = regionCenterX + availableWidth * (bubble.horizontalBias + Math.sin(seconds * 1.35 + bubble.phase * 12) * bubble.sway);
        const baseY = bubbleRegion.centerY + verticalPosition * bubbleRegion.radiusY;
        const z = bubble.baseZ + Math.sin(seconds * 0.82 + bubble.phase * 9) * 0.08;
        const pointerDistance = Math.hypot(pointerPosition.x - baseX, pointerPosition.y - baseY);
        const pointerInfluence = isPointerActive ? 1 - smoothstep(0.08, 1.35, pointerDistance) : 0;
        const pullStrength = pointerInfluence * 0.34;
        let x = baseX + (pointerPosition.x - baseX) * pullStrength;
        let y = baseY + (pointerPosition.y - baseY) * pullStrength;
        const regionDistance = Math.hypot((x - regionCenterX) / regionRadiusX, (y - bubbleRegion.centerY) / bubbleRegion.radiusY);

        if (regionDistance > 0.94) {
          x = regionCenterX + ((x - regionCenterX) / regionDistance) * regionRadiusX * 0.94;
          y = bubbleRegion.centerY + ((y - bubbleRegion.centerY) / regionDistance) * bubbleRegion.radiusY * 0.94;
        }

        const size = bubble.size * scale * (0.78 + rise * 0.38) * (1 + pointerInfluence * 0.55);

        bubble.mesh.position.set(x, y, z);
        bubble.mesh.scale.setScalar(size);
        bubble.mesh.rotation.set(seconds * 0.18 + bubble.phase, seconds * 0.28 + bubble.phase, 0);
        bubble.material.emissiveIntensity = 0.15 + pointerInfluence * 0.55;
        bubble.material.opacity = opacity * (0.7 + pointerInfluence * 0.28);

        bubble.glow.position.set(x, y, z - 0.12);
        bubble.glow.scale.setScalar(size * 5.4);
        bubble.glowMaterial.opacity = opacity * (0.28 + pointerInfluence * 0.58);
      });
    };

    let animationFrame = 0;
    let isPageVisible = !document.hidden;

    const render = (time = 0) => {
      const seconds = shouldReduceMotion ? 0 : time * 0.001;
      updateBubbles(seconds);
      renderer.render(scene, camera);

      if (!shouldReduceMotion && isPageVisible) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (shouldReduceMotion) {
        render();
      }
    });
    resizeObserver.observe(canvas);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const isInsideCanvas =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!isInsideCanvas) {
        isPointerActive = false;
        return;
      }

      const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      const viewportHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

      pointerTarget.set(normalizedX * (viewportHeight * camera.aspect) / 2, normalizedY * viewportHeight / 2);
      isPointerActive = true;
    };

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !shouldReduceMotion) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      bubbles.forEach((bubble) => {
        bubble.material.dispose();
        bubble.glowMaterial.dispose();
      });
      sphereGeometry.dispose();
      glowTexture.dispose();
      renderer.dispose();
    };
  }, [density, scale, shouldReduceMotion, tone]);

  return <canvas aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] size-full" ref={canvasRef} />;
}
