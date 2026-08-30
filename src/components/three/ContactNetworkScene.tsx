import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./ContactNetworkScene.css";

/* =====================================================================
   ContactNetworkScene
   A small collaboration graph: You (developer) at the center connected
   to Recruiter, Team, and Cloud. Represents connection & communication
   — not a planet. Gentle motion + request packets.
   ===================================================================== */

type Accent = "amber" | "cyan" | "blue" | "green";
const ACCENT_HEX: Record<Accent, string> = {
  amber: "#f59e0b",
  cyan: "#38bdf8",
  blue: "#3b82f6",
  green: "#22c55e",
};

interface Node {
  label: string;
  pos: [number, number, number];
  accent: Accent;
  hub?: boolean;
}

const NODES: Node[] = [
  { label: "You", pos: [0, 0, 0], accent: "amber", hub: true },
  { label: "Recruiter", pos: [2.6, 1.3, 0.4], accent: "cyan" },
  { label: "Team", pos: [-2.7, 1.0, -0.4], accent: "blue" },
  { label: "Cloud", pos: [1.6, -2.0, 0.3], accent: "green" },
  { label: "Collaboration", pos: [-1.8, -1.9, -0.3], accent: "cyan" },
];

/* Everything connects through the hub (index 0). */
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 3],
  [2, 4],
];

function NodeMesh({ node }: { node: Node }) {
  const color = ACCENT_HEX[node.accent];
  const r = node.hub ? 0.26 : 0.17;
  return (
    <group position={node.pos}>
      <mesh>
        <sphereGeometry args={[r * 2.1, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[r, 24, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html center position={[0, r + 0.32, 0]} style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
        <span
          className={`cnode-label ${node.hub ? "cnode-label--hub" : ""}`}
          style={{ ["--node" as string]: color }}
        >
          {node.label}
        </span>
      </Html>
    </group>
  );
}

function Edges() {
  const positions = useMemo(() => {
    const pts: number[] = [];
    EDGES.forEach(([a, b]) => pts.push(...NODES[a].pos, ...NODES[b].pos));
    return new Float32Array(pts);
  }, []);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#38bdf8" transparent opacity={0.3} depthWrite={false} />
    </lineSegments>
  );
}

function Packets({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const routes = useMemo(
    () =>
      EDGES.map(([a, b], i) => ({
        from: new THREE.Vector3(...NODES[a].pos),
        to: new THREE.Vector3(...NODES[b].pos),
        offset: (i * 0.5) % 1,
        speed: 0.2 + (i % 3) * 0.04,
      })),
    []
  );
  const positions = useMemo(() => new Float32Array(routes.length * 3), [routes.length]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    routes.forEach((r, i) => {
      const prog = animate ? (r.offset + t * r.speed) % 1 : r.offset;
      attr.setXYZ(
        i,
        THREE.MathUtils.lerp(r.from.x, r.to.x, prog),
        THREE.MathUtils.lerp(r.from.y, r.to.y, prog),
        THREE.MathUtils.lerp(r.from.z, r.to.z, prog)
      );
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f59e0b" size={0.15} transparent sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Network({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    if (animate) group.current.rotation.y += 0.0014;
    const tx = state.pointer.y * 0.14;
    group.current.rotation.x += (tx - group.current.rotation.x) * 0.05;
    if (!animate) {
      const ty = state.pointer.x * 0.3;
      group.current.rotation.y += (ty - group.current.rotation.y) * 0.05;
    }
  });
  return (
    <group ref={group}>
      <Edges />
      {NODES.map((n) => (
        <NodeMesh key={n.label} node={n} />
      ))}
      <Packets animate={animate} />
    </group>
  );
}

export function ContactNetworkScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div
      className="cnetscene"
      role="img"
      aria-label="3D collaboration network: You connected to a Recruiter, Team, Cloud, and Collaboration, representing communication."
    >
      <Canvas
        dpr={[1, isMobile ? 1.25 : 1.9]}
        camera={{ position: [0, 0, 8], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <Suspense fallback={null}>
          <Network animate={!reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
