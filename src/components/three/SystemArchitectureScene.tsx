import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./SystemArchitectureScene.css";

type PlanetKind = "earth" | "gas" | "ringed" | "rocky" | "moon";

interface ScenePointer {
  x: number;
  y: number;
}

interface PlanetConfig {
  label: string;
  position: [number, number, number];
  radius: number;
  kind: PlanetKind;
  rotationSpeed: number;
  secondary?: boolean;
}

const PLANETS: PlanetConfig[] = [
  { label: "FRONTEND", position: [1.3, 1.55, -0.5], radius: 0.7, kind: "earth", rotationSpeed: 0.022 },
  { label: "BACKEND", position: [4.45, 0.95, 0.1], radius: 1.16, kind: "gas", rotationSpeed: 0.009 },
  { label: "CLOUD", position: [6.35, -1.95, 0.8], radius: 1.02, kind: "ringed", rotationSpeed: 0.012 },
  { label: "DATA", position: [3.15, -2.25, -0.8], radius: 0.48, kind: "rocky", rotationSpeed: 0.018, secondary: true },
  { label: "API", position: [6.95, 2.35, -2.4], radius: 0.34, kind: "moon", rotationSpeed: 0.006, secondary: true },
];

function createCanvasTexture(draw: (context: CanvasRenderingContext2D, width: number, height: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  draw(context, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createPlanetTexture(kind: PlanetKind) {
  return createCanvasTexture((context, width, height) => {
    const fill = {
      earth: "#0c4770",
      gas: "#a9683b",
      ringed: "#907144",
      rocky: "#9c4228",
      moon: "#76808b",
    }[kind];
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);

    if (kind === "gas") {
      for (let y = 0; y < height; y += 11) {
        context.fillStyle = `hsla(${20 + Math.random() * 22}, ${35 + Math.random() * 25}%, ${28 + Math.random() * 35}%, ${0.25 + Math.random() * 0.36})`;
        context.fillRect(0, y + Math.sin(y * 0.08) * 5, width, 7 + Math.random() * 12);
      }
      context.fillStyle = "rgba(72, 38, 27, 0.42)";
      context.beginPath();
      context.ellipse(width * 0.65, height * 0.62, 60, 18, -0.08, 0, Math.PI * 2);
      context.fill();
      return;
    }

    if (kind === "earth") {
      context.fillStyle = "rgba(26, 126, 92, 0.9)";
      for (let index = 0; index < 22; index += 1) {
        context.beginPath();
        context.ellipse(Math.random() * width, 30 + Math.random() * (height - 60), 16 + Math.random() * 35, 8 + Math.random() * 22, Math.random() * Math.PI, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = "rgba(205, 235, 228, 0.42)";
      for (let index = 0; index < 20; index += 1) {
        context.beginPath();
        context.ellipse(Math.random() * width, Math.random() * height, 22 + Math.random() * 45, 2 + Math.random() * 7, Math.random() * Math.PI, 0, Math.PI * 2);
        context.fill();
      }
      return;
    }

    for (let index = 0; index < (kind === "moon" ? 55 : 38); index += 1) {
      const shade = kind === "rocky" ? 25 + Math.random() * 22 : 28 + Math.random() * 24;
      context.fillStyle = `hsla(${kind === "rocky" ? 16 : 210}, ${kind === "rocky" ? 48 : 12}%, ${shade}%, ${0.18 + Math.random() * 0.25})`;
      context.beginPath();
      context.ellipse(Math.random() * width, Math.random() * height, 3 + Math.random() * 18, 3 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  });
}

function createCloudTexture() {
  return createCanvasTexture((context, width, height) => {
    context.clearRect(0, 0, width, height);
    for (let index = 0; index < 46; index += 1) {
      context.fillStyle = `rgba(220, 244, 255, ${0.05 + Math.random() * 0.22})`;
      context.beginPath();
      context.ellipse(Math.random() * width, Math.random() * height, 16 + Math.random() * 44, 2 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  });
}

function createStars(count: number, width: number, depth: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const pointer = index * 3;
    positions[pointer] = (Math.random() - 0.5) * width;
    positions[pointer + 1] = (Math.random() - 0.5) * 9 + Math.sin(index * 0.7) * 0.3;
    positions[pointer + 2] = depth + (Math.random() - 0.5) * 2.5;
    const warm = Math.random() > 0.9;
    colors[pointer] = warm ? 1 : 0.52 + Math.random() * 0.23;
    colors[pointer + 1] = warm ? 0.72 : 0.67 + Math.random() * 0.21;
    colors[pointer + 2] = warm ? 0.44 : 0.85 + Math.random() * 0.15;
  }
  return { positions, colors };
}

function StarField({ count, width, depth, size, opacity, parallax, animate, pointerRef }: {
  count: number;
  width: number;
  depth: number;
  size: number;
  opacity: number;
  parallax: number;
  animate: boolean;
  pointerRef: MutableRefObject<ScenePointer>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const stars = useMemo(() => createStars(count, width, depth), [count, width, depth]);
  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.position.x += (pointerRef.current.x * parallax - groupRef.current.position.x) * delta * 0.25;
    groupRef.current.position.y += (pointerRef.current.y * parallax * 0.55 - groupRef.current.position.y) * delta * 0.25;
  });
  return <group ref={groupRef}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars.positions, 3]} /><bufferAttribute attach="attributes-color" args={[stars.colors, 3]} /></bufferGeometry><pointsMaterial size={size} transparent opacity={opacity} vertexColors sizeAttenuation depthWrite={false} /></points></group>;
}

function Atmosphere({ radius }: { radius: number }) {
  return <mesh scale={1.055}><sphereGeometry args={[radius, 28, 28]} /><shaderMaterial transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} uniforms={{ glowColor: { value: new THREE.Color("#8fdcff") } }} vertexShader="varying vec3 normalDirection; varying vec3 viewDirection; void main() { normalDirection = normalize(normalMatrix * normal); vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); viewDirection = normalize(-mvPosition.xyz); gl_Position = projectionMatrix * mvPosition; }" fragmentShader="uniform vec3 glowColor; varying vec3 normalDirection; varying vec3 viewDirection; void main() { float rim = pow(1.0 - max(dot(normalDirection, viewDirection), 0.0), 3.3); gl_FragColor = vec4(glowColor, rim * 0.38); }" /></mesh>;
}

function Planet({ config, compact, animate }: { config: PlanetConfig; compact: boolean; animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const map = useMemo(() => createPlanetTexture(config.kind), [config.kind]);
  const clouds = useMemo(() => config.kind === "earth" ? createCloudTexture() : null, [config.kind]);

  useFrame((state) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * config.rotationSpeed;
    groupRef.current.position.y = config.position[1] + Math.sin(state.clock.elapsedTime * 0.12 + config.radius) * 0.025;
    if (cloudsRef.current) cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.032;
  });

  return <group ref={groupRef} position={config.position}>
    <mesh><sphereGeometry args={[config.radius, compact ? 18 : 36, compact ? 18 : 36]} /><meshStandardMaterial map={map} roughness={config.kind === "earth" ? 0.48 : 0.82} metalness={0.01} emissive={config.kind === "earth" ? "#0b1d2d" : "#120a05"} emissiveIntensity={0.08} /></mesh>
    {clouds && !compact && <mesh ref={cloudsRef} scale={1.012}><sphereGeometry args={[config.radius, 32, 32]} /><meshStandardMaterial map={clouds} transparent opacity={0.62} depthWrite={false} roughness={0.9} /></mesh>}
    {config.kind === "earth" && !compact && <Atmosphere radius={config.radius} />}
    {config.kind === "ringed" && !compact && <mesh rotation={[Math.PI / 2.45, 0.2, 0]}><ringGeometry args={[config.radius * 1.28, config.radius * 2.12, 72]} /><meshStandardMaterial color="#ad9066" transparent opacity={0.48} side={THREE.DoubleSide} roughness={0.92} /></mesh>}
    <Html center position={[0, config.radius + 0.28, 0]} style={{ pointerEvents: "none" }} wrapperClass="sysnode-html"><span className={`sysnode-label ${config.secondary ? "sysnode-label--secondary" : ""}`}>{config.label}</span></Html>
  </group>;
}

function Debris({ compact, animate }: { compact: boolean; animate: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = compact ? 4 : 12;
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    return Array.from({ length: count }, () => {
      dummy.position.set(0.8 + Math.random() * 7.5, -3.7 + Math.random() * 6.8, 1.8 + Math.random() * 2.2);
      dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      dummy.scale.setScalar(0.025 + Math.random() * 0.075);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, [count]);
  useEffect(() => { matrices.forEach((matrix, index) => meshRef.current?.setMatrixAt(index, matrix)); if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true; }, [matrices]);
  useFrame((_, delta) => { if (animate && meshRef.current) meshRef.current.rotation.y += delta * 0.008; });
  return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#566270" roughness={0.98} /></instancedMesh>;
}

function SolarSystem({ compact, animate, pointerRef }: { compact: boolean; animate: boolean; pointerRef: MutableRefObject<ScenePointer> }) {
  const systemRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!animate || !systemRef.current) return;
    systemRef.current.rotation.y += delta * 0.002;
    systemRef.current.position.x += (pointerRef.current.x * 0.035 - systemRef.current.position.x) * delta * 0.2;
  });
  return <>
    <StarField count={compact ? 180 : 680} width={19} depth={-5.8} size={0.014} opacity={0.46} parallax={0.015} animate={animate} pointerRef={pointerRef} />
    <StarField count={compact ? 80 : 220} width={16} depth={-2.6} size={0.028} opacity={0.34} parallax={0.04} animate={animate} pointerRef={pointerRef} />
    <group ref={systemRef}><Debris compact={compact} animate={animate} />{PLANETS.map((config) => <Planet key={config.label} config={config} compact={compact} animate={animate} />)}<ambientLight intensity={0.08} /><directionalLight position={[-5, 4, 7]} intensity={2.8} color="#d7ecff" /><pointLight position={[2.5, -1, 4]} intensity={12} color="#ffb26a" distance={11} /></group>
  </>;
}

interface SystemArchitectureSceneProps { pointerRef: MutableRefObject<ScenePointer>; }

export function SystemArchitectureScene({ pointerRef }: SystemArchitectureSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 768px)");
  return <div className="sysscene" role="img" aria-label="Cinematic solar-system illustration for a full-stack engineering portfolio. An Earth-like Frontend planet, Backend gas giant, ringed Cloud planet, Data rocky planet, and API moon represent the engineering system."><Canvas dpr={[1, compact ? 1 : 1.5]} camera={{ position: [0, 0, 9.8], fov: 48 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.95; }}><Suspense fallback={null}><SolarSystem compact={compact} animate={!reducedMotion} pointerRef={pointerRef} /></Suspense></Canvas></div>;
}
