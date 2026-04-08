import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ──────────── MATERIALS ──────────── */
const useHoloMaterials = () => {
    return useMemo(() => ({
        neonBlue: new THREE.MeshBasicMaterial({
            color: new THREE.Color('#00f2ff'),
            wireframe: true,
            transparent: true,
            opacity: 0.7,
        }),
        neonBlueSolid: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#00a8cc'),
            emissive: new THREE.Color('#00f2ff'),
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.25,
            metalness: 0.9,
            roughness: 0.1,
            side: THREE.DoubleSide,
        }),
        neonRed: new THREE.MeshBasicMaterial({
            color: new THREE.Color('#ff4040'),
            wireframe: true,
            transparent: true,
            opacity: 0.85,
        }),
        neonRedSolid: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ff2020'),
            emissive: new THREE.Color('#ff4040'),
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 0.35,
            metalness: 0.8,
            roughness: 0.1,
        }),
        neonPurple: new THREE.MeshBasicMaterial({
            color: new THREE.Color('#9b59b6'),
            wireframe: true,
            transparent: true,
            opacity: 0.7,
        }),
        scanRing: new THREE.MeshBasicMaterial({
            color: new THREE.Color('#00f2ff'),
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
        }),
    }), []);
};

/* ──────────── HoloTube: tube with wireframe + solid layers ──────────── */
const HoloTube = ({ points, radius = 0.06, material, solidMaterial, segments = 64, solidOpacity }) => {
    const curve = useMemo(
        () => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))),
        [points]
    );
    return (
        <group>
            {/* Wireframe layer */}
            <mesh material={material}>
                <tubeGeometry args={[curve, segments, radius, 12, false]} />
            </mesh>
            {/* Solid inner glow */}
            {solidMaterial && (
                <mesh material={solidMaterial}>
                    <tubeGeometry args={[curve, segments, radius * 0.7, 10, false]} />
                </mesh>
            )}
        </group>
    );
};

/* ──────────── Pinna (outer ear) ──────────── */
const Pinna = ({ mats }) => {
    // Helix - outer rim, more detailed
    const helixPts = [
        [0.15, -2.0, 0], [0.5, -1.85, 0.08], [0.85, -1.55, 0.14],
        [1.1, -1.15, 0.18], [1.25, -0.7, 0.2], [1.35, -0.2, 0.18],
        [1.38, 0.2, 0.16], [1.3, 0.6, 0.12], [1.15, 1.0, 0.06],
        [0.9, 1.35, 0], [0.55, 1.6, -0.06], [0.2, 1.75, -0.08],
        [-0.1, 1.72, -0.06], [-0.35, 1.55, -0.02], [-0.5, 1.3, 0],
    ];

    // Antihelix
    const antihelixPts = [
        [-0.5, 1.3, 0], [-0.35, 1.05, 0.12], [-0.15, 0.75, 0.2],
        [0.1, 0.4, 0.28], [0.3, 0.1, 0.32], [0.4, -0.2, 0.3],
        [0.35, -0.55, 0.26], [0.2, -0.85, 0.2], [0, -1.05, 0.12],
        [-0.2, -1.15, 0.06],
    ];

    // Antihelix superior crus
    const crusSuperior = [
        [0.1, 0.4, 0.28], [0.0, 0.65, 0.22], [-0.15, 0.85, 0.15],
        [-0.25, 1.0, 0.08],
    ];

    // Tragus
    const tragusPts = [
        [-0.2, -1.15, 0.06], [-0.05, -0.85, 0.25], [0.05, -0.55, 0.35],
        [0.0, -0.25, 0.38], [-0.1, 0.0, 0.3],
    ];

    // Anti-tragus
    const antiTragusPts = [
        [0.15, -2.0, 0], [0.0, -1.7, 0.1], [-0.15, -1.45, 0.15],
        [-0.2, -1.15, 0.06],
    ];

    return (
        <group>
            <HoloTube points={helixPts} radius={0.075} material={mats.neonBlue} solidMaterial={mats.neonBlueSolid} />
            <HoloTube points={antihelixPts} radius={0.055} material={mats.neonBlue} solidMaterial={mats.neonBlueSolid} />
            <HoloTube points={crusSuperior} radius={0.04} material={mats.neonBlue} solidMaterial={mats.neonBlueSolid} segments={32} />
            <HoloTube points={tragusPts} radius={0.045} material={mats.neonBlue} solidMaterial={mats.neonBlueSolid} segments={32} />
            <HoloTube points={antiTragusPts} radius={0.04} material={mats.neonBlue} solidMaterial={mats.neonBlueSolid} segments={32} />

            {/* Earlobe */}
            <mesh position={[0.2, -2.0, 0.04]} material={mats.neonBlueSolid}>
                <sphereGeometry args={[0.2, 16, 16]} />
            </mesh>

            {/* Concha (central bowl) */}
            <mesh position={[0.05, -0.15, 0.22]} material={mats.neonBlueSolid}>
                <sphereGeometry args={[0.5, 20, 20]} />
            </mesh>
        </group>
    );
};

/* ──────────── Ear Canal + Tympanic Membrane ──────────── */
const EarCanal = ({ mats }) => {
    const canalPts = [
        [-0.1, -0.05, 0.28], [-0.4, -0.08, 0.35], [-0.7, -0.1, 0.25],
        [-0.95, -0.08, 0.15], [-1.1, -0.05, 0.08],
    ];

    return (
        <group>
            <HoloTube points={canalPts} radius={0.1} material={mats.neonBlue} solidMaterial={mats.neonBlueSolid} segments={48} />

            {/* Tympanic Membrane (eardrum) */}
            <mesh position={[-1.1, -0.05, 0.08]} rotation={[0.1, 0.6, 0.15]}>
                <circleGeometry args={[0.14, 24]} />
                <meshStandardMaterial
                    color="#00f2ff"
                    emissive="#00f2ff"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.35}
                    side={THREE.DoubleSide}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            <mesh position={[-1.1, -0.05, 0.08]} rotation={[0.1, 0.6, 0.15]}>
                <ringGeometry args={[0.12, 0.15, 24]} />
                <meshBasicMaterial color="#00f2ff" transparent opacity={0.25} side={THREE.DoubleSide} wireframe />
            </mesh>
        </group>
    );
};

/* ──────────── Ossicles (Malleus, Incus, Stapes) ──────────── */
const Ossicles = ({ mats }) => {
    const malleusPts = [[-1.1, -0.05, 0.08], [-1.05, 0.15, 0.06], [-1.0, 0.3, 0.04]];
    const incusPts = [[-1.0, 0.3, 0.04], [-1.15, 0.28, 0.02], [-1.25, 0.18, 0.0]];
    const stapesPts = [[-1.25, 0.18, 0.0], [-1.35, 0.1, -0.02], [-1.42, 0.02, -0.03]];

    return (
        <group>
            <HoloTube points={malleusPts} radius={0.03} material={mats.neonBlue} segments={24} />
            <mesh position={[-1.0, 0.3, 0.04]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                {/* Clone to avoid shared material mutations */}
                <meshBasicMaterial color="#00f2ff" transparent opacity={0.7} />
            </mesh>

            <HoloTube points={incusPts} radius={0.028} material={mats.neonBlue} segments={24} />
            <mesh position={[-1.25, 0.18, 0.0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#00f2ff" transparent opacity={0.7} />
            </mesh>

            <HoloTube points={stapesPts} radius={0.025} material={mats.neonBlue} segments={24} />
            <mesh position={[-1.42, 0.02, -0.03]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#00f2ff" transparent opacity={0.7} />
            </mesh>
        </group>
    );
};

/* ──────────── Cochlea (spiral, RED highlight) ──────────── */
const Cochlea = ({ mats }) => {
    const points = useMemo(() => {
        const pts = [];
        const turns = 2.6;
        const steps = 90;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = t * Math.PI * 2 * turns;
            const r = 0.38 * (1 - t * 0.78);
            pts.push(new THREE.Vector3(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                t * 0.3
            ));
        }
        return pts;
    }, []);
    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

    return (
        <group position={[-2.1, -0.1, 0.05]}>
            <mesh material={mats.neonRed}>
                <tubeGeometry args={[curve, 90, 0.04, 10, false]} />
            </mesh>
            <mesh material={mats.neonRedSolid}>
                <tubeGeometry args={[curve, 90, 0.03, 8, false]} />
            </mesh>
            {/* Glow sphere */}
            <mesh>
                <sphereGeometry args={[0.45, 16, 16]} />
                <meshBasicMaterial color="#ff4040" transparent opacity={0.04} />
            </mesh>
        </group>
    );
};

/* ──────────── Vestibular (semicircular canals) ──────────── */
const Vestibular = ({ mats }) => {
    const makeLoop = (pts) => [...pts, pts[0]]; // close the loop
    const sup = [[-1.9, 0.5, 0], [-1.9, 0.75, 0.1], [-1.95, 0.92, 0.06], [-2.0, 0.75, -0.04], [-1.95, 0.55, -0.06]];
    const post = [[-1.9, 0.5, 0], [-1.75, 0.7, -0.1], [-1.7, 0.88, -0.04], [-1.78, 0.92, 0.06], [-1.9, 0.7, 0.08]];
    const lat = [[-1.9, 0.5, 0], [-1.7, 0.55, 0.08], [-1.6, 0.65, 0.04], [-1.65, 0.75, -0.04], [-1.8, 0.65, -0.06]];

    return (
        <group>
            <HoloTube points={makeLoop(sup)} radius={0.025} material={mats.neonBlue} segments={40} />
            <HoloTube points={makeLoop(post)} radius={0.025} material={mats.neonBlue} segments={40} />
            <HoloTube points={makeLoop(lat)} radius={0.025} material={mats.neonBlue} segments={40} />
        </group>
    );
};

/* ──────────── Auditory Nerve ──────────── */
const AuditoryNerve = ({ mats }) => {
    const pts = [
        [-2.1, -0.1, 0.05], [-2.25, -0.4, 0.0],
        [-2.35, -0.75, -0.03], [-2.4, -1.1, -0.06], [-2.42, -1.5, -0.08],
    ];
    return <HoloTube points={pts} radius={0.04} material={mats.neonPurple} segments={40} />;
};

/* ──────────── HTML Labels anchored in 3D ──────────── */
const HtmlLabel = ({ position, text, color = '#00f2ff' }) => (
    <Html position={position} distanceFactor={5} center style={{ pointerEvents: 'none' }}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
        }}>
            <span style={{
                fontFamily: "'Inter', 'Avenir', sans-serif",
                color,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                letterSpacing: 1.5,
                textShadow: `0 0 8px ${color}`,
            }}>{text}</span>
            <div style={{
                width: 1,
                height: 16,
                background: color,
                marginTop: 4,
                opacity: 0.5,
            }} />
        </div>
    </Html>
);

/* ──────────── Particles ──────────── */
const Particles = ({ count = 40 }) => {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() =>
        Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 7,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 3,
            speed: 0.001 + Math.random() * 0.003,
        })), [count]);

    useFrame(() => {
        particles.forEach((p, i) => {
            p.y += p.speed;
            if (p.y > 2.5) p.y = -2.5;
            dummy.position.set(p.x, p.y, p.z);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[0.01, 6, 6]} />
            <meshBasicMaterial color="#00f2ff" transparent opacity={0.35} />
        </instancedMesh>
    );
};

/* ──────────── Full Ear Assembly ──────────── */
const EarAssembly = () => {
    const mats = useHoloMaterials();
    const groupRef = useRef();

    // Slow auto-rotation
    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
    });

    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.25}>
            <group ref={groupRef} scale={0.95} position={[0.3, -0.1, 0]}>
                <Pinna mats={mats} />
                <EarCanal mats={mats} />
                <Ossicles mats={mats} />
                <Cochlea mats={mats} />
                <Vestibular mats={mats} />
                <AuditoryNerve mats={mats} />

                {/* Scan rings */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.4, 0, 0.1]} material={mats.scanRing}>
                    <torusGeometry args={[2.3, 0.008, 8, 80]} />
                </mesh>
                <mesh rotation={[Math.PI / 2.15, 0.12, 0]} position={[-0.4, 0, 0.1]} material={mats.scanRing}>
                    <torusGeometry args={[2.6, 0.006, 8, 80]} />
                </mesh>

                {/* Labels */}
                <HtmlLabel text="PINNA" position={[1.7, 0.5, 0.3]} />
                <HtmlLabel text="CANAL AUDITIVO" position={[-0.6, -0.65, 0.5]} />
                <HtmlLabel text="TÍMPANO" position={[-1.1, 0.55, 0.3]} />
                <HtmlLabel text="CÓCLEA" position={[-2.7, -0.6, 0.4]} color="#ff4040" />
                <HtmlLabel text="VESTIBULAR" position={[-2.3, 1.15, 0.2]} />
                <HtmlLabel text="NERVIO AUDITIVO" position={[-2.9, -1.5, 0.2]} color="#9b59b6" />
                <HtmlLabel text="OSCÍCULOS" position={[-0.7, 0.75, 0.2]} />
            </group>
        </Float>
    );
};

/* ──────────── MAIN COMPONENT ──────────── */
const HolographicEar = ({ riskColor = '#00D4FF', probability = 0 }) => {
    return (
        <div style={{
            width: '100%',
            height: 320,
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000814',
            position: 'relative',
            boxShadow: '0 0 50px rgba(0, 180, 255, 0.08), inset 0 0 80px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(0, 180, 255, 0.12)',
        }}>
            {/* Probability overlay */}
            <div style={{
                position: 'absolute', bottom: 12, left: '50%',
                transform: 'translateX(-50%)', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                pointerEvents: 'none',
            }}>
                <span style={{
                    fontSize: 34, fontWeight: 800, color: riskColor,
                    textShadow: `0 0 24px ${riskColor}, 0 0 48px ${riskColor}66`,
                    lineHeight: 1, fontFamily: "'Inter', sans-serif",
                }}>{probability}%</span>
                <span style={{
                    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase', letterSpacing: 2.5,
                }}>Probabilidad de Crisis</span>
            </div>

            {/* Rotation hint */}
            <div style={{
                position: 'absolute', top: 10, right: 14, zIndex: 10,
                fontSize: 10, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
            }}>
                <span style={{ fontSize: 14 }}>↻</span> Arrastra para rotar
            </div>

            <Canvas camera={{ position: [0, 0.5, 5.5], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true }}>
                <color attach="background" args={['#000814']} />

                <ambientLight intensity={0.15} />
                <pointLight position={[5, 4, 5]} intensity={0.8} color="#00d4ff" />
                <pointLight position={[-4, -3, 3]} intensity={0.4} color="#5856D6" />

                <Suspense fallback={null}>
                    <EarAssembly />
                    <Particles />

                    {/* ✨ Bloom post-processing for the neon glow */}
                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.4}
                            luminanceSmoothing={0.9}
                            mipmapBlur
                            intensity={1.2}
                        />
                    </EffectComposer>
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={true}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI * 3 / 4}
                />
            </Canvas>
        </div>
    );
};

export default HolographicEar;
