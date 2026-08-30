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
  ring?: boolean;
}

interface Route {
  from: number;
  to: number;
  primary?: boolean;
}

const SYSTEM_BODIES: SystemBody[] = [
  { label: "FRONTEND", position: [-3.25, 1.2, 0.4], radius: 0.38, color: "#42bde8", accent: "cyan" },
  { label: "API", position: [-1.55, 0.68, -0.25], radius: 0.47, color: "#426ee8", accent: "blue" },
  { label: "BACKEND", position: [0.28, 0.86, 0.35], radius: 0.74, color: "#e39a33", accent: "amber", ring: true },
  { label: "DATA", position: [2.18, 0.42, -0.1], radius: 0.52, color: "#29ad89", accent: "green" },
  { label: "CLOUD", position: [3.28, -1.2, 0.28], radius: 0.66, color: "#db7434", accent: "orange", ring: true },
  { label: "AI / OCR", position: [-0.42, -1.62, -0.35], radius: 0.27, color: "#48c5e5", accent: "cyan", satellite: true },
  { label: "CI / CD", position: [-2.13, -1.38, -0.1], radius: 0.18, color: "#e6a23c", accent: "amber", satellite: true },
  { label: "MONITORING", position: [1.48, -1.52, 0.05], radius: 0.21, color: "#5d8ff4", accent: "blue", satellite: true },
];

const ROUTES: Route[] = [
  { from: 0, to: 1, primary: true },
  { from: 1, to: 2, primary: true },
  { from: 2, to: 3, primary: true },
  { from: 2, to: 4, primary: true },
  { from: 2, to: 5 },
  { from: 6, to: 4 },
  { from: 4, to: 7 },
];

function createParticleField(count: number, depth: number, spread: number) {
  const home = new Float32Array(count * 3);
  const current = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.62) * spread + 0.5;
    const armOffset = Math.sin(angle * 2.3 + radius * 1.5) * 0.55;
    const arrayIndex = index * 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.44 + armOffset;
    const z = depth + (Math.random() - 0.5) * 2.2;
    home[arrayIndex] = current[arrayIndex] = x;
    home[arrayIndex + 1] = current[arrayIndex + 1] = y;
    home[arrayIndex + 2] = current[arrayIndex + 2] = z;

    const warm = Math.random() > 0.86;
    colors[arrayIndex] = warm ? 0.98 : 0.4 + Math.random() * 0.22;
    colors[arrayIndex + 1] = warm ? 0.64 : 0.67 + Math.random() * 0.22;
    colors[arrayIndex + 2] = warm ? 0.32 : 0.86 + Math.random() * 0.14;
  }

  return { home, current, colors };
}

function ParticleField({ count, depth, spread, size, opacity, animate, interactive, parallax }: {
  count: number;
  depth: number;
  spread: number;
  size: number;
  opacity: number;
  animate: boolean;
  interactive: boolean;
  parallax: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const field = useMemo(() => createParticleField(count, depth, spread), [count, depth, spread]);

  useFrame((state, delta) => {
    if (!animate || !pointsRef.current || !groupRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const damping = 1 - Math.exp(-delta * 4.2);
    const pointerX = state.pointer.x * 4.5;
    const pointerY = state.pointer.y * 2.8;
    const elapsed = state.clock.elapsedTime;
    groupRef.current.position.x += (state.pointer.x * parallax - groupRef.current.position.x) * delta * 0.8;
    groupRef.current.position.y += (state.pointer.y * parallax * 0.6 - groupRef.current.position.y) * delta * 0.8;

    for (let index = 0; index < count; index += 1) {
      const arrayIndex = index * 3;
      const homeX = field.home[arrayIndex] + Math.sin(elapsed * 0.06 + index * 0.73) * 0.018;
      const homeY = field.home[arrayIndex + 1] + Math.cos(elapsed * 0.05 + index * 0.51) * 0.014;
      const dx = homeX - pointerX;
      const dy = homeY - pointerY;
      const distance = Math.hypot(dx, dy);
      const influence = interactive ? Math.max(0, 1 - distance / 1.35) ** 2 : 0;
      const displacement = influence * 0.34;
      const targetX = homeX + (distance > 0.001 ? (dx / distance) * displacement : 0);
      const targetY = homeY + (distance > 0.001 ? (dy / distance) * displacement : 0);
      field.current[arrayIndex] += (targetX - field.current[arrayIndex]) * damping;
      field.current[arrayIndex + 1] += (targetY - field.current[arrayIndex + 1]) * damping;
      positions.setXYZ(index, field.current[arrayIndex], field.current[arrayIndex + 1], field.current[arrayIndex + 2]);
    }
    positions.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[field.current, 3]} />
          <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={size} transparent opacity={opacity} vertexColors sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
}

function createPlanetGeometry(radius: number, color: string, segments: number) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const base = new THREE.Color(color);
  const colors = new Float32Array(positions.count * 3);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const variation = 0.72 + Math.sin(x * 9 + y * 5 + z * 7) * 0.11 + Math.sin(x * 19 - z * 13) * 0.07;
    colors[index * 3] = base.r * variation;
    colors[index * 3 + 1] = base.g * variation;
    colors[index * 3 + 2] = base.b * variation;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function ArchitectureRoutes() {
  const positions = useMemo(() => {
    const points: number[] = [];
    ROUTES.forEach(({ from, to, primary }) => {
      const start = new THREE.Vector3(...SYSTEM_BODIES[from].position);
      const end = new THREE.Vector3(...SYSTEM_BODIES[to].position);
      const arcHeight = primary ? 0.28 : -0.22;
      const control = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, arcHeight, -0.42));
      const curvePoints = new THREE.QuadraticBezierCurve3(start, control, end).getPoints(primary ? 18 : 10);
      for (let index = 0; index < curvePoints.length - 1; index += 1) points.push(...curvePoints[index].toArray(), ...curvePoints[index + 1].toArray());
    });
    return new Float32Array(points);
  }, []);

  return <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><lineBasicMaterial color="#72bee5" transparent opacity={0.11} depthWrite={false} /></lineSegments>;
}

function DataPackets({ animate }: { animate: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(ROUTES.length * 3), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const attribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    ROUTES.forEach(({ from, to }, index) => {
      const start = new THREE.Vector3(...SYSTEM_BODIES[from].position);
      const end = new THREE.Vector3(...SYSTEM_BODIES[to].position);
      const progress = animate ? (state.clock.elapsedTime * (0.06 + index * 0.006) + index * 0.27) % 1 : index / ROUTES.length;
      const control = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, ROUTES[index].primary ? 0.28 : -0.22, -0.42));
      const position = new THREE.QuadraticBezierCurve3(start, control, end).getPoint(progress);
      attribute.setXYZ(index, position.x, position.y, position.z);
    });
    attribute.needsUpdate = true;
  });

  return <points ref={pointsRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ffd58b" size={0.075} transparent opacity={0.7} sizeAttenuation depthWrite={false} /></points>;
}

function SystemPlanet({ body, animate, compact }: { body: SystemBody; animate: boolean; compact: boolean }) {
  const bodyRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createPlanetGeometry(body.radius, body.color, compact ? 14 : 28), [body, compact]);

  useFrame((state) => {
    if (!animate || !bodyRef.current) return;
    bodyRef.current.rotation.y = state.clock.elapsedTime * (body.satellite ? 0.1 : 0.035);
    bodyRef.current.position.y = body.position[1] + Math.sin(state.clock.elapsedTime * 0.24 + body.radius) * 0.027;
  });

  return (
    <group ref={bodyRef} position={body.position}>
      {!compact && <mesh scale={1.3}><sphereGeometry args={[body.radius, 18, 18]} /><meshBasicMaterial color={body.color} transparent opacity={0.035} depthWrite={false} /></mesh>}
      <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={body.satellite ? 0.55 : 0.68} metalness={body.satellite ? 0.2 : 0.1} emissive={body.color} emissiveIntensity={body.satellite ? 0.2 : 0.06} /></mesh>
      {!compact && !body.satellite && <mesh scale={1.13}><sphereGeometry args={[body.radius, 18, 18]} /><meshBasicMaterial color={body.color} transparent opacity={0.07} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
      {body.ring && !compact && <mesh rotation={[Math.PI / 2.8, 0.2, 0]}><torusGeometry args={[body.radius * 1.36, 0.012, 8, 48]} /><meshBasicMaterial color={body.color} transparent opacity={0.28} depthWrite={false} /></mesh>}
      <Html center position={[0, body.radius + 0.25, 0]} style={{ pointerEvents: "none" }} wrapperClass="sysnode-html"><span className={`sysnode-label ${body.satellite ? "sysnode-label--secondary" : ""} sysnode-label--${body.accent}`}>{body.label}</span></Html>
    </group>
  );
}

function FullStackUniverse({ animate, interactive, compact }: { animate: boolean; interactive: boolean; compact: boolean }) {
  const systemRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!animate || !systemRef.current) return;
    systemRef.current.rotation.y += delta * 0.008;
    systemRef.current.position.x += (state.pointer.x * 0.12 - systemRef.current.position.x) * delta * 0.85;
    systemRef.current.position.y += (state.pointer.y * 0.07 - systemRef.current.position.y) * delta * 0.85;
  });

  return (
    <>
      <ParticleField count={compact ? 70 : 190} depth={-4} spread={7.5} size={0.025} opacity={0.42} animate={animate} interactive={false} parallax={0.025} />
      <ParticleField count={compact ? 90 : 260} depth={-1.2} spread={5.9} size={0.035} opacity={0.55} animate={animate} interactive={false} parallax={0.06} />
      <ParticleField count={compact ? 45 : 150} depth={1.5} spread={4.8} size={0.045} opacity={0.68} animate={animate} interactive={interactive} parallax={0.12} />
      <group ref={systemRef}>
        <ArchitectureRoutes />
        <DataPackets animate={animate} />
        {SYSTEM_BODIES.map((body) => <SystemPlanet key={body.label} body={body} animate={animate} compact={compact} />)}
        <ambientLight intensity={0.58} />
        <pointLight position={[-1, 3, 4]} intensity={14} color="#b8e7ff" distance={10} />
        <pointLight position={[2, -2, 3]} intensity={8} color="#ffb45b" distance={8} />
      </group>
    </>
  );
}

export function SystemArchitectureScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="sysscene" role="img" aria-label="Full-stack architecture illustrated as a galaxy: Frontend flows through API and Backend to Data and Cloud, with AI/OCR, CI/CD, and Monitoring systems connected to the production platform.">
      <Canvas dpr={[1, isMobile ? 1 : 1.5]} camera={{ position: [0, 0, 9.4], fov: 50 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <Suspense fallback={null}><FullStackUniverse animate={!reducedMotion} interactive={!isMobile && !reducedMotion} compact={isMobile} /></Suspense>
      </Canvas>
    </div>
  );
}
