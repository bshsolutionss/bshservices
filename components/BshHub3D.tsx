"use client";

/**
 * BshHub3D — an interactive 3D hub: a faceted core with three orbits
 * (Business, Smart, Hub). No surrounding copy; it fills the width of its
 * parent as a square with a transparent background.
 *
 * Use:  <BshHub3D />
 *
 * Props
 *   orbits          array of orbits (see DEFAULT_ORBITS) — edit labels, sizes, speeds
 *   defaultActive   key of the orbit highlighted on load ('hub')
 *   labels          'active' | 'all' | 'none'  — which node labels to show ('active')
 *   theme           'auto' | 'light' | 'dark'  — 'auto' follows a .dark class /
 *                   data-theme on <html>, then the OS setting
 *   interactive     pointer tilt, hover and click (true)
 *   onActiveChange  (key) => void, called when the highlighted orbit changes
 *   className, style  applied to the wrapper
 */

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Shape = "cube" | "crystal" | "sphere";
type ColorKey = "blue" | "sky" | "graphite";

export type HubOrbit = {
  key: string;
  radius: number;
  tilt: [number, number];
  speed: number;
  shape: Shape;
  color: ColorKey;
  items: string[];
};

const DEFAULT_ORBITS: HubOrbit[] = [
  { key: "business", radius: 1.45, tilt: [0.8, 0.55], speed: 0.32, shape: "cube", color: "graphite", items: ["Startups", "Enterprises", "Growth"] },
  { key: "smart", radius: 2.05, tilt: [1.1, -0.65], speed: -0.24, shape: "crystal", color: "sky", items: ["Innovation", "Data-driven", "AI-powered"] },
  { key: "hub", radius: 2.7, tilt: [0.98, 0.08], speed: 0.16, shape: "sphere", color: "blue", items: ["Branding", "Marketing", "Web & App", "AI", "Hardware"] },
];

const PALETTE = {
  light: { blue: 0x1f35dc, sky: 0x6f86ff, graphite: 0x2b2d36, glow: 0.22, labelBg: "rgba(255,255,255,.94)", labelFg: "#1a14a6", labelShadow: "0 4px 14px rgba(28,30,90,.2)" },
  dark: { blue: 0x4a63ff, sky: 0x9fb0ff, graphite: 0xe4e8ff, glow: 0.5, labelBg: "rgba(28,34,78,.96)", labelFg: "#dfe4ff", labelShadow: "0 4px 14px rgba(0,0,0,.45)" },
};

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Ring = {
  o: HubOrbit;
  tiltGroup: THREE.Group;
  spin: THREE.Group;
  ringMat: THREE.MeshBasicMaterial;
  nodeMat: THREE.MeshStandardMaterial;
  nodeGlowMat: THREE.SpriteMaterial;
  glow: number;
  glowMax: number;
};

type Node = {
  ring: Ring;
  holder: THREE.Group;
  mesh: THREE.Mesh;
  el: HTMLSpanElement | null;
  shown: number;
};

interface BshHub3DProps {
  orbits?: HubOrbit[];
  defaultActive?: string;
  labels?: "active" | "all" | "none";
  theme?: "auto" | "light" | "dark";
  interactive?: boolean;
  onActiveChange?: (key: string | null) => void;
  className?: string;
  style?: CSSProperties;
}

export default function BshHub3D({
  orbits = DEFAULT_ORBITS,
  defaultActive = "hub",
  labels = "active",
  theme = "auto",
  interactive = true,
  onActiveChange,
  className,
  style,
}: BshHub3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onActiveChange);
  onChangeRef.current = onActiveChange;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined; // no WebGL: leave the wrapper empty
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", touchAction: "pan-y" });
    wrap.appendChild(canvas);

    const labelLayer = document.createElement("div");
    Object.assign(labelLayer.style, { position: "absolute", inset: "0", pointerEvents: "none" });
    labelLayer.setAttribute("aria-hidden", "true");
    wrap.appendChild(labelLayer);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 12.6);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x7f88c8, 1.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x9fb0ff, 0.7);
    fillLight.position.set(-7, -2, 6);
    scene.add(fillLight);

    const hub = new THREE.Group();
    scene.add(hub);

    // ----- core -----
    const glowMap = glowTexture();
    const coreMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1, flatShading: true });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), coreMat);
    hub.add(core);
    const cageMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 });
    const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.0, 0)), cageMat);
    hub.add(cage);
    const haloMat = new THREE.SpriteMaterial({ map: glowMap, transparent: true, depthWrite: false });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(3.6);
    halo.renderOrder = -1;
    hub.add(halo);

    // ----- dust -----
    const DUST = 70;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const r = 1.6 + Math.random() * 1.7;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      dustPos[i * 3 + 1] = r * Math.cos(b) * 0.7;
      dustPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ map: glowMap, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false });
    const dust = new THREE.Points(dustGeo, dustMat);
    hub.add(dust);

    // ----- orbits -----
    const shapes: Record<Shape, THREE.BufferGeometry> = {
      cube: new RoundedBoxGeometry(0.36, 0.36, 0.36, 4, 0.07),
      crystal: new THREE.OctahedronGeometry(0.27, 0),
      sphere: new THREE.SphereGeometry(0.2, 40, 24),
    };
    const rings: Ring[] = [];
    const nodes: Node[] = [];
    orbits.forEach((o) => {
      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.set(o.tilt[0], o.tilt[1], 0);
      const spin = new THREE.Group();
      tiltGroup.add(spin);
      hub.add(tiltGroup);

      const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3 });
      spin.add(new THREE.Mesh(new THREE.TorusGeometry(o.radius, 0.016, 8, 200), ringMat));
      const nodeMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05, flatShading: o.shape === "crystal" });
      const nodeGlowMat = new THREE.SpriteMaterial({ map: glowMap, transparent: true, opacity: 0, depthWrite: false });
      const ring: Ring = { o, tiltGroup, spin, ringMat, nodeMat, nodeGlowMat, glow: 0, glowMax: 0 };
      rings.push(ring);

      o.items.forEach((text, i) => {
        const a = (i / o.items.length) * Math.PI * 2;
        const holder = new THREE.Group();
        holder.position.set(Math.cos(a) * o.radius, Math.sin(a) * o.radius, 0);
        const mesh = new THREE.Mesh(shapes[o.shape] || shapes.sphere, nodeMat);
        mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
        const glow = new THREE.Sprite(nodeGlowMat);
        glow.scale.setScalar(1.1);
        holder.add(glow, mesh);
        spin.add(holder);

        let el: HTMLSpanElement | null = null;
        if (labels !== "none") {
          el = document.createElement("span");
          el.textContent = text;
          Object.assign(el.style, {
            position: "absolute", left: "0", top: "0", padding: "4px 11px", borderRadius: "999px",
            fontWeight: "600", fontSize: "13px", lineHeight: "1.3", fontFamily: "inherit", whiteSpace: "nowrap",
            opacity: "0", willChange: "transform, opacity", backdropFilter: "blur(6px)",
          });
          labelLayer.appendChild(el);
        }
        nodes.push({ ring, holder, mesh, el, shown: 0 });
      });
    });

    // ----- theme -----
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = () => {
      if (theme === "dark") return true;
      if (theme === "light") return false;
      const attr = root.getAttribute("data-theme");
      if (root.classList.contains("dark") || attr === "dark") return true;
      if (root.classList.contains("light") || attr === "light") return false;
      return mq.matches;
    };
    const applyTheme = () => {
      const p = isDark() ? PALETTE.dark : PALETTE.light;
      coreMat.color.set(p.blue);
      cageMat.color.set(p.graphite);
      haloMat.color.set(p.blue);
      haloMat.opacity = p.glow;
      dustMat.color.set(p.sky);
      rings.forEach((r) => {
        const c = p[r.o.color] ?? p.blue;
        r.nodeMat.color.set(c);
        r.ringMat.color.set(c);
        r.nodeGlowMat.color.set(c);
        r.glowMax = p.glow;
      });
      nodes.forEach((n) => {
        if (n.el) Object.assign(n.el.style, { background: p.labelBg, color: p.labelFg, boxShadow: p.labelShadow });
      });
    };
    applyTheme();
    mq.addEventListener("change", applyTheme);
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });

    // ----- sizing -----
    let W = 1;
    let H = 1;
    const resize = () => {
      W = wrap.clientWidth || 1;
      H = wrap.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      // keep the widest orbit inside narrow or short boxes
      camera.position.z = 12.6 / Math.min(1, camera.aspect);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    // ----- state + pointer -----
    let hovered: string | null = null;
    const selected = { key: defaultActive };
    let lastActive: string | null = null;
    const activeKey = () => hovered || selected.key;
    let tiltX = 0;
    let tiltY = 0;
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const v = new THREE.Vector3();

    const pick = (ev: PointerEvent | MouseEvent) => {
      const b = canvas.getBoundingClientRect();
      const nx = ((ev.clientX - b.left) / b.width) * 2 - 1;
      const ny = ((ev.clientY - b.top) / b.height) * 2 - 1;
      ptr.set(nx, -ny);
      ray.setFromCamera(ptr, camera);
      let best: string | null = null;
      let bestD = 0.5; // generous hit area around each node
      nodes.forEach((n) => {
        n.holder.getWorldPosition(v);
        const d = ray.ray.distanceToPoint(v);
        if (d < bestD) { bestD = d; best = n.ring.o.key; }
      });
      return { nx, ny, key: best as string | null };
    };
    const onMove = (ev: PointerEvent) => {
      const p = pick(ev);
      tiltY = p.nx * 0.5;
      tiltX = p.ny * 0.35;
      if (ev.pointerType !== "touch") hovered = p.key;
      canvas.style.cursor = p.key ? "pointer" : "grab";
    };
    const onLeave = () => { tiltX = 0; tiltY = 0; hovered = null; };
    const onClick = (ev: MouseEvent) => { const p = pick(ev); if (p.key) selected.key = p.key; };
    if (interactive) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("click", onClick);
    }

    // ----- loop -----
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = reduce ? 0 : 1;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
    const clock = new THREE.Timer();
    let intro = reduce ? 1 : 0;
    let raf = 0;
    let running = false;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      clock.update();
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsed();
      if (intro < 1) intro = Math.min(1, intro + dt / 1.8);

      const act = activeKey();
      if (act !== lastActive) { lastActive = act; if (onChangeRef.current) onChangeRef.current(act); }

      hub.rotation.x += (0.18 + tiltX - hub.rotation.x) * 0.06;
      hub.rotation.y += (tiltY - hub.rotation.y) * 0.06;
      hub.position.y = motion * Math.sin(t * 0.9) * 0.08;

      const pulse = 1 + motion * Math.sin(t * 1.6) * 0.03;
      core.rotation.y += dt * 0.35 * motion;
      core.rotation.x += dt * 0.12 * motion;
      cage.rotation.y -= dt * 0.2 * motion;
      cage.rotation.z += dt * 0.1 * motion;
      const coreIn = ease(clamp01(intro * 2));
      core.scale.setScalar(Math.max(coreIn * pulse, 0.0001));
      cage.scale.setScalar(Math.max(coreIn, 0.0001));
      halo.scale.setScalar(3.6 * coreIn * (1 + motion * Math.sin(t * 1.6) * 0.06) + 0.0001);
      dust.rotation.y += dt * 0.05 * motion;
      dustMat.opacity = 0.55 * ease(intro);

      rings.forEach((r, i) => {
        const open = ease(clamp01(intro * 1.6 - i * 0.2));
        r.tiltGroup.scale.setScalar(Math.max(open, 0.0001));
        const on = r.o.key === act ? 1 : 0;
        r.spin.rotation.z += dt * r.o.speed * motion * (on ? 0.35 : 1);
        r.glow += (on - r.glow) * 0.1;
        r.ringMat.opacity = (act ? 0.2 : 0.3) + r.glow * 0.7;
        r.nodeMat.emissive.copy(r.nodeMat.color).multiplyScalar(r.glow * 0.22);
        r.nodeGlowMat.opacity = r.glow * r.glowMax * 1.3;
      });

      nodes.forEach((n) => {
        const r = n.ring;
        n.holder.scale.setScalar(1 + r.glow * 0.4);
        n.mesh.rotation.x += dt * 0.6 * motion;
        n.mesh.rotation.y += dt * 0.4 * motion;
        if (!n.el) return;
        n.holder.getWorldPosition(v);
        const depth = clamp01((v.z + 2.7) / 4); // 0 = far side, 1 = near side
        v.project(camera);
        const want = (labels === "all" || r.o.key === act ? 1 : 0) * ease(intro) * (0.7 + 0.3 * depth);
        n.shown += (want - n.shown) * 0.14;
        const x = Math.max(44, Math.min(W - 44, (v.x * 0.5 + 0.5) * W));
        const y = (-v.y * 0.5 + 0.5) * H - 26;
        n.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${(0.86 + 0.14 * depth).toFixed(3)})`;
        n.el.style.opacity = n.shown.toFixed(3);
        n.el.style.zIndex = String(Math.round(depth * 10));
      });

      renderer.render(scene, camera);
    };
    const start = () => { if (!running) { running = true; clock.update(); raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    // only animate while on screen
    const viewObserver = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    viewObserver.observe(wrap);

    return () => {
      stop();
      viewObserver.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      mq.removeEventListener("change", applyTheme);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => mat.dispose());
        }
      });
      glowMap.dispose();
      renderer.dispose();
      canvas.remove();
      labelLayer.remove();
    };
  }, [orbits, defaultActive, labels, theme, interactive]);

  return (
    <div
      ref={wrapRef}
      className={className}
      role="img"
      aria-label="3D hub: a central core with three orbits for Business, Smart and Hub"
      style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", ...style }}
    />
  );
}
