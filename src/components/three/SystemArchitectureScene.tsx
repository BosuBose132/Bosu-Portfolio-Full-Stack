import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./SystemArchitectureScene.css";

type Accent = "cyan" | "blue" | "amber" | "green" | "orange";

interface SystemBody {
  label: string;
  position: [number, number, number];
  radius: number;
  color: string;
  accent: Accent;
  satellite?: boolean;
}

const SYSTEM_BODIES: SystemBody[] = [
  { label: "FRONTEND", position: [-3.3, 1.25, 0.25], radius: 0.36, color: "#38bdf8", accent: "cyan" },
  { label: "API", position: [-1.55, 0.75, -0.2], radius: 0.46, color: "#3b82f6", accent: "blue" },
  { label: "BACKEND", position: [0.35, 0.85, 0.25], radius: 0.7, color: "#f59e0b", accent: "amber" },
  { label: "DATA", position: [2.35, 0.5, -0.15], radius: 0.5, color: "#22c55e", accent: "green" },
  { label: "CLOUD", position: [3.25, -1.15, 0.35], radius: 0.64, color: "#f97316", accent: "orange" },
  { label: "AI / OCR", position: [-0.35, -1.65, -0.3], radius: 0.28, color: "#38bdf8", accent: "cyan", satellite: true },
  { label: "CI / CD", position: [-2.15, -1.45, -0.1], radius: 0.2, color: "#f59e0b", accent: "amber", satellite: true },
  { label: "MONITORING", position: [1.55, -1.55, 0], radius: 0.22, color: "#3b82f6", accent: "blue", satellite: true },
];

const ROUTES: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [4, 6], [4, 7]];

function createStars(count: number) {
  const base = new Float32Array(count * 3);
  const current = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = 2.5 + Math.random() * 6.5;
    const angle = Math.random() * Math.PI * 2;
    const spread = (Math.random() - 0.5) * 3.1;
    const offset = Math.sin(angle * 2.2) * 0.5;
    const arrayIndex = index * 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.5 + spread * 0.35 + offset;
    const z = -3.5 + Math.random() * 5;
    base[arrayIndex] = current[arrayIndex] = x;
    base[arrayIndex + 1] = current[arrayIndex + 1] = y;
    base[arrayIndex + 2] = current[arrayIndex + 2] = z;

    const warm = Math.random() > 0.82;
    colors[arrayIndex] = warm ? 0.98 : 0.36 + Math.random() * 0.2;
    colors[arrayIndex + 1] = warm ? 0.66 : 0.7 + Math.random() * 0.2;
    colors[arrayIndex + 2] = warm ? 0.25 : 0.88 + Math.random() * 0.12;
  }

  return { base, current, colors };
}

function CosmicDust({ count, animate, interactive }: { count: number; animate: boolean; interactive: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const stars = useMemo(() => createStars(count), [count]);

  useFrame((state, delta) => {
    if (!animate || !pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const elapsed = state.clock.elapsedTime;
    const pointerX = state.pointer.x * 4.5;
    const pointerY = state.pointer.y * 2.8;
    const damping = 1 - Math.exp(-delta * 4.5);

    for (let index = 0; index < count; index += 1) {
      const arrayIndex = index * 3;
      const homeX = stars.base[arrayIndex] + Math.sin(elapsed * 0.1 + index) * 0.025;
      const homeY = stars.base[arrayIndex + 1] + Math.cos(elapsed * 0.08 + index * 0.7) * 0.018;
      const dx = homeX - pointerX;
      const dy = homeY - pointerY;
      const distance = Math.hypot(dx, dy);
      const influence = interactive ? Math.max(0, 1 - distance / 1.45) ** 2 : 0;
      const push = influence * 0.42;
      const targetX = homeX + (distance > 0.001 ? (dx / distance) * push : 0);
      const targetY = homeY + (distance > 0.001 ? (dy / distance) * push : 0);
      stars.current[arrayIndex] += (targetX - stars.current[arrayIndex]) * damping;
      stars.current[arrayIndex + 1] += (targetY - stars.current[arrayIndex + 1]) * damping;
      positions.setXYZ(index, stars.current[arrayIndex], stars.current[arrayIndex + 1], stars.current[arrayIndex + 2]);
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[stars.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[stars.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} transparent opacity={0.62} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}

function RouteLines() {
  const positions = useMemo(() => {
    const points: number[] = [];
    ROUTES.forEach(([from, to]) => {
      const start = new THREE.Vector3(...SYSTEM_BODIES[from].position);
      const end = new THREE.Vector3(...SYSTEM_BODIES[to].position);
      const control = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.25, -0.25));
      const routePoints = new THREE.QuadraticBezierCurve3(start, control, end).getPoints(12);
      for (let index = 0; index < routePoints.length - 1; index += 1) {
        points.push(...routePoints[index].toArray(), ...routePoints[index + 1].toArray());
      }
    });
    return new Float32Array(points);
  }, []);

  return <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><lineBasicMaterial color="#6bbce5" transparent opacity={0.18} depthWrite={false} /></lineSegments>;
}

function Packets({ animate }: { animate: boolean }) {
  const packetRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(ROUTES.length * 3), []);

  useFrame((state) => {
    if (!packetRef.current) return;
    const attribute = packetRef.current.geometry.attributes.position as THREE.BufferAttribute;
    ROUTES.forEach(([from, to], index) => {
      const start = new THREE.Vector3(...SYSTEM_BODIES[from].position);
      const end = new THREE.Vector3(...SYSTEM_BODIES[to].position);
      const progress = animate ? (state.clock.elapsedTime * (0.08 + index * 0.007) + index * 0.29) % 1 : index / ROUTES.length;
      const position = start.lerp(end, progress);
      attribute.setXYZ(index, position.x, position.y, position.z);
    });
    attribute.needsUpdate = true;
  });

  return <points ref={packetRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ffd58b" size={0.09} transparent opacity={0.82} sizeAttenuation depthWrite={false} /></points>;
}

function SystemPlanet({ body, animate }: { body: SystemBody; animate: boolean }) {
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animate || !bodyRef.current) return;
    bodyRef.current.rotation.y = state.clock.elapsedTime * (body.satellite ? 0.12 : 0.045);
    bodyRef.current.position.y = body.position[1] + Math.sin(state.clock.elapsedTime * 0.35 + body.radius) * 0.035;
  });

  return (
    <group ref={bodyRef} position={body.position}>
      <mesh><sphereGeometry args={[body.radius * 1.38, 20, 20]} /><meshBasicMaterial color={body.color} transparent opacity={0.07} depthWrite={false} /></mesh>
      <mesh><sphereGeometry args={[body.radius, body.satellite ? 12 : 24, body.satellite ? 12 : 24]} /><meshStandardMaterial color={body.color} emissive={body.color} emissiveIntensity={body.satellite ? 0.18 : 0.08} roughness={0.5} metalness={0.24} /></mesh>
      {!body.satellite && <mesh rotation={[Math.PI / 2.8, 0.3, 0]}><torusGeometry args={[body.radius * 1.2, 0.008, 8, 40]} /><meshBasicMaterial color={body.color} transparent opacity={0.38} /></mesh>}
      <Html center position={[0, body.radius + 0.28, 0]} style={{ pointerEvents: "none" }} wrapperClass="sysnode-html"><span className={`sysnode-label sysnode-label--${body.accent}`}>{body.label}</span></Html>
    </group>
  );
}

function FullStackUniverse({ animate, interactive, compact }: { animate: boolean; interactive: boolean; compact: boolean }) {
  const universeRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!universeRef.current || !animate) return;
    universeRef.current.rotation.y += delta * 0.012;
    universeRef.current.position.x += (state.pointer.x * 0.16 - universeRef.current.position.x) * delta * 1.2;
    universeRef.current.position.y += (state.pointer.y * 0.1 - universeRef.current.position.y) * delta * 1.2;
  });

  return (
    <group ref={universeRef}>
      <CosmicDust count={compact ? 140 : 520} animate={animate} interactive={interactive} />
      <RouteLines />
      <Packets animate={animate} />
      {SYSTEM_BODIES.map((body) => <SystemPlanet key={body.label} body={body} animate={animate} />)}
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 3, 4]} intensity={18} color="#b8e7ff" distance={10} />
      <pointLight position={[2, -2, 2]} intensity={8} color="#ffb84d" distance={8} />
    </group>
  );
}

export function SystemArchitectureScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="sysscene" role="img" aria-label="Full-stack architecture illustrated as a galaxy: Frontend flows through API and Backend to Data and Cloud, with AI/OCR, CI/CD, and Monitoring systems connected to the production platform.">
      <Canvas dpr={[1, isMobile ? 1.15 : 1.6]} camera={{ position: [0, 0, 9.4], fov: 50 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <Suspense fallback={null}><FullStackUniverse animate={!reducedMotion} interactive={!isMobile && !reducedMotion} compact={isMobile} /></Suspense>
      </Canvas>
    </div>
  );
}
