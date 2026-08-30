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
  { label: "FRONTEND", position: [0.85, 1.2, 0.4], radius: 0.38, color: "#42bde8", accent: "cyan" },
  { label: "API", position: [2.1, 0.68, -0.25], radius: 0.47, color: "#426ee8", accent: "blue" },
  { label: "BACKEND", position: [3.48, 0.86, 0.35], radius: 0.74, color: "#e39a33", accent: "amber", ring: true },
  { label: "DATA", position: [4.92, 0.42, -0.1], radius: 0.52, color: "#29ad89", accent: "green" },
  { label: "CLOUD", position: [5.25, -1.2, 0.28], radius: 0.66, color: "#db7434", accent: "orange", ring: true },
  { label: "AI / OCR", position: [3.02, -1.62, -0.35], radius: 0.27, color: "#48c5e5", accent: "cyan", satellite: true },
  { label: "CI / CD", position: [1.42, -1.38, -0.1], radius: 0.18, color: "#e6a23c", accent: "amber", satellite: true },
  { label: "MONITORING", position: [4.36, -1.52, 0.05], radius: 0.21, color: "#5d8ff4", accent: "blue", satellite: true },
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

const PACKET_ROUTES = ROUTES.slice(0, 5);

function createParticleField(count: number, depth: number, spread: number, centerX: number) {
  const home = new Float32Array(count * 3);
  const current = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.58) * spread + 0.5;
    const armOffset = Math.sin(angle * 2.3 + radius * 1.5) * 0.55;
    const arrayIndex = index * 3;
    const x = Math.cos(angle) * radius + centerX;
    const y = Math.sin(angle) * radius * 0.4 + armOffset;
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

function ParticleField({ count, depth, spread, centerX, size, opacity, animate, interactive, parallax }: {
  count: number;
  depth: number;
  spread: number;
  centerX: number;
  size: number;
  opacity: number;
  animate: boolean;
  interactive: boolean;
  parallax: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const field = useMemo(() => createParticleField(count, depth, spread, centerX), [count, depth, spread, centerX]);

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
    const variation = 0.6 + Math.sin(x * 8 + y * 5 + z * 7) * 0.13 + Math.sin(x * 20 - z * 12) * 0.1 + Math.cos(y * 15 + z * 9) * 0.06;
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

  return <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><lineBasicMaterial color="#72bee5" transparent opacity={0.055} depthWrite={false} /></lineSegments>;
}

function DataPackets({ animate }: { animate: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(PACKET_ROUTES.length * 3), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const attribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    PACKET_ROUTES.forEach(({ from, to }, index) => {
      const start = new THREE.Vector3(...SYSTEM_BODIES[from].position);
      const end = new THREE.Vector3(...SYSTEM_BODIES[to].position);
      const progress = animate ? (state.clock.elapsedTime * (0.052 + index * 0.007) + index * 0.31) % 1 : index / PACKET_ROUTES.length;
      const control = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, PACKET_ROUTES[index].primary ? 0.28 : -0.22, -0.42));
      const position = new THREE.QuadraticBezierCurve3(start, control, end).getPoint(progress);
      attribute.setXYZ(index, position.x, position.y, position.z);
    });
    attribute.needsUpdate = true;
  });

  return <points ref={pointsRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ffd58b" size={0.06} transparent opacity={0.58} sizeAttenuation depthWrite={false} /></points>;
}

function Atmosphere({ color, radius, satellite, compact }: Pick<SystemBody, "color" | "radius" | "satellite"> & { compact: boolean }) {
  if (compact) return null;

  return (
    <mesh scale={satellite ? 1.08 : 1.18}>
      <sphereGeometry args={[radius, 20, 20]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        uniforms={{ glowColor: { value: new THREE.Color(color) }, intensity: { value: satellite ? 0.16 : 0.28 } }}
        vertexShader="varying vec3 vNormal; varying vec3 vViewPosition; void main() { vNormal = normalize(normalMatrix * normal); vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vViewPosition = -mvPosition.xyz; gl_Position = projectionMatrix * mvPosition; }"
        fragmentShader="uniform vec3 glowColor; uniform float intensity; varying vec3 vNormal; varying vec3 vViewPosition; void main() { float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.4); gl_FragColor = vec4(glowColor, rim * intensity); }"
      />
    </mesh>
  );
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
      {!compact && <mesh scale={1.28}><sphereGeometry args={[body.radius, 18, 18]} /><meshBasicMaterial color={body.color} transparent opacity={0.025} depthWrite={false} /></mesh>}
      <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={body.satellite ? 0.58 : 0.76} metalness={body.satellite ? 0.16 : 0.06} emissive={body.color} emissiveIntensity={body.satellite ? 0.16 : 0.04} /></mesh>
      <Atmosphere color={body.color} radius={body.radius} satellite={body.satellite} compact={compact} />
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
      <ParticleField count={compact ? 60 : 270} depth={-4.5} spread={10} centerX={1.2} size={0.02} opacity={0.32} animate={animate} interactive={false} parallax={0.02} />
      <ParticleField count={compact ? 85 : 330} depth={-1.3} spread={7.8} centerX={2.2} size={0.03} opacity={0.46} animate={animate} interactive={false} parallax={0.055} />
      <ParticleField count={compact ? 42 : 180} depth={1.5} spread={6.4} centerX={3.1} size={0.042} opacity={0.5} animate={animate} interactive={interactive} parallax={0.11} />
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
