import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
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
  secondary?: boolean;
  ring?: boolean;
}

interface ScenePointer {
  x: number;
  y: number;
}

const BODIES: SystemBody[] = [
  { label: "FRONTEND", position: [1.1, 1.65, 0.3], radius: 0.52, color: "#317fae", accent: "cyan" },
  { label: "API", position: [2.55, 0.85, -0.25], radius: 0.34, color: "#3152a2", accent: "blue", secondary: true },
  { label: "BACKEND", position: [4.15, 1.12, 0.2], radius: 0.88, color: "#b56e24", accent: "amber", ring: true },
  { label: "DATA", position: [5.85, 0.25, -0.3], radius: 0.54, color: "#237a65", accent: "green" },
  { label: "CLOUD", position: [5.05, -1.85, 0.15], radius: 0.72, color: "#a34c2d", accent: "orange", ring: true },
  { label: "AI / OCR", position: [2.9, -1.85, -0.2], radius: 0.24, color: "#3aaad0", accent: "cyan", secondary: true },
  { label: "CI / CD", position: [1.55, -1.25, -0.1], radius: 0.15, color: "#c18a35", accent: "amber", secondary: true },
  { label: "MONITORING", position: [4.15, -2.55, 0], radius: 0.18, color: "#4477c5", accent: "blue", secondary: true },
];

const ROUTES: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [6, 4], [4, 7]];

function createField(count: number, width: number, centerX: number, depth: number) {
  const home = new Float32Array(count * 3);
  const current = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const arrayIndex = index * 3;
    const density = Math.random();
    const x = (density < 0.6 ? Math.pow(Math.random(), 0.68) : Math.random()) * width - width * 0.5 + centerX;
    const y = (Math.random() - 0.5) * 6.2 + Math.sin(x * 0.8) * 0.38;
    const z = depth + (Math.random() - 0.5) * 3.2;
    const warm = Math.random() > 0.9;
    home[arrayIndex] = current[arrayIndex] = x;
    home[arrayIndex + 1] = current[arrayIndex + 1] = y;
    home[arrayIndex + 2] = current[arrayIndex + 2] = z;
    colors[arrayIndex] = warm ? 0.95 : 0.42 + Math.random() * 0.18;
    colors[arrayIndex + 1] = warm ? 0.68 : 0.64 + Math.random() * 0.22;
    colors[arrayIndex + 2] = warm ? 0.38 : 0.82 + Math.random() * 0.18;
  }

  return { home, current, colors };
}

function StarField({ count, width, centerX, depth, size, opacity, parallax, interactive, animate, pointerRef }: {
  count: number;
  width: number;
  centerX: number;
  depth: number;
  size: number;
  opacity: number;
  parallax: number;
  interactive: boolean;
  animate: boolean;
  pointerRef: MutableRefObject<ScenePointer>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const field = useMemo(() => createField(count, width, centerX, depth), [count, width, centerX, depth]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !groupRef.current || !animate) return;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const pointerX = pointerRef.current.x * 8;
    const pointerY = pointerRef.current.y * 4.5;
    const damping = 1 - Math.exp(-delta * 4.8);
    groupRef.current.position.x += (pointerRef.current.x * parallax - groupRef.current.position.x) * delta;
    groupRef.current.position.y += (pointerRef.current.y * parallax * 0.65 - groupRef.current.position.y) * delta;

    for (let index = 0; index < count; index += 1) {
      const arrayIndex = index * 3;
      const baseX = field.home[arrayIndex] + Math.sin(state.clock.elapsedTime * 0.035 + index) * 0.012;
      const baseY = field.home[arrayIndex + 1] + Math.cos(state.clock.elapsedTime * 0.03 + index * 0.7) * 0.01;
      const dx = baseX - pointerX;
      const dy = baseY - pointerY;
      const distance = Math.hypot(dx, dy);
      const influence = interactive ? Math.max(0, 1 - distance / 1.6) ** 2 : 0;
      const force = influence * 0.48;
      const targetX = baseX + (distance > 0.001 ? (dx / distance) * force : 0);
      const targetY = baseY + (distance > 0.001 ? (dy / distance) * force : 0);
      field.current[arrayIndex] += (targetX - field.current[arrayIndex]) * damping;
      field.current[arrayIndex + 1] += (targetY - field.current[arrayIndex + 1]) * damping;
      attr.setXYZ(index, field.current[arrayIndex], field.current[arrayIndex + 1], field.current[arrayIndex + 2]);
    }
    attr.needsUpdate = true;
  });

  return <group ref={groupRef}><points ref={pointsRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[field.current, 3]} /><bufferAttribute attach="attributes-color" args={[field.colors, 3]} /></bufferGeometry><pointsMaterial size={size} transparent opacity={opacity} vertexColors sizeAttenuation depthWrite={false} /></points></group>;
}

function createPlanetTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const base = new THREE.Color(color);
  context.fillStyle = `#${base.getHexString()}`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < 80; index += 1) {
    const lightness = 20 + Math.random() * 42;
    const alpha = 0.035 + Math.random() * 0.12;
    context.fillStyle = `hsla(${base.getHSL({ h: 0, s: 0, l: 0 }).h * 360}, ${base.getHSL({ h: 0, s: 0, l: 0 }).s * 100}%, ${lightness}%, ${alpha})`;
    context.beginPath();
    context.ellipse(Math.random() * 256, Math.random() * 128, 8 + Math.random() * 35, 2 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function Atmosphere({ color, radius, secondary, compact }: { color: string; radius: number; secondary: boolean; compact: boolean }) {
  if (compact) return null;
  return <mesh scale={secondary ? 1.09 : 1.18}><sphereGeometry args={[radius, 20, 20]} /><shaderMaterial transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} uniforms={{ color: { value: new THREE.Color(color) }, strength: { value: secondary ? 0.1 : 0.24 } }} vertexShader="varying vec3 normalWorld; varying vec3 viewDirection; void main() { normalWorld = normalize(normalMatrix * normal); vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); viewDirection = normalize(-mvPosition.xyz); gl_Position = projectionMatrix * mvPosition; }" fragmentShader="uniform vec3 color; uniform float strength; varying vec3 normalWorld; varying vec3 viewDirection; void main() { float rim = pow(1.0 - max(dot(normalWorld, viewDirection), 0.0), 3.0); gl_FragColor = vec4(color, rim * strength); }" /></mesh>;
}

function Planet({ body, compact, animate }: { body: SystemBody; compact: boolean; animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => createPlanetTexture(body.color), [body.color]);

  useFrame((state) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * (body.secondary ? 0.025 : 0.014) + body.radius;
    groupRef.current.position.y = body.position[1] + Math.sin(state.clock.elapsedTime * 0.16 + body.radius * 3) * (body.secondary ? 0.018 : 0.035);
  });

  return <group ref={groupRef} position={body.position}>
    <mesh><sphereGeometry args={[body.radius, compact ? 16 : 32, compact ? 16 : 32]} /><meshStandardMaterial map={texture} roughness={body.secondary ? 0.62 : 0.78} metalness={0.04} emissive={body.color} emissiveIntensity={body.secondary ? 0.08 : 0.025} /></mesh>
    <Atmosphere color={body.color} radius={body.radius} secondary={Boolean(body.secondary)} compact={compact} />
    {body.ring && !compact && <mesh rotation={[Math.PI / 2.6, 0.15, 0]}><torusGeometry args={[body.radius * 1.42, 0.018, 8, 48]} /><meshBasicMaterial color={body.color} transparent opacity={0.24} depthWrite={false} /></mesh>}
    <Html center position={[0, body.radius + 0.22, 0]} style={{ pointerEvents: "none" }} wrapperClass="sysnode-html"><span className={`sysnode-label ${body.secondary ? "sysnode-label--secondary" : ""} sysnode-label--${body.accent}`}>{body.label}</span></Html>
  </group>;
}

function Routes({ animate }: { animate: boolean }) {
  const linePositions = useMemo(() => {
    const points: number[] = [];
    ROUTES.forEach(([from, to]) => {
      const start = new THREE.Vector3(...BODIES[from].position);
      const end = new THREE.Vector3(...BODIES[to].position);
      const control = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, from < 4 && to < 5 ? 0.18 : -0.25, -0.5));
      const curve = new THREE.QuadraticBezierCurve3(start, control, end).getPoints(12);
      for (let index = 0; index < curve.length - 1; index += 1) points.push(...curve[index].toArray(), ...curve[index + 1].toArray());
    });
    return new Float32Array(points);
  }, []);
  const packetsRef = useRef<THREE.Points>(null);
  const packetPositions = useMemo(() => new Float32Array(4 * 3), []);

  useFrame((state) => {
    if (!packetsRef.current) return;
    const attr = packetsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let index = 0; index < 4; index += 1) {
      const [from, to] = ROUTES[index];
      const start = new THREE.Vector3(...BODIES[from].position);
      const end = new THREE.Vector3(...BODIES[to].position);
      const control = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.18, -0.5));
      const progress = animate ? (state.clock.elapsedTime * (0.045 + index * 0.006) + index * 0.31) % 1 : index * 0.2;
      const point = new THREE.QuadraticBezierCurve3(start, control, end).getPoint(progress);
      attr.setXYZ(index, point.x, point.y, point.z);
    }
    attr.needsUpdate = true;
  });

  return <><lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[linePositions, 3]} /></bufferGeometry><lineBasicMaterial color="#8ec7e5" transparent opacity={0.035} depthWrite={false} /></lineSegments><points ref={packetsRef}><bufferGeometry><bufferAttribute attach="attributes-position" args={[packetPositions, 3]} /></bufferGeometry><pointsMaterial color="#f6c166" size={0.045} transparent opacity={0.5} sizeAttenuation depthWrite={false} /></points></>;
}

function Debris({ compact, animate, pointerRef }: { compact: boolean; animate: boolean; pointerRef: MutableRefObject<ScenePointer> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = compact ? 5 : 16;
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    return Array.from({ length: count }, () => {
      dummy.position.set(0.5 + Math.random() * 7, -3 + Math.random() * 5.5, 1.5 + Math.random() * 3.5);
      dummy.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      const scale = 0.025 + Math.random() * 0.075;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((matrix, index) => meshRef.current?.setMatrixAt(index, matrix));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.012;
    groupRef.current.position.x += (pointerRef.current.x * 0.08 - groupRef.current.position.x) * delta * 0.45;
  });

  return <group ref={groupRef}><instancedMesh ref={meshRef} args={[undefined, undefined, count]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#506071" roughness={0.95} metalness={0.05} /></instancedMesh></group>;
}

function Universe({ compact, animate, pointerRef }: { compact: boolean; animate: boolean; pointerRef: MutableRefObject<ScenePointer> }) {
  const systemRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!animate || !systemRef.current) return;
    systemRef.current.rotation.y += delta * 0.003;
    systemRef.current.position.x += (pointerRef.current.x * 0.05 - systemRef.current.position.x) * delta * 0.35;
  });

  return <>
    <StarField count={compact ? 120 : 520} width={17} centerX={0.8} depth={-5} size={0.016} opacity={0.32} parallax={0.012} interactive={false} animate={animate} pointerRef={pointerRef} />
    <StarField count={compact ? 85 : 290} width={14} centerX={2.2} depth={-1.5} size={0.028} opacity={0.42} parallax={0.04} interactive={!compact} animate={animate} pointerRef={pointerRef} />
    <StarField count={compact ? 30 : 110} width={10} centerX={3.4} depth={1.6} size={0.05} opacity={0.34} parallax={0.1} interactive={!compact} animate={animate} pointerRef={pointerRef} />
    <group ref={systemRef}><Routes animate={animate} />{BODIES.map((body) => <Planet key={body.label} body={body} compact={compact} animate={animate} />)}<Debris compact={compact} animate={animate} pointerRef={pointerRef} /><ambientLight intensity={0.16} /><directionalLight position={[-4, 5, 6]} intensity={2.4} color="#b9ddff" /><pointLight position={[3, -2, 3]} intensity={18} color="#e49b55" distance={9} /></group>
  </>;
}

interface SystemArchitectureSceneProps {
  pointerRef: MutableRefObject<ScenePointer>;
}

export function SystemArchitectureScene({ pointerRef }: SystemArchitectureSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 768px)");
  return <div className="sysscene" role="img" aria-label="Cinematic full-stack universe showing a Frontend, API, Backend, Data, and Cloud architecture with supporting AI/OCR, CI/CD, and Monitoring systems."><Canvas dpr={[1, compact ? 1 : 1.5]} camera={{ position: [0, 0, 9.2], fov: 50 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}><Suspense fallback={null}><Universe compact={compact} animate={!reducedMotion} pointerRef={pointerRef} /></Suspense></Canvas></div>;
}
