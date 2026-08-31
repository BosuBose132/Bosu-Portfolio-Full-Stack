import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./SystemArchitectureScene.css";
import earthDayMap from "../../assets/textures/space/earth-daymap.jpg";
import earthClouds from "../../assets/textures/space/earth-clouds.jpg";
import jupiterMap from "../../assets/textures/space/jupiter.jpg";
import marsMap from "../../assets/textures/space/mars.jpg";
import moonMap from "../../assets/textures/space/moon.jpg";
import saturnMap from "../../assets/textures/space/saturn.jpg";
import saturnRingMap from "../../assets/textures/space/saturn-ring-alpha.png";

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
  { label: "01 // FRONTEND", position: [1.55, 2.05, -1.1], radius: 0.7, kind: "earth", rotationSpeed: 0.022 },
  { label: "03 // BACKEND", position: [5.35, 1.05, 0.15], radius: 1.16, kind: "gas", rotationSpeed: 0.009 },
  { label: "05 // CLOUD", position: [7.55, -2.85, 0.9], radius: 1.34, kind: "ringed", rotationSpeed: 0.012 },
  { label: "04 // DATA", position: [4.15, -2.85, -1.55], radius: 0.4, kind: "rocky", rotationSpeed: 0.018, secondary: true },
  { label: "02 // API", position: [7.7, 2.85, -2.8], radius: 0.3, kind: "moon", rotationSpeed: 0.006, secondary: true },
];

const TEXTURE_MAPS: Record<PlanetKind, string> = {
  earth: earthDayMap,
  gas: jupiterMap,
  ringed: saturnMap,
  rocky: marsMap,
  moon: moonMap,
};

function createStars(count: number, width: number, depth: number, densityBias = 0) {
  const home = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const velocity = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const pointer = index * 3;
    const x = (Math.random() - 0.5) * width + densityBias;
    home[pointer] = positions[pointer] = x;
    home[pointer + 1] = positions[pointer + 1] = (Math.random() - 0.5) * 9 + Math.sin(index * 0.7) * 0.3;
    home[pointer + 2] = positions[pointer + 2] = depth + (Math.random() - 0.5) * 2.5;
    const warm = Math.random() > 0.9;
    colors[pointer] = warm ? 1 : 0.52 + Math.random() * 0.23;
    colors[pointer + 1] = warm ? 0.72 : 0.67 + Math.random() * 0.21;
    colors[pointer + 2] = warm ? 0.44 : 0.85 + Math.random() * 0.15;
  }
  return { home, positions, velocity, colors };
}

function StarField({ count, width, depth, size, opacity, parallax, interactive, animate, pointerRef }: {
  count: number;
  width: number;
  depth: number;
  size: number;
  opacity: number;
  parallax: number;
  interactive?: boolean;
  animate: boolean;
  pointerRef: MutableRefObject<ScenePointer>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const stars = useMemo(() => createStars(count, width, depth, interactive ? 2.1 : 0), [count, depth, interactive, width]);
  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.position.x += (pointerRef.current.x * parallax - groupRef.current.position.x) * delta * 0.25;
    groupRef.current.position.y += (pointerRef.current.y * parallax * 0.55 - groupRef.current.position.y) * delta * 0.25;
    if (!interactive) return;
    const attribute = (groupRef.current.children[0] as THREE.Points).geometry.attributes.position as THREE.BufferAttribute;
    const pointerX = pointerRef.current.x * 8;
    const pointerY = pointerRef.current.y * 4.5;
    const frameScale = Math.min(delta * 60, 1.5);
    for (let index = 0; index < count; index += 1) {
      const positionIndex = index * 3;
      const velocityIndex = index * 2;
      const currentX = stars.positions[positionIndex];
      const currentY = stars.positions[positionIndex + 1];
      const dx = currentX - pointerX;
      const dy = currentY - pointerY;
      const distance = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - distance / 1.8) ** 2;
      if (distance > 0.001 && influence > 0) {
        stars.velocity[velocityIndex] += (dx / distance) * influence * 0.007 * frameScale;
        stars.velocity[velocityIndex + 1] += (dy / distance) * influence * 0.007 * frameScale;
      }
      stars.velocity[velocityIndex] += (stars.home[positionIndex] - currentX) * 0.012 * frameScale;
      stars.velocity[velocityIndex + 1] += (stars.home[positionIndex + 1] - currentY) * 0.012 * frameScale;
      stars.velocity[velocityIndex] *= 0.9;
      stars.velocity[velocityIndex + 1] *= 0.9;
      stars.positions[positionIndex] += stars.velocity[velocityIndex] * frameScale;
      stars.positions[positionIndex + 1] += stars.velocity[velocityIndex + 1] * frameScale;
      attribute.setXYZ(index, stars.positions[positionIndex], stars.positions[positionIndex + 1], stars.positions[positionIndex + 2]);
    }
    attribute.needsUpdate = true;
  });
  return <group ref={groupRef}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars.positions, 3]} /><bufferAttribute attach="attributes-color" args={[stars.colors, 3]} /></bufferGeometry><pointsMaterial size={size} transparent opacity={opacity} vertexColors sizeAttenuation depthWrite={false} /></points></group>;
}

function Atmosphere({ radius }: { radius: number }) {
  return <mesh scale={1.055}><sphereGeometry args={[radius, 28, 28]} /><shaderMaterial transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} uniforms={{ glowColor: { value: new THREE.Color("#8fdcff") } }} vertexShader="varying vec3 normalDirection; varying vec3 viewDirection; void main() { normalDirection = normalize(normalMatrix * normal); vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); viewDirection = normalize(-mvPosition.xyz); gl_Position = projectionMatrix * mvPosition; }" fragmentShader="uniform vec3 glowColor; varying vec3 normalDirection; varying vec3 viewDirection; void main() { float rim = pow(1.0 - max(dot(normalDirection, viewDirection), 0.0), 3.3); gl_FragColor = vec4(glowColor, rim * 0.38); }" /></mesh>;
}

function Planet({ config, compact, animate }: { config: PlanetConfig; compact: boolean; animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const map = useTexture(TEXTURE_MAPS[config.kind]);
  const clouds = useTexture(earthClouds);
  const ringMap = useTexture(saturnRingMap);

  useEffect(() => {
    [map, clouds, ringMap].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    });
  }, [clouds, map, ringMap]);

  useFrame((state) => {
    if (!animate || !groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * config.rotationSpeed;
    groupRef.current.position.x = config.position[0] + Math.cos(state.clock.elapsedTime * 0.09 + config.radius * 2) * 0.018;
    groupRef.current.position.y = config.position[1] + Math.sin(state.clock.elapsedTime * 0.12 + config.radius) * 0.025;
    if (cloudsRef.current) cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.032;
  });

  return <group ref={groupRef} position={config.position}>
    <mesh><sphereGeometry args={[config.radius, compact ? 18 : 36, compact ? 18 : 36]} /><meshStandardMaterial map={map} roughness={config.kind === "earth" ? 0.52 : 0.86} metalness={0.01} emissive={config.kind === "earth" ? "#06101a" : "#080604"} emissiveIntensity={0.035} /></mesh>
    {config.kind === "earth" && !compact && <mesh ref={cloudsRef} scale={1.012}><sphereGeometry args={[config.radius, 32, 32]} /><meshStandardMaterial map={clouds} transparent opacity={0.42} depthWrite={false} roughness={0.9} /></mesh>}
    {config.kind === "earth" && !compact && <Atmosphere radius={config.radius} />}
    {config.kind === "ringed" && !compact && <group rotation={[Math.PI / 2.45, 0.2, 0]}><mesh><ringGeometry args={[config.radius * 1.25, config.radius * 2.18, 128]} /><meshStandardMaterial map={ringMap} alphaMap={ringMap} transparent opacity={0.84} alphaTest={0.025} side={THREE.DoubleSide} roughness={0.78} metalness={0.04} depthWrite={false} /></mesh><mesh rotation={[0, 0, 0.006]}><ringGeometry args={[config.radius * 1.3, config.radius * 2.05, 128]} /><meshBasicMaterial map={ringMap} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} /></mesh></group>}
    <Html center position={[0, config.radius + 0.28, 0]} style={{ pointerEvents: "none" }} wrapperClass="sysnode-html"><span className={`sysnode-label ${config.secondary ? "sysnode-label--secondary" : ""}`}>{config.label}</span></Html>
  </group>;
}

function Debris({ compact, animate, pointerRef }: { compact: boolean; animate: boolean; pointerRef: MutableRefObject<ScenePointer> }) {
  const groupRef = useRef<THREE.Group>(null);
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
  useFrame((state, delta) => {
    if (!animate || !meshRef.current || !groupRef.current) return;
    meshRef.current.rotation.y += delta * 0.008;
    groupRef.current.position.x += (pointerRef.current.x * 0.12 - groupRef.current.position.x) * delta * 0.22;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
  });
  const geometry = useMemo(() => {
    const asteroid = new THREE.IcosahedronGeometry(1, 2);
    const positions = asteroid.attributes.position as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      const scale = 0.8 + Math.sin(index * 2.7) * 0.11 + Math.cos(index * 1.3) * 0.08;
      positions.setXYZ(index, positions.getX(index) * scale, positions.getY(index) * scale, positions.getZ(index) * scale);
    }
    asteroid.computeVertexNormals();
    return asteroid;
  }, []);
  return <group ref={groupRef}><instancedMesh ref={meshRef} args={[undefined, undefined, count]}><primitive object={geometry} attach="geometry" /><meshStandardMaterial color="#4f5660" roughness={0.98} metalness={0.02} /></instancedMesh></group>;
}

function SolarSystem({ compact, animate, pointerRef }: { compact: boolean; animate: boolean; pointerRef: MutableRefObject<ScenePointer> }) {
  const systemRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!animate || !systemRef.current) return;
    systemRef.current.rotation.y += delta * 0.002;
    systemRef.current.position.x += (pointerRef.current.x * 0.05 - systemRef.current.position.x) * delta * 0.2;
    systemRef.current.position.y += (pointerRef.current.y * 0.025 - systemRef.current.position.y) * delta * 0.2;
  });
  return <>
    <StarField count={compact ? 180 : 760} width={20} depth={-5.8} size={0.014} opacity={0.42} parallax={0.012} animate={animate} pointerRef={pointerRef} />
    <StarField count={compact ? 80 : 280} width={17} depth={-2.6} size={0.026} opacity={0.36} parallax={0.04} animate={animate} pointerRef={pointerRef} />
    <StarField count={compact ? 24 : 120} width={15} depth={1.4} size={0.048} opacity={0.28} parallax={0.12} interactive={!compact} animate={animate} pointerRef={pointerRef} />
    <group ref={systemRef}><Debris compact={compact} animate={animate} pointerRef={pointerRef} />{PLANETS.map((config) => <Planet key={config.label} config={config} compact={compact} animate={animate} />)}<ambientLight intensity={0.08} /><directionalLight position={[-5, 4, 7]} intensity={2.8} color="#d7ecff" /><pointLight position={[2.5, -1, 4]} intensity={12} color="#ffb26a" distance={11} /></group>
  </>;
}

interface SystemArchitectureSceneProps { pointerRef: MutableRefObject<ScenePointer>; }

export function SystemArchitectureScene({ pointerRef }: SystemArchitectureSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 768px)");
  return <div className="sysscene" role="img" aria-label="Cinematic solar-system illustration for a full-stack engineering portfolio. An Earth-like Frontend planet, Backend gas giant, ringed Cloud planet, Data rocky planet, and API moon represent the engineering system."><Canvas dpr={[1, compact ? 1 : 1.5]} camera={{ position: [0, 0, 9.8], fov: 48 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.95; }}><Suspense fallback={null}><SolarSystem compact={compact} animate={!reducedMotion} pointerRef={pointerRef} /></Suspense></Canvas></div>;
}
