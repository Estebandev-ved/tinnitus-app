import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SoundJourneyEar
 * ------------------------------------------------------------------
 * The 3D centerpiece of the new interactive landing page. Reuses the
 * same anatomical geometry as HolographicEar.jsx (pinna, ear canal,
 * ossicles, cochlea, vestibular canals, auditory nerve) but instead of
 * a self-contained rotating hologram with OrbitControls, this version:
 *
 *  - is driven entirely from the outside via `stateRef` (a mutable ref
 *    updated by LandingPage's scroll handler — never React state, so
 *    scrolling never triggers a re-render here);
 *  - morphs each part from a soft "organic" material (calm, solid,
 *    lavender) into a neon wireframe hologram as `stateRef.current.style`
 *    goes from 0 -> 1, matching the approved "mezcla" visual direction;
 *  - plays a one-time "assembly" intro where the whole ear forms out of
 *    scattered light particles.
 *
 * HolographicEar.jsx itself is untouched — it's still used as-is by
 * DigitalTwin.jsx for the crisis-probability widget.
 * ------------------------------------------------------------------
 */

const CYAN = '#00e8ff';
const RED = '#ff4b4b';
const PURPLE = '#b583ff';

function buildCochleaPoints() {
  const pts = [];
  const turns = 2.6;
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const r = 0.38 * (1 - t * 0.78);
    pts.push([Math.cos(angle) * r - 2.1, Math.sin(angle) * r - 0.1, t * 0.3 + 0.05]);
  }
  return pts;
}

function loop(pts) {
  return pts.concat([pts[0]]);
}

// ------------------------------------------------------------------
// Cheap, dependency-free 3D value noise (classic hash + smoothstep
// lattice interpolation). Used to break up the tubes/spheres from
// perfectly smooth CG primitives into something that reads as organic
// cartilage/tissue, both as a real geometric displacement and as a
// procedural bump-map texture — no external noise library or image
// asset needed.
function noiseHash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function lerpN(a, b, t) {
  return a + (b - a) * t;
}

function valueNoise3(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const w = smooth(z - zi);
  const x00 = lerpN(noiseHash3(xi, yi, zi), noiseHash3(xi + 1, yi, zi), u);
  const x10 = lerpN(noiseHash3(xi, yi + 1, zi), noiseHash3(xi + 1, yi + 1, zi), u);
  const x01 = lerpN(noiseHash3(xi, yi, zi + 1), noiseHash3(xi + 1, yi, zi + 1), u);
  const x11 = lerpN(noiseHash3(xi, yi + 1, zi + 1), noiseHash3(xi + 1, yi + 1, zi + 1), u);
  const y0 = lerpN(x00, x10, v);
  const y1 = lerpN(x01, x11, v);
  return lerpN(y0, y1, w);
}

// Displaces every vertex along its own normal using two octaves of value
// noise — a subtle organic irregularity instead of a perfectly smooth
// tube/sphere. Runs once at build time (not per-frame), so it's cheap.
function addOrganicDetail(geo, amount, freq = 10) {
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const normal = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n1 = valueNoise3(x * freq, y * freq, z * freq) - 0.5;
    const n2 = (valueNoise3(x * freq * 2.3, y * freq * 2.3, z * freq * 2.3) - 0.5) * 0.4;
    const n = n1 + n2;
    pos.setXYZ(i, x + normal.getX(i) * n * amount, y + normal.getY(i) * n * amount, z + normal.getZ(i) * n * amount);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// Small procedural grayscale texture (skin/cartilage micro-detail) used as
// a bump map so surfaces pick up fine tissue-like relief under light even
// where the geometry itself stays smooth — again no external asset.
function buildBumpTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const n1 = valueNoise3(nx * 9, ny * 9, 1.7);
      const n2 = valueNoise3(nx * 23, ny * 23, 4.2) * 0.45;
      const v = Math.max(0, Math.min(255, Math.round(((n1 + n2) / 1.45) * 255)));
      const idx = (y * size + x) * 4;
      img.data[idx] = v;
      img.data[idx + 1] = v;
      img.data[idx + 2] = v;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  return tex;
}

// Pinna (outer ear) — helix, antihelix, crus superior, tragus, antitragus.
const PINNA_HELIX_POINTS = [
  [0.15, -2.0, 0], [0.5, -1.85, 0.08], [0.85, -1.55, 0.14], [1.1, -1.15, 0.18],
  [1.25, -0.7, 0.2], [1.35, -0.2, 0.18], [1.38, 0.2, 0.16], [1.3, 0.6, 0.12],
  [1.15, 1.0, 0.06], [0.9, 1.35, 0], [0.55, 1.6, -0.06], [0.2, 1.75, -0.08],
  [-0.1, 1.72, -0.06], [-0.35, 1.55, -0.02], [-0.5, 1.3, 0],
];
const PINNA_ANTIHELIX_POINTS = [
  [-0.5, 1.3, 0], [-0.35, 1.05, 0.12], [-0.15, 0.75, 0.2], [0.1, 0.4, 0.28],
  [0.3, 0.1, 0.32], [0.4, -0.2, 0.3], [0.35, -0.55, 0.26], [0.2, -0.85, 0.2],
  [0, -1.05, 0.12], [-0.2, -1.15, 0.06],
];
const PINNA_CRUS_SUPERIOR_POINTS = [
  [0.1, 0.4, 0.28], [0.0, 0.65, 0.22], [-0.15, 0.85, 0.15], [-0.25, 1.0, 0.08],
];
const PINNA_TRAGUS_POINTS = [
  [-0.2, -1.15, 0.06], [-0.05, -0.85, 0.25], [0.05, -0.55, 0.35], [0.0, -0.25, 0.38], [-0.1, 0.0, 0.3],
];
const PINNA_ANTITRAGUS_POINTS = [
  [0.15, -2.0, 0], [0.0, -1.7, 0.1], [-0.15, -1.45, 0.15], [-0.2, -1.15, 0.06],
];

// Ear canal.
const EAR_CANAL_POINTS = [
  [-0.1, -0.05, 0.28], [-0.4, -0.08, 0.35], [-0.7, -0.1, 0.25], [-0.95, -0.08, 0.15], [-1.1, -0.05, 0.08],
];

// Ossicles (malleus, incus, stapes).
const MALLEUS_POINTS = [[-1.1, -0.05, 0.08], [-1.05, 0.15, 0.06], [-1.0, 0.3, 0.04]];
const INCUS_POINTS = [[-1.0, 0.3, 0.04], [-1.15, 0.28, 0.02], [-1.25, 0.18, 0.0]];
const STAPES_POINTS = [[-1.25, 0.18, 0.0], [-1.35, 0.1, -0.02], [-1.42, 0.02, -0.03]];

// Vestibular canals (3 loops).
const VESTIBULAR_LOOP_1 = loop([
  [-1.9, 0.5, 0], [-1.9, 0.75, 0.1], [-1.95, 0.92, 0.06], [-2.0, 0.75, -0.04], [-1.95, 0.55, -0.06],
]);
const VESTIBULAR_LOOP_2 = loop([
  [-1.9, 0.5, 0], [-1.75, 0.7, -0.1], [-1.7, 0.88, -0.04], [-1.78, 0.92, 0.06], [-1.9, 0.7, 0.08],
]);
const VESTIBULAR_LOOP_3 = loop([
  [-1.9, 0.5, 0], [-1.7, 0.55, 0.08], [-1.6, 0.65, 0.04], [-1.65, 0.75, -0.04], [-1.8, 0.65, -0.06],
]);

// Auditory nerve (purple).
const AUDITORY_NERVE_POINTS = [
  [-2.1, -0.1, 0.05], [-2.25, -0.4, 0.0], [-2.35, -0.75, -0.03], [-2.4, -1.1, -0.06], [-2.42, -1.5, -0.08],
];

const TUBE_SPECS = [
  { points: PINNA_HELIX_POINTS, radius: 0.075, color: CYAN },
  { points: PINNA_ANTIHELIX_POINTS, radius: 0.055, color: CYAN },
  { points: PINNA_CRUS_SUPERIOR_POINTS, radius: 0.04, color: CYAN, segments: 32 },
  { points: PINNA_TRAGUS_POINTS, radius: 0.045, color: CYAN, segments: 32 },
  { points: PINNA_ANTITRAGUS_POINTS, radius: 0.04, color: CYAN, segments: 32 },
  { points: EAR_CANAL_POINTS, radius: 0.1, color: CYAN },
  { points: MALLEUS_POINTS, radius: 0.03, color: CYAN, segments: 24 },
  { points: INCUS_POINTS, radius: 0.028, color: CYAN, segments: 24 },
  { points: STAPES_POINTS, radius: 0.025, color: CYAN, segments: 24 },
  { points: buildCochleaPoints(), radius: 0.035, color: RED, segments: 90 },
  { points: VESTIBULAR_LOOP_1, radius: 0.025, color: CYAN, segments: 40 },
  { points: VESTIBULAR_LOOP_2, radius: 0.025, color: CYAN, segments: 40 },
  { points: VESTIBULAR_LOOP_3, radius: 0.025, color: CYAN, segments: 40 },
  { points: AUDITORY_NERVE_POINTS, radius: 0.04, color: PURPLE, segments: 40 },
];

const SPHERE_SPECS = [
  { pos: [0.2, -2.0, 0.04], radius: 0.2, color: CYAN }, // earlobe
  { pos: [0.05, -0.15, 0.22], radius: 0.5, color: CYAN }, // concha
  {
    // tympanic membrane
    pos: [-1.1, -0.05, 0.08], radius: 0.14, color: CYAN,
    rotation: [0.1, 0.6, 0.15], scale: [1, 1, 0.22],
    baseSolid: 0.32, baseWire: 0.85, baseGlow: 0.3,
  },
  { pos: [-1.0, 0.3, 0.04], radius: 0.045, color: CYAN },
  { pos: [-1.25, 0.18, 0.0], radius: 0.04, color: CYAN },
  { pos: [-1.42, 0.02, -0.03], radius: 0.035, color: CYAN },
];

function buildParts() {
  const parts = [];
  const assemblyTargets = [];

  TUBE_SPECS.forEach((spec) => {
    const curve = new THREE.CatmullRomCurve3(
      spec.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    );
    const segments = spec.segments || 48;
    // 16 radial sides (up from the original 10) rounds off the faceted,
    // low-poly look of the tube cross-section, then addOrganicDetail
    // breaks the now-round tube out of "perfect CG cylinder" territory.
    const geo = new THREE.TubeGeometry(curve, segments, spec.radius, 16, false);
    addOrganicDetail(geo, spec.radius * 0.3);
    const geoGlow = new THREE.TubeGeometry(curve, segments, spec.radius * 2.1, 16, false);
    const sampleCount = Math.max(10, Math.round(segments / 3));
    curve.getPoints(sampleCount).forEach((v) => assemblyTargets.push(v));
    parts.push({
      kind: 'tube', geo, geoGlow, color: spec.color,
      baseSolid: 0.5, baseWire: 0.85, baseGlow: 0.28,
    });
  });

  SPHERE_SPECS.forEach((spec) => {
    const geo = new THREE.SphereGeometry(spec.radius, 24, 18);
    addOrganicDetail(geo, spec.radius * 0.12);
    for (let i = 0; i < 4; i++) {
      assemblyTargets.push(new THREE.Vector3(spec.pos[0], spec.pos[1], spec.pos[2]));
    }
    parts.push({
      kind: 'sphere', geo, color: spec.color, pos: spec.pos,
      rotation: spec.rotation || [0, 0, 0], scale: spec.scale || [1, 1, 1],
      baseSolid: spec.baseSolid ?? 0.5, baseWire: spec.baseWire ?? 0.85, baseGlow: spec.baseGlow ?? 0.28,
    });
  });

  return { parts, assemblyTargets };
}

function randomOnSphere(radius) {
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(ph) * Math.cos(th),
    radius * Math.sin(ph) * Math.sin(th),
    radius * Math.cos(ph)
  );
}

function EarRig({ stateRef }) {
  const { camera } = useThree();
  const built = useMemo(buildParts, []);
  const groupRef = useRef();
  const solidRefs = useRef([]);
  const wireRefs = useRef([]);
  const glowRefs = useRef([]);
  const particlesRef = useRef();
  const warmLightRef = useRef();
  const coolLightRef = useRef();
  const glowSpriteRef = useRef();

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const camPosCur = useRef(new THREE.Vector3().fromArray(stateRef.current.camPos));
  const camLookCur = useRef(new THREE.Vector3().fromArray(stateRef.current.camLook));
  const styleCur = useRef(stateRef.current.style);
  const assemblyStart = useRef(null);

  const startPositions = useMemo(
    () => built.assemblyTargets.map(() => randomOnSphere(5 + Math.random() * 3)),
    [built]
  );

  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(startPositions.length * 3);
    startPositions.forEach((v, i) => {
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, [startPositions]);

  const starGeo = useMemo(() => {
    const count = 320;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 9 + Math.random() * 14;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(ph) - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  // Procedural soft-glow sprite for the cochlea "hotspot" — a cheap,
  // dependency-free stand-in for real bloom post-processing. It fades
  // in specifically as the camera nears the cochlea/nerve stops, giving
  // the scene a sense of light bleed instead of everything reading flat.
  const glowTexture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,80,80,0.55)');
    grad.addColorStop(1, 'rgba(255,80,80,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Fine skin/cartilage micro-relief for the solid ("organic") material —
  // see buildBumpTexture above.
  const bumpTexture = useMemo(buildBumpTexture, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const now = performance.now();
    const elapsed = now / 1000;
    if (assemblyStart.current === null) assemblyStart.current = now;
    const dur = reducedMotion ? 1 : 2300;
    const aT = Math.min(1, (now - assemblyStart.current) / dur);
    const aEase = 1 - Math.pow(1 - aT, 3);

    const posAttr = particleGeo.attributes.position;
    for (let i = 0; i < built.assemblyTargets.length; i++) {
      const target = built.assemblyTargets[i];
      const start = startPositions[i];
      posAttr.array[i * 3] = start.x + (target.x - start.x) * aEase;
      posAttr.array[i * 3 + 1] =
        start.y + (target.y - start.y) * aEase + (aT >= 1 ? Math.sin(elapsed * 0.6 + i) * 0.01 : 0);
      posAttr.array[i * 3 + 2] = start.z + (target.z - start.z) * aEase;
    }
    posAttr.needsUpdate = true;
    if (particlesRef.current) particlesRef.current.material.opacity = 0.9 * (1 - aEase * 0.85);

    const st = stateRef.current;
    const damp = reducedMotion ? 1 : 1 - Math.pow(0.001, dt);
    camPosCur.current.lerp(new THREE.Vector3().fromArray(st.camPos), damp);
    camLookCur.current.lerp(new THREE.Vector3().fromArray(st.camLook), damp);
    styleCur.current += (st.style - styleCur.current) * damp;

    camera.position.copy(camPosCur.current);
    camera.lookAt(camLookCur.current);

    const journeyEnter = Math.min(1, Math.max(0, (styleCur.current - 0.05) / 0.13));
    const wobble = reducedMotion ? 0 : Math.sin(elapsed * 0.15) * 0.16 * (1 - journeyEnter);
    if (groupRef.current) groupRef.current.rotation.y = wobble;

    built.parts.forEach((p, i) => {
      const solid = solidRefs.current[i];
      const wire = wireRefs.current[i];
      const glow = glowRefs.current[i];
      if (solid) solid.opacity = p.baseSolid * (1 - styleCur.current) * aEase;
      if (wire) wire.opacity = p.baseWire * styleCur.current * aEase;
      if (glow) glow.opacity = p.baseGlow * styleCur.current * aEase;
    });

    if (warmLightRef.current) warmLightRef.current.intensity = 1.1 * (1 - styleCur.current) + 0.35;
    if (coolLightRef.current) coolLightRef.current.intensity = 1.3 * styleCur.current + 0.1;

    if (glowSpriteRef.current) {
      const cochleaReveal = Math.min(1, Math.max(0, (styleCur.current - 0.55) / 0.35));
      glowSpriteRef.current.material.opacity = 0.5 * cochleaReveal * aEase;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#07060d', 3, 16]} />
      <hemisphereLight args={['#7ec8ff', '#0a0714', 0.55]} />
      <pointLight ref={warmLightRef} color="#c3b7ea" position={[4, 3, 5]} intensity={1.1} />
      <pointLight ref={coolLightRef} color="#00e8ff" position={[-4, -2, 3]} intensity={0.2} />
      <pointLight color="#b583ff" position={[-4, 1, -3]} intensity={0.4} />

      <sprite ref={glowSpriteRef} position={[-2.1, -0.1, 0.15]} scale={[1.7, 1.7, 1.7]}>
        <spriteMaterial
          map={glowTexture}
          color="#ff4b4b"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <group ref={groupRef}>
        {built.parts.map((part, i) =>
          part.kind === 'tube' ? (
            <group key={i}>
              <mesh geometry={part.geo}>
                <meshPhysicalMaterial
                  ref={(el) => (solidRefs.current[i] = el)}
                  color="#c3b7ea"
                  emissive="#2b2440"
                  emissiveIntensity={0.4}
                  roughness={0.4}
                  metalness={0.15}
                  clearcoat={0.5}
                  clearcoatRoughness={0.3}
                  iridescence={0.3}
                  iridescenceIOR={1.3}
                  bumpMap={bumpTexture}
                  bumpScale={0.012}
                  transparent
                  opacity={0}
                />
              </mesh>
              <mesh geometry={part.geo}>
                <meshBasicMaterial
                  ref={(el) => (wireRefs.current[i] = el)}
                  color={part.color}
                  wireframe
                  transparent
                  opacity={0}
                />
              </mesh>
              <mesh geometry={part.geoGlow}>
                <meshBasicMaterial
                  ref={(el) => (glowRefs.current[i] = el)}
                  color={part.color}
                  transparent
                  opacity={0}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </group>
          ) : (
            <group key={i} position={part.pos} rotation={part.rotation} scale={part.scale}>
              <mesh geometry={part.geo}>
                <meshPhysicalMaterial
                  ref={(el) => (solidRefs.current[i] = el)}
                  color="#c3b7ea"
                  emissive="#2b2440"
                  emissiveIntensity={0.4}
                  roughness={0.35}
                  metalness={0.15}
                  clearcoat={0.5}
                  clearcoatRoughness={0.3}
                  iridescence={0.3}
                  iridescenceIOR={1.3}
                  bumpMap={bumpTexture}
                  bumpScale={0.012}
                  transparent
                  opacity={0}
                />
              </mesh>
              <mesh geometry={part.geo}>
                <meshBasicMaterial
                  ref={(el) => (wireRefs.current[i] = el)}
                  color={part.color}
                  wireframe
                  transparent
                  opacity={0}
                />
              </mesh>
              <mesh geometry={part.geo} scale={1.7}>
                <meshBasicMaterial
                  ref={(el) => (glowRefs.current[i] = el)}
                  color={part.color}
                  transparent
                  opacity={0}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </group>
          )
        )}
      </group>

      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          color="#c3b7ea"
          size={0.045}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points geometry={starGeo}>
        <pointsMaterial color="#8c789b" size={0.035} transparent opacity={0.5} sizeAttenuation />
      </points>
    </>
  );
}

/**
 * @param {{ stateRef: React.MutableRefObject<{camPos:number[], camLook:number[], style:number}> }} props
 */
export default function SoundJourneyEar({ stateRef }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      camera={{ fov: 45, near: 0.1, far: 100, position: stateRef.current.camPos }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <EarRig stateRef={stateRef} />
    </Canvas>
  );
}
