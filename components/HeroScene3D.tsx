"use client";

/**
 * HeroStack3D — the homepage hero's "solution stack".
 *
 *  - Four floating glass layers, one per thing BSH builds, stacked from the
 *    foundation up: databases (Cloud & Data), a code editor that keeps typing
 *    (Software Development), a browser and phone (Web & Apps) and an AI core
 *    with its node network on top (AI & Automation). Data packets climb the
 *    corner rails between them.
 *  - Hover (or tap) a layer to lift it out of the stack and show its label;
 *    when nobody is interacting the highlight cycles on its own.
 *
 * Drop-in replacement for HeroScene3D — same contract: the stack is centred on
 * the square `[data-hero-stage]` slot in the hero's right column, one
 * transparent WebGL canvas covers the hero section (pointer-events: none), the
 * pointer is read from window. Pauses off-screen or in a hidden tab; one still
 * frame for prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

const INDIGO = 0x1a14a5;
const VIOLET = 0x4b35ff;
const CYAN = 0x00a8ff;
const MIST = 0xc9d2ff;

/** Bottom → top. */
const LAYERS = [
  { label: "Cloud & Data", accent: INDIGO },
  { label: "Software Development", accent: VIOLET },
  { label: "Web & Apps", accent: CYAN },
  { label: "AI & Automation", accent: VIOLET },
];

const HALF = 1.2; // half-width of a layer
const THICK = 0.12;
const TOP = THICK / 2 + 0.02; // y of a layer's top face
const GAP = 1.02;
const OPEN_GAP = 1.46; // gap above the highlighted layer // resting distance between layers
const OUTER = 3.05; // radius (scene units) that must fit inside the stage slot
/** Seconds each layer stays highlighted when idle. */
const CYCLE_S = 3.2;

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,.4)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundedSquare(h: number, r: number, into: THREE.Shape | THREE.Path = new THREE.Shape()) {
  into.moveTo(-h + r, -h);
  into.lineTo(h - r, -h);
  into.quadraticCurveTo(h, -h, h, -h + r);
  into.lineTo(h, h - r);
  into.quadraticCurveTo(h, h, h - r, h);
  into.lineTo(-h + r, h);
  into.quadraticCurveTo(-h, h, -h, h - r);
  into.lineTo(-h, -h + r);
  into.quadraticCurveTo(-h, -h, -h + r, -h);
  return into;
}

/** Backdrop: a flowing field of dots across the whole hero, like a rolling 3D floor. */
const WAVE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uProj;
  uniform float uPR;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(p.x * 0.55 + uTime * 1.0) * 0.28
         + sin(p.x * 1.3 - uTime * 0.75 + p.z * 0.9) * 0.14
         + sin(p.z * 0.8 + uTime * 0.6) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uProj * uPR / -mv.z;
    float edge = 1.0 - smoothstep(0.55, 1.0, abs(position.x) / 9.0);
    float far = smoothstep(-5.0, 1.0, position.z);
    vAlpha = edge * (0.13 + 0.5 * far) * (0.6 + 0.4 * sin(p.y * 4.0 + uTime));
  }
`;

const WAVE_FRAG = /* glsl */ `
  uniform float uFade;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(0.294, 0.208, 1.0, smoothstep(0.5, 0.1, r) * vAlpha * uFade);
  }
`;

type Layer = {
  group: THREE.Group;
  slab: THREE.Mesh;
  slabMat: THREE.MeshStandardMaterial;
  rimMat: THREE.MeshBasicMaterial;
  accent: THREE.Color;
  label: HTMLDivElement;
  labelW: number;
  y: number;
  glow: number;
  shown: number;
  animate: (t: number, glow: number, build: number) => void;
};

export default function HeroStack3D() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return undefined; // no WebGL: the CSS backdrop underneath stays
    }
    const small = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    const canvas = renderer.domElement;
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
    wrap.appendChild(canvas);

    const labelLayer = document.createElement("div");
    Object.assign(labelLayer.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden" });
    labelLayer.setAttribute("aria-hidden", "true");
    wrap.appendChild(labelLayer);

    const section = wrap.closest("section");
    const getStage = () => section?.querySelector<HTMLElement>("[data-hero-stage]") ?? null;

    const FOV = 35;
    const CAM = 9;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c0ff, 2.3));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(4, 8, 6);
    scene.add(sun);

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(o: T): T => {
      disposables.push(o);
      return o;
    };
    const glowMap = track(glowTexture());
    const std = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
      track(new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.05, ...extra }));
    const box = (w: number, h: number, d: number) => track(new THREE.BoxGeometry(w, h, d));
    const glowSprite = (color: number, size: number, opacity: number) => {
      const mat = track(new THREE.SpriteMaterial({ map: glowMap, color, transparent: true, opacity, depthWrite: false }));
      const s = new THREE.Sprite(mat);
      s.scale.setScalar(size);
      return s;
    };

    // ───────────── scene graph ─────────────
    const root = new THREE.Group(); // positioned + scaled by layout()
    scene.add(root);
    const tilt = new THREE.Group(); // isometric tilt + pointer parallax
    root.add(tilt);
    const stack = new THREE.Group();
    stack.position.y = -0.4;
    tilt.add(stack);

    // shared layer geometry: slab, rim strip on its top face
    const slabGeo = track(
      new THREE.ExtrudeGeometry(roundedSquare(HALF, 0.3) as THREE.Shape, {
        depth: THICK,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 3,
        curveSegments: 10,
      }),
    );
    slabGeo.rotateX(-Math.PI / 2);
    slabGeo.translate(0, -THICK / 2, 0);
    const rimShape = roundedSquare(HALF - 0.03, 0.27) as THREE.Shape;
    rimShape.holes.push(roundedSquare(HALF - 0.085, 0.215, new THREE.Path()) as THREE.Path);
    const rimGeo = track(new THREE.ShapeGeometry(rimShape, 10));
    rimGeo.rotateX(-Math.PI / 2);

    // ───────────── layer contents ─────────────
    /** 0 · Cloud & Data: three databases wired together on the foundation layer. */
    const buildCloud = (g: THREE.Group) => {
      const discGeo = track(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 40));
      const bandGeo = track(new THREE.CylinderGeometry(0.348, 0.348, 0.035, 40));
      const discMat = std(0x6a5bff, { roughness: 0.3, metalness: 0.15 });
      const bands: THREE.MeshStandardMaterial[] = [];
      const database = (x: number, z: number, scale: number) => {
        const db = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const disc = new THREE.Mesh(discGeo, discMat);
          disc.position.y = 0.08 + i * 0.195;
          db.add(disc);
          if (i < 2) {
            const mat = std(CYAN, { emissive: CYAN, emissiveIntensity: 0.6 });
            bands.push(mat);
            const band = new THREE.Mesh(bandGeo, mat);
            band.position.y = 0.1775 + i * 0.195;
            db.add(band);
          }
        }
        db.position.set(x, TOP, z);
        db.scale.setScalar(scale);
        g.add(db);
        return new THREE.Vector3(x, TOP + 0.008, z);
      };
      const main = database(0, 0, 1.2);
      const left = database(-0.68, 0.6, 0.62);
      const right = database(0.7, -0.55, 0.62);

      // wiring on the layer: main ↔ each small database, plus feeds out to the edges
      const seg: number[] = [];
      const routes: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [];
      const wire = (from: THREE.Vector3, to: THREE.Vector3) => {
        const elbow = new THREE.Vector3(to.x, from.y, from.z);
        seg.push(from.x, from.y, from.z, elbow.x, elbow.y, elbow.z, elbow.x, elbow.y, elbow.z, to.x, to.y, to.z);
        routes.push([from, elbow, to]);
      };
      wire(main, left);
      wire(main, right);
      const edge = HALF - 0.16;
      wire(left, new THREE.Vector3(-edge, main.y, -0.5));
      wire(right, new THREE.Vector3(edge, main.y, 0.55));
      wire(main, new THREE.Vector3(0.35, main.y, edge));
      wire(main, new THREE.Vector3(-0.35, main.y, -edge));
      const wg = track(new THREE.BufferGeometry());
      wg.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
      const wireMat = track(new THREE.LineBasicMaterial({ color: 0x6fd0ff, transparent: true, opacity: 0.7 }));
      g.add(new THREE.LineSegments(wg, wireMat));

      const pulses = routes.map((route, i) => {
        const sprite = glowSprite(0x6fd0ff, 0.2, 0.95);
        g.add(sprite);
        return { sprite, route, phase: i / routes.length };
      });

      return (t: number, glow: number) => {
        bands.forEach((m, i) => (m.emissiveIntensity = 0.45 + 0.4 * Math.sin(t * 2.6 + i * 1.1) + glow * 0.5));
        wireMat.opacity = 0.5 + glow * 0.45;
        pulses.forEach((p) => {
          const f = (p.phase + t * 0.35) % 1;
          if (f < 0.5) p.sprite.position.lerpVectors(p.route[0], p.route[1], f * 2);
          else p.sprite.position.lerpVectors(p.route[1], p.route[2], f * 2 - 1);
          p.sprite.material.opacity = Math.sin(f * Math.PI) * 0.95;
        });
      };
    };

    /** 1 · Software Development: a dark code editor that keeps typing. */
    const buildCode = (g: THREE.Group) => {
      const editor = new THREE.Group();
      editor.add(new THREE.Mesh(box(1.8, 0.07, 1.4), std(0x18124f, { roughness: 0.5 })));
      const bar = new THREE.Mesh(box(1.8, 0.074, 0.2), std(0x2a22c9));
      bar.position.z = -0.6;
      editor.add(bar);
      const dotGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 20));
      [CYAN, 0x9a8bff, MIST].forEach((c, i) => {
        const dot = new THREE.Mesh(dotGeo, track(new THREE.MeshBasicMaterial({ color: c })));
        dot.position.set(-0.76 + i * 0.11, 0.045, -0.6);
        editor.add(dot);
      });

      // code: [indent, length, colour]
      const rows: [number, number, number][] = [
        [0, 0.55, 0x9a8bff],
        [0.14, 0.85, 0x39c2ff],
        [0.28, 0.6, 0xdfe4ff],
        [0.28, 0.95, 0x9a8bff],
        [0.14, 0.45, 0x39c2ff],
        [0, 0.3, 0xdfe4ff],
      ];
      const lineGeo = box(1, 0.025, 0.08);
      const lines = rows.map(([indent, len, color], i) => {
        const m = new THREE.Mesh(lineGeo, track(new THREE.MeshBasicMaterial({ color })));
        m.position.set(0, 0.05, -0.36 + i * 0.165);
        editor.add(m);
        return { m, x0: -0.76 + indent, len };
      });
      const cursor = new THREE.Mesh(box(0.035, 0.03, 0.11), track(new THREE.MeshBasicMaterial({ color: 0xffffff })));
      editor.add(cursor);
      editor.position.set(0, TOP + 0.2, 0);
      g.add(editor);

      return (t: number, glow: number) => {
        // types the six rows, holds, then starts over (fully typed at t = 0)
        const p = (t * 1.1 + 6.6) % 8.5;
        lines.forEach((l, i) => {
          const done = Math.max(0, Math.min(1, p - i));
          l.m.visible = done > 0.01;
          l.m.scale.x = Math.max(l.len * done, 0.0001);
          l.m.position.x = l.x0 + (l.len * done) / 2;
        });
        const row = Math.min(lines.length - 1, Math.floor(p));
        const typed = Math.max(0, Math.min(1, p - row));
        cursor.position.set(lines[row].x0 + lines[row].len * typed + 0.04, 0.05, lines[row].m.position.z);
        cursor.visible = Math.sin(t * 7) > -0.3;
        editor.position.y = TOP + 0.2 + Math.sin(t * 1.3) * 0.03 + glow * 0.1;
      };
    };

    /** 2 · Web & Apps: a browser window with a phone standing beside it. */
    const buildApps = (g: THREE.Group) => {
      const win = new THREE.Group();
      win.add(new THREE.Mesh(box(1.45, 0.05, 1.1), std(0xf1f3ff)));
      const bar = new THREE.Mesh(box(1.45, 0.054, 0.18), std(CYAN));
      bar.position.z = -0.46;
      win.add(bar);
      const hero = new THREE.Mesh(box(0.6, 0.035, 0.42), std(VIOLET));
      hero.position.set(-0.35, 0.035, -0.1);
      win.add(hero);
      const lineGeo = box(1, 0.02, 0.07);
      const lineMat = std(MIST);
      [0.55, 0.4, 0.48].forEach((w, i) => {
        const l = new THREE.Mesh(lineGeo, lineMat);
        l.scale.x = w;
        l.position.set(0.08 + w / 2, 0.03, -0.24 + i * 0.14);
        win.add(l);
      });
      [-0.47, 0, 0.47].forEach((x) => {
        const card = new THREE.Mesh(box(0.4, 0.03, 0.22), lineMat);
        card.position.set(x, 0.035, 0.36);
        win.add(card);
      });
      win.position.set(-0.2, TOP + 0.16, -0.1);
      g.add(win);

      const phone = new THREE.Group();
      const body = new THREE.Mesh(box(0.36, 0.62, 0.06), std(INDIGO, { roughness: 0.3 }));
      body.position.y = 0.31;
      phone.add(body);
      const screen = new THREE.Mesh(box(0.3, 0.55, 0.012), std(0xf1f3ff));
      screen.position.set(0, 0.31, 0.034);
      phone.add(screen);
      const tile = new THREE.Mesh(box(0.24, 0.18, 0.012), std(VIOLET));
      tile.position.set(0, 0.45, 0.042);
      phone.add(tile);
      [0.29, 0.21, 0.13].forEach((y, i) => {
        const l = new THREE.Mesh(box(i === 2 ? 0.15 : 0.24, 0.04, 0.012), std(i === 2 ? CYAN : MIST));
        l.position.set(i === 2 ? -0.045 : 0, y, 0.042);
        phone.add(l);
      });
      phone.position.set(0.74, TOP + 0.04, 0.66);
      phone.rotation.set(-0.16, -0.55, 0, "YXZ");
      g.add(phone);

      return (t: number, glow: number) => {
        win.position.y = TOP + 0.16 + Math.sin(t * 1.3) * 0.03 + glow * 0.06;
        phone.position.y = TOP + 0.04 + Math.sin(t * 1.3 + 1.6) * 0.03 + glow * 0.12;
      };
    };

    /**
     * 3 · AI & Automation: a faceted AI core that BUILDS itself piece by piece
     * (stems grow, nodes pop in one by one, links draw, the core appears), then
     * keeps moving: the node ring orbits the core and a glowing ball circles it.
     */
    const buildBrain = (g: THREE.Group) => {
      const core = new THREE.Vector3(0, TOP + 0.62, 0);
      const pts: THREE.Vector3[] = [core];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        pts.push(new THREE.Vector3(Math.cos(a) * 0.86, TOP + 0.22 + (i % 2) * 0.2, Math.sin(a) * 0.86));
      }
      const seg: number[] = [];
      const edges: [THREE.Vector3, THREE.Vector3][] = [];
      const link = (a: THREE.Vector3, b: THREE.Vector3) => {
        seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
        edges.push([a, b]);
      };
      for (let i = 1; i <= 6; i++) {
        link(pts[0], pts[i]);
        link(pts[i], pts[(i % 6) + 1]);
      }

      // everything that orbits lives in `spin` (the core sits on its axis, so links stay valid)
      const spin = new THREE.Group();
      g.add(spin);

      const lg = track(new THREE.BufferGeometry());
      lg.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
      const lineMat = track(new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.6 }));
      spin.add(new THREE.LineSegments(lg, lineMat));

      // stems down to the layer, stored relative to the slab so they can grow upward from it
      const stemGroup = new THREE.Group();
      stemGroup.position.y = TOP;
      spin.add(stemGroup);
      const stems: number[] = [];
      pts.forEach((p) => stems.push(p.x, p.y - TOP, p.z, p.x, 0, p.z));
      const sg = track(new THREE.BufferGeometry());
      sg.setAttribute("position", new THREE.Float32BufferAttribute(stems, 3));
      const stemMat = track(new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 }));
      stemGroup.add(new THREE.LineSegments(sg, stemMat));

      // the AI core
      const coreMat = std(VIOLET, { flatShading: true, roughness: 0.3, emissive: VIOLET, emissiveIntensity: 0.25 });
      const aiCore = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.24, 0)), coreMat);
      aiCore.position.copy(core);
      g.add(aiCore);
      const cageSrc = new THREE.IcosahedronGeometry(0.36, 0);
      const cage = new THREE.LineSegments(track(new THREE.EdgesGeometry(cageSrc)), track(new THREE.LineBasicMaterial({ color: INDIGO, transparent: true, opacity: 0.7 })));
      cageSrc.dispose();
      cage.position.copy(core);
      g.add(cage);
      const halo = glowSprite(VIOLET, 1.5, 0.45);
      halo.position.copy(core);
      g.add(halo);

      const nodeGeo = track(new THREE.SphereGeometry(0.095, 24, 16));
      const nodes = pts.slice(1).map((p, i) => {
        const holder = new THREE.Group();
        holder.position.copy(p);
        holder.add(new THREE.Mesh(nodeGeo, track(new THREE.MeshBasicMaterial({ color: i % 2 ? CYAN : VIOLET }))));
        holder.add(glowSprite(i % 2 ? CYAN : VIOLET, 0.5, 0.5));
        spin.add(holder);
        return holder;
      });

      const signals = [0, 1, 2].map((i) => {
        const sprite = glowSprite(CYAN, 0.26, 0.95);
        spin.add(sprite);
        return { sprite, edge: edges[i * 4], st: i / 3 };
      });

      // the orbiting ball: a hairline orbit around the core, a glowing ball and a fading trail
      const orbit = new THREE.Group();
      orbit.position.copy(core);
      g.add(orbit);
      const ORB_R = 0.64;
      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * ORB_R, 0, Math.sin(a) * ORB_R));
      }
      const orbitMat = track(new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 }));
      orbit.add(new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(ringPts)), orbitMat));
      const ball = new THREE.Group();
      orbit.add(ball);
      ball.add(new THREE.Mesh(track(new THREE.SphereGeometry(0.075, 24, 16)), track(new THREE.MeshBasicMaterial({ color: 0x6fe3ff }))));
      ball.add(glowSprite(CYAN, 0.55, 0.9));
      const TRAIL = 8;
      const trail = Array.from({ length: TRAIL }, (_, k) => {
        const sprite = glowSprite(CYAN, 0.3 - k * 0.025, 0.55 - k * 0.065);
        orbit.add(sprite);
        return sprite;
      });

      let last = 0;
      return (t: number, glow: number, b: number) => {
        const dt = Math.min(0.05, Math.max(0, t - last));
        last = t;

        // build sequence (b = 0 to 1)
        const stemP = ease(clamp01(b / 0.25));
        stemGroup.scale.y = Math.max(stemP, 0.0001);
        stemMat.opacity = 0.3 * stemP;
        nodes.forEach((n, i) => {
          const pop = easeOutBack(clamp01((b - (0.2 + i * 0.07)) / 0.18));
          n.scale.setScalar(Math.max(pop * (1 + Math.sin(t * 2.2 + i) * 0.1 + glow * 0.22), 0.0001));
        });
        lg.setDrawRange(0, Math.floor(edges.length * ease(clamp01((b - 0.3) / 0.45))) * 2);
        const coreP = easeOutBack(clamp01((b - 0.55) / 0.35));
        aiCore.scale.setScalar(Math.max(coreP * (1 + Math.sin(t * 2.2) * 0.07 + glow * 0.18), 0.0001));
        cage.scale.setScalar(Math.max(coreP, 0.0001));
        halo.material.opacity = (0.35 + glow * 0.3) * clamp01(coreP);
        const ballP = easeOutBack(clamp01((b - 0.8) / 0.2));
        orbit.scale.setScalar(Math.max(ballP, 0.0001));
        orbitMat.opacity = 0.3 * clamp01(ballP);

        // continuous motion
        spin.rotation.y = t * 0.5;
        const ang = t * 2.4;
        orbit.rotation.set(1.0, 0, 0.35 + Math.sin(t * 0.4) * 0.3);
        ball.position.set(Math.cos(ang) * ORB_R, 0, Math.sin(ang) * ORB_R);
        trail.forEach((sp, k) => {
          const a2 = ang - (k + 1) * 0.16;
          sp.position.set(Math.cos(a2) * ORB_R, 0, Math.sin(a2) * ORB_R);
        });

        signals.forEach((sg2) => {
          sg2.sprite.visible = b > 0.85;
          sg2.st += dt * (1.2 + glow * 1.3);
          if (sg2.st >= 1) {
            sg2.st = 0;
            const e = edges[Math.floor(Math.random() * edges.length)];
            sg2.edge = Math.random() > 0.5 ? e : [e[1], e[0]];
          }
          sg2.sprite.position.lerpVectors(sg2.edge[0], sg2.edge[1], sg2.st);
        });
        lineMat.opacity = 0.5 + glow * 0.45;
        aiCore.rotation.y = t * 0.7;
        aiCore.rotation.x = t * 0.4;
        cage.rotation.y = -t * 0.35 + (1 - clamp01(coreP)) * 2.2;
        cage.rotation.z = t * 0.2;
        coreMat.emissiveIntensity = 0.2 + glow * 0.4;
      };
    };

    const builders = [buildCloud, buildCode, buildApps, buildBrain];

    // ───────────── layers ─────────────
    const restY = (i: number) => (i - (LAYERS.length - 1) / 2) * GAP;
    const layers: Layer[] = LAYERS.map((def, i) => {
      const group = new THREE.Group();
      stack.add(group);
      const slabMat =
        i === 0
          ? std(INDIGO, { roughness: 0.35, metalness: 0.25, emissive: def.accent })
          : std(0xffffff, { roughness: 0.2, transparent: true, opacity: 0.6, emissive: def.accent });
      slabMat.emissiveIntensity = 0;
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.userData.index = i;
      group.add(slab);
      const rimMat = track(new THREE.MeshBasicMaterial({ color: i === 0 ? 0x6fd0ff : def.accent, transparent: true, opacity: 0.3 }));
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.y = TOP + 0.003;
      group.add(rim);

      const label = document.createElement("div");
      Object.assign(label.style, {
        position: "absolute", left: "0", top: "0", display: "flex", alignItems: "center", gap: "6px",
        opacity: "0", willChange: "transform, opacity", transformOrigin: "0 50%",
      });
      const lead = document.createElement("span");
      Object.assign(lead.style, { width: "20px", height: "1.5px", background: "rgba(26,20,165,.45)", borderRadius: "2px" });
      const pill = document.createElement("span");
      pill.textContent = def.label;
      Object.assign(pill.style, {
        padding: "4px 11px", borderRadius: "999px", font: "600 12.5px/1.3 system-ui, sans-serif",
        whiteSpace: "nowrap", color: "#1a14a5", background: "rgba(255,255,255,.94)",
        boxShadow: "0 4px 14px rgba(26,20,165,.2)", border: "1px solid rgba(26,20,165,.12)",
      });
      label.append(lead, pill);
      labelLayer.appendChild(label);

      return {
        group, slab, slabMat, rimMat, accent: new THREE.Color(def.accent), label,
        labelW: label.offsetWidth || 150, y: restY(i), glow: 0, shown: 0,
        animate: builders[i](group),
      };
    });
    const slabs = layers.map((l) => l.slab);

    // corner rails + data packets climbing them
    const rails = new THREE.Group();
    stack.add(rails);
    {
      const c = HALF - 0.32;
      const seg: number[] = [];
      [[c, c], [c, -c], [-c, c], [-c, -c]].forEach(([x, z]) => seg.push(x, 0, z, x, 1, z));
      const rg = track(new THREE.BufferGeometry());
      rg.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
      rails.add(new THREE.LineSegments(rg, track(new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.28 }))));
    }
    const packets = Array.from({ length: small ? 6 : 10 }, (_, i) => {
      const c = HALF - 0.32;
      const sprite = glowSprite(i % 2 ? CYAN : VIOLET, 0.2, 0.9);
      sprite.position.set(i % 4 < 2 ? c : -c, 0, i % 2 ? c : -c);
      stack.add(sprite);
      return { sprite, phase: Math.random(), speed: 0.16 + Math.random() * 0.16 };
    });

    // floor: soft glow + ripples spreading out from under the stack
    const floor = new THREE.Group();
    stack.add(floor);
    const floorGlow = glowSprite(VIOLET, 1, 0.22);
    floorGlow.scale.set(5.2, 1.7, 1);
    floor.add(floorGlow);
    const rippleGeo = track(new THREE.RingGeometry(0.985, 1, 96));
    rippleGeo.rotateX(-Math.PI / 2);
    const ripples = [0, 1, 2].map((i) => {
      const mat = track(new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      const mesh = new THREE.Mesh(rippleGeo, mat);
      floor.add(mesh);
      return { mesh, mat, offset: i / 3 };
    });

    // dust drifting around the stack
    const dust = new THREE.Group();
    tilt.add(dust);
    {
      const n = small ? 36 : 70;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = 1.9 + Math.random() * 1.1;
        const a = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 3.8;
        pos[i * 3 + 2] = Math.sin(a) * r;
      }
      const dg = track(new THREE.BufferGeometry());
      dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      dust.add(new THREE.Points(dg, track(new THREE.PointsMaterial({ map: glowMap, color: VIOLET, size: 0.08, transparent: true, opacity: 0.5, depthWrite: false }))));
    }

    // backdrop: dot-wave floor across the full hero width
    const waveUniforms = {
      uTime: { value: 0 },
      uSize: { value: 0.048 },
      uProj: { value: 1000 },
      uPR: { value: renderer.getPixelRatio() },
      uFade: { value: 0 },
    };
    const waves = new THREE.Group();
    scene.add(waves);
    {
      const cols = small ? 70 : 130;
      const rows = small ? 26 : 46;
      const pos = new Float32Array(cols * rows * 3);
      let k = 0;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          pos[k++] = (i / (cols - 1) - 0.5) * 18;
          pos[k++] = 0;
          pos[k++] = (j / (rows - 1)) * 7 - 5;
        }
      }
      const wgeo = track(new THREE.BufferGeometry());
      wgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      waves.add(
        new THREE.Points(
          wgeo,
          track(new THREE.ShaderMaterial({ vertexShader: WAVE_VERT, fragmentShader: WAVE_FRAG, transparent: true, depthWrite: false, uniforms: waveUniforms })),
        ),
      );
    }

    // ───────────── layout: centre the stack on the stage slot ─────────────
    let W = 1;
    let H = 1;
    let coreScale = 1;
    let baseY = 0;
    let baseX = 0;
    let visW = 1;
    const layout = () => {
      W = wrap.clientWidth || 1;
      H = wrap.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      const visH = 2 * Math.tan((FOV * Math.PI) / 360) * CAM;
      const unitsPerPx = visH / H;
      visW = visH * (W / H);
      waveUniforms.uProj.value = H / (2 * Math.tan((FOV * Math.PI) / 360));
      const portrait = W < 1024 || W / H < 1.1;
      waves.position.set(0, -visH * 0.5 - (portrait ? 0.2 : 0.1), -1.5);
      waves.scale.setScalar(portrait ? 0.7 : 1);

      const stage = getStage();
      let cx = W * 0.72;
      let cy = H * 0.5;
      let radiusPx = Math.min(W * 0.2, H * 0.36);
      if (stage) {
        const wb = wrap.getBoundingClientRect();
        const sb = stage.getBoundingClientRect();
        cx = sb.left - wb.left + sb.width / 2;
        cy = sb.top - wb.top + sb.height / 2;
        radiusPx = Math.min(sb.width, sb.height) / 2;
      }
      coreScale = (radiusPx * unitsPerPx) / OUTER;
      root.scale.setScalar(coreScale);
      baseY = (H / 2 - cy) * unitsPerPx;
      baseX = (cx - W / 2) * unitsPerPx;
      root.position.set(baseX, baseY, 0);
      layers.forEach((l) => (l.labelW = l.label.offsetWidth || l.labelW));
    };
    layout();

    // ───────────── pointer: parallax + layer hover/tap ─────────────
    let px = 0;
    let py = 0;
    let hovered: number | null = null;
    let tapTimer = 0;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const v = new THREE.Vector3();

    const pickLayer = (e: PointerEvent): number | null => {
      const stage = getStage();
      if (stage) {
        const s = stage.getBoundingClientRect();
        const pad = s.width * 0.08;
        if (e.clientX < s.left - pad || e.clientX > s.right + pad || e.clientY < s.top - pad || e.clientY > s.bottom + pad) return null;
      }
      const b = wrap.getBoundingClientRect();
      ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(slabs, false)[0];
      return hit ? (hit.object.userData.index as number) : null;
    };
    const onMove = (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, ((e.clientX - b.left) / b.width) * 2 - 1));
      py = Math.max(-1, Math.min(1, ((e.clientY - b.top) / b.height) * 2 - 1));
      if (e.pointerType !== "touch") hovered = pickLayer(e);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const hit = pickLayer(e);
      if (hit === null) return;
      hovered = hit;
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(() => (hovered = null), 4000);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    // ───────────── loop ─────────────
    // The start-up animation, the AI build-up and the orbiting always play.
    // For users who ask the OS for reduced motion, the large ambient movement
    // (view sway, mouse parallax, floating, the highlight cycling through layers)
    // is switched off; `ambient` scales it.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = 1;
    const ambient = reduce ? 0 : 1;
    const timer = new THREE.Timer();
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const ease = (x: number) => 1 - Math.pow(1 - x, 4);
    const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
    let raf = 0;
    let running = false;
    let elapsed = 0;
    let introT = 0; // seconds since the scene started
    const targetY: number[] = [];
    const landed: number[] = layers.map(() => 0);

    const draw = (dt: number) => {
      elapsed += dt;
      introT += dt;
      const intro = clamp01(introT / 1.6); // general fade-in (waves, rails, floor)
      // the whole stack glides in from the left edge, spinning as it settles
      const slideP = ease(clamp01(introT / 1.9));
      root.position.x = baseX - (baseX + visW / 2 + 2.6 * coreScale) * (1 - slideP);
      root.rotation.y = (1 - slideP) * 1.4;
      waveUniforms.uTime.value = elapsed;
      waveUniforms.uFade.value = ease(intro);

      // isometric three-quarter view that sways, plus pointer parallax
      const ry = Math.PI / 4 + (Math.sin(elapsed * 0.3) * 0.5 + px * 0.45) * ambient;
      const rx = 0.42 + (Math.sin(elapsed * 0.4) * 0.04 + py * 0.16) * ambient;
      tilt.rotation.y += (ry - tilt.rotation.y) * 0.05;
      tilt.rotation.x += (rx - tilt.rotation.x) * 0.05;
      root.position.y = baseY + Math.sin(elapsed * 0.8) * 0.05 * ambient;
      dust.rotation.y = elapsed * 0.05;
      dust.position.y = Math.sin(elapsed * 0.5) * 0.1;

      // which layer is highlighted: hovered/tapped one, else cycle through them
      const active = hovered ?? (reduce ? layers.length - 1 : Math.floor(elapsed / CYCLE_S) % layers.length);

      // open a wide gap above the active layer so nothing covers it; the other
      // gaps tighten, so the stack keeps its overall height
      const last = layers.length - 1;
      targetY[0] = restY(0);
      for (let i = 1; i <= last; i++) {
        const gap = active === last ? GAP : i - 1 === active ? OPEN_GAP : (GAP * last - OPEN_GAP) / (last - 1);
        targetY[i] = targetY[i - 1] + gap;
      }

      layers.forEach((l, i) => {
        const on = active === i ? 1 : 0;
        l.glow += (on - l.glow) * 0.1;
        const breathe = (i - 1.5) * Math.sin(elapsed * 0.9) * 0.02 * ambient;
        l.y += (targetY[i] + breathe - l.y) * 0.08;
        // layers land one after another, bottom to top
        const lp = clamp01((introT - (0.15 + i * 0.55)) / 0.9);
        landed[i] = lp;
        const drop = 1 - ease(lp);
        l.group.position.y = l.y + drop * 2.6;
        l.group.scale.setScalar(Math.max(1 - drop * 0.5, 0.0001));
        l.group.visible = drop < 0.999;
        l.slabMat.emissiveIntensity = l.glow * (i === 0 ? 0.5 : 0.16);
        l.rimMat.opacity = 0.28 + l.glow * 0.72;
        // the top (AI) layer then builds itself piece by piece after it lands
        l.animate(elapsed, l.glow, i === layers.length - 1 ? clamp01((introT - 2.5) / 2.0) : 1);
      });

      const bottom = layers[0].group.position.y;
      const top = layers[layers.length - 1].group.position.y;
      rails.position.y = bottom;
      rails.scale.y = Math.max(top - bottom, 0.0001);
      packets.forEach((p) => {
        const f = (p.phase + elapsed * p.speed * motion) % 1;
        p.sprite.position.y = bottom + (top - bottom) * f;
        p.sprite.material.opacity = Math.sin(f * Math.PI) * 0.9 * ease(intro);
      });

      floor.position.y = layers[0].y - 0.42;
      floorGlow.material.opacity = 0.22 * ease(intro);
      ripples.forEach((r) => {
        const f = (r.offset + elapsed * 0.22 * motion) % 1;
        r.mesh.scale.setScalar(1.3 + f * 1.5);
        r.mat.opacity = (1 - f) * 0.3 * ease(intro);
      });

      renderer.render(scene, camera);

      // labels sit to the right of their layer
      layers.forEach((l) => {
        l.group.getWorldPosition(v);
        v.x += HALF * 1.36 * coreScale;
        v.project(camera);
        // every layer keeps its name visible; the highlighted one is brighter and a touch larger
        l.shown += (ease(landed[layers.indexOf(l)]) * (0.68 + 0.32 * l.glow) - l.shown) * 0.15;
        const x = Math.max(8, Math.min(W - l.labelW - 8, (v.x * 0.5 + 0.5) * W));
        const y = (-v.y * 0.5 + 0.5) * H;
        l.label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(0, -50%) scale(${(1 + 0.07 * l.glow).toFixed(3)})`;
        l.label.style.opacity = l.shown.toFixed(3);
      });
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      timer.update();
      draw(Math.min(timer.getDelta(), 0.05));
    };
    const start = () => {
      if (running) return;
      running = true;
      timer.update();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resizeObserver = new ResizeObserver(() => {
      layout();
      if (!running) draw(0);
    });
    resizeObserver.observe(wrap);
    const stageEl = getStage();
    if (stageEl) resizeObserver.observe(stageEl);

    let visible = true;
    const sync = () => (visible && !document.hidden ? start() : stop());
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      window.clearTimeout(tapTimer);
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
      labelLayer.remove();
    };
  }, []);

  return <div ref={wrapRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}