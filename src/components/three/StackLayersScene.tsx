import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { stackLayers } from "../../data/portfolioData";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./StackLayersScene.css";

/* =====================================================================
   StackLayersScene
   A layered architecture: five stacked slabs (frontend -> cloud) with
   signal packets moving vertically between the layers. Slowly rotates
   and reacts to the pointer. No progress bars, no percentages.
   ===================================================================== */

const ACCENT_HEX: Record<string, string> = {
  cyan: "#38bdf8",
  blue: "#3b82f6",
  amber: "#f59e0b",
  green: "#22c55e",
  orange: "#f97316",
};

const LAYER_GAP = 1.25;
const layerY = (i: number, total: number) =>
  (total - 1 - i) * LAYER_GAP - ((total - 1) * LAYER_GAP) / 2;

function Slab({
  y,
  color,
  label,
  tech,
}: {
  y: number;
  color: string;
  label: string;
  tech: string;
}) {
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[4.4, 0.34, 2.4]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.16}
          metalness={0.2}
          roughness={0.6}
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* bright edge frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.4, 0.34, 2.4)]} />
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </lineSegments>

      <Html
        center
        position={[0, 0, 1.3]}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <span className="stacklayer-label" style={{ ["--layer" as string]: color }}>
          <strong>{label}</strong>
          <em>{tech}</em>
        </span>
      </Html>
    </group>
  );
}

/* Signals moving up & down between layers */
function Signals({ total, animate }: { total: number; animate: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const top = layerY(0, total);
  const bottom = layerY(total - 1, total);

  const signals = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        x: (Math.random() - 0.5) * 3.4,
        z: (Math.random() - 0.5) * 1.8,
        offset: Math.random(),
        speed: 0.12 + Math.random() * 0.16,
        dir: i % 2 === 0 ? 1 : -1,
      })),
    []
  );
  const positions = useMemo(() => new Float32Array(signals.length * 3), [signals.length]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    signals.forEach((s, i) => {
      const raw = animate ? (s.offset + t * s.speed) % 1 : s.offset;
      const prog = s.dir === 1 ? raw : 1 - raw;
      attr.setXYZ(i, s.x, THREE.MathUtils.lerp(bottom, top, prog), s.z);
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f59e0b" size={0.16} transparent sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Stack({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const total = stackLayers.length;

  useFrame((state) => {
    if (!group.current) return;
    if (animate) group.current.rotation.y += 0.0018;
    const targetX = 0.32 + state.pointer.y * 0.12;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    if (!animate) {
      const targetY = state.pointer.x * 0.4;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={group} rotation={[0.32, 0.5, 0]}>
      {stackLayers.map((layer, i) => (
        <Slab
          key={layer.id}
          y={layerY(i, total)}
          color={ACCENT_HEX[layer.accent] ?? "#38bdf8"}
          label={layer.label}
          tech={layer.tech}
        />
      ))}
      <Signals total={total} animate={animate} />
    </group>
  );
}

export function StackLayersScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className="stackscene"
      role="img"
      aria-label="3D layered architecture diagram with five stacked layers from top to bottom: Frontend, Service, Backend, Database, and Cloud, with signals flowing between them."
    >
      <Canvas
        dpr={[1, isMobile ? 1.25 : 1.9]}
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 5]} intensity={0.8} />
          <Stack animate={!reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
