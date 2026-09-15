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
    const geo = new THREE.TubeGeometry(curve, segments, spec.radius, 10, false);
    const geoGlow = new THREE.TubeGeometry(curve, segments, spec.radius * 2.1, 10, false);
    const sampleCount = Math.max(10, Math.round(segments / 3));
    curve.getPoints(sampleCount).forEach((v) => assemblyTargets.push(v));
    parts.push({
      kind: 'tube', geo, geoGlow, color: spec.color,
      baseSolid: 0.5, baseWire: 0.85, baseGlow: 0.28,
    });
  });

  SPHERE_SPECS.forEach((spec) => {
    const geo = new THREE.SphereGeometry(spec.radius, 14, 14);
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
  });

  return (
    <>
      <ambientLight intensity={0.18} />
      <pointLight ref={warmLightRef} color="#c3b7ea" position={[4, 3, 5]} intensity={1.1} />
      <pointLight ref={coolLightRef} color="#00e8ff" position={[-4, -2, 3]} intensity={0.2} />

      <group ref={groupRef}>
        {built.parts.map((part, i) =>
          part.kind === 'tube' ? (
            <group key={i}>
              <mesh geometry={part.geo}>
                <meshStandardMaterial
                  ref={(el) => (solidRefs.current[i] = el)}
                  color="#c3b7ea"
                  emissive="#2b2440"
                  emissiveIntensity={0.4}
                  roughness={0.55}
                  metalness={0.15}
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
                <meshStandardMaterial
                  ref={(el) => (solidRefs.current[i] = el)}
                  color="#c3b7ea"
                  emissive="#2b2440"
                  emissiveIntensity={0.4}
                  roughness={0.5}
                  metalness={0.15}
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
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 45, near: 0.1, far: 100, position: stateRef.current.camPos }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <EarRig stateRef={stateRef} />
    </Canvas>
  );
}
