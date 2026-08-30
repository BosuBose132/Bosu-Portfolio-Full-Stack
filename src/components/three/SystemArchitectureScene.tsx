import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./SystemArchitectureScene.css";

/* =====================================================================
   SystemArchitectureScene
  A readable request path runs from Frontend through API, Backend,
  Database, and Cloud. Supporting AI/OCR, Monitoring, and CI/CD nodes
  show the production systems around that primary flow.
   ===================================================================== */

type Accent = "cyan" | "blue" | "amber" | "green" | "orange";

const ACCENT_HEX: Record<Accent, string> = {
  cyan: "#38bdf8",
  blue: "#3b82f6",
  amber: "#f59e0b",
  green: "#22c55e",
  orange: "#f97316",
};

interface Node {
  label: string;
  pos: [number, number, number];
  accent: Accent;
}

const NODES: Node[] = [
  { label: "Frontend", pos: [-3.5, 0.8, 0.2], accent: "cyan" },
  { label: "API", pos: [-1.8, 0.8, -0.1], accent: "blue" },
  { label: "Backend", pos: [0, 0.8, 0.25], accent: "amber" },
  { label: "Database", pos: [1.8, 0.8, -0.1], accent: "green" },
  { label: "Cloud", pos: [3.5, 0.8, 0.2], accent: "orange" },
  { label: "AI / OCR", pos: [-0.7, -1.45, -0.25], accent: "cyan" },
  { label: "Monitoring", pos: [2, -1.45, 0.1], accent: "blue" },
  { label: "CI/CD", pos: [-2.55, -1.45, -0.2], accent: "amber" },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 2],
  [2, 6],
  [7, 2],
];

function System({ animate, compact }: { animate: boolean; compact: boolean }) {
  const posts = useMemo(
    () => NODES.map((n) => new THREE.Vector3(...n.pos)),
    []
  );
  const lineRef = useRef<THREE.BufferGeometry>(null);
  const packetRef = useRef<THREE.Points>(null);

  const lineArray = useMemo(() => new Float32Array(EDGES.length * 6), []);
  const packetArray = useMemo(() => new Float32Array(EDGES.length * 3), []);
  const routes = useMemo(
    () =>
      EDGES.map(([a, b], i) => ({
        a,
        b,
        offset: (i * 0.618) % 1,
        speed: 0.16 + (i % 4) * 0.03,
      })),
    []
  );

  useFrame((state) => {
    // Keep packet positions synchronized to the static production flow.
    if (lineRef.current) {
      EDGES.forEach(([a, b], k) => {
        lineArray[k * 6] = posts[a].x;
        lineArray[k * 6 + 1] = posts[a].y;
        lineArray[k * 6 + 2] = posts[a].z;
        lineArray[k * 6 + 3] = posts[b].x;
        lineArray[k * 6 + 4] = posts[b].y;
        lineArray[k * 6 + 5] = posts[b].z;
      });
      const attr = lineRef.current.attributes.position as THREE.BufferAttribute;
      attr.needsUpdate = true;
    }

    // Move packets along request paths unless the user prefers reduced motion.
    if (packetRef.current) {
      const t = state.clock.elapsedTime;
      const attr = packetRef.current.geometry.attributes
        .position as THREE.BufferAttribute;
      routes.forEach((r, i) => {
        const prog = animate ? (r.offset + t * r.speed) % 1 : r.offset;
        attr.setXYZ(
          i,
          THREE.MathUtils.lerp(posts[r.a].x, posts[r.b].x, prog),
          THREE.MathUtils.lerp(posts[r.a].y, posts[r.b].y, prog),
          THREE.MathUtils.lerp(posts[r.a].z, posts[r.b].z, prog)
        );
      });
      attr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Edges */}
      <lineSegments>
        <bufferGeometry ref={lineRef}>
          <bufferAttribute attach="attributes-position" args={[lineArray, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.28} depthWrite={false} />
      </lineSegments>

      {/* Nodes */}
      {NODES.map((node) => {
        const color = ACCENT_HEX[node.accent];
        return (
          <group
            key={node.label}
            position={node.pos}
          >
            {!compact && (
              <mesh>
                <sphereGeometry args={[0.32, 20, 20]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} />
              </mesh>
            )}
            <mesh>
              <sphereGeometry args={[compact ? 0.12 : 0.15, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {!compact && (
              <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
                <torusGeometry args={[0.27, 0.01, 8, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.45} />
              </mesh>
            )}

            <Html
              center
              position={[0, 0.52, 0]}
              zIndexRange={[10, 0]}
              style={{ pointerEvents: "none" }}
              wrapperClass="sysnode-html"
            >
              <span className="sysnode-label" style={{ ["--node" as string]: color }}>
                {node.label}
              </span>
            </Html>
          </group>
        );
      })}

      {/* Packets */}
      <points ref={packetRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[packetArray, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#f59e0b" size={0.17} transparent sizeAttenuation depthWrite={false} />
      </points>

      <Html center position={[0, -0.2, 0]} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        <span className="sysnode-core">Request flow</span>
      </Html>
    </group>
  );
}

export function SystemArchitectureScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className="sysscene"
      role="img"
      aria-label="3D diagram of a software system showing Frontend requests passing through an API to Backend services, Database, and Cloud, with AI/OCR, Monitoring, and CI/CD connected to the production flow."
    >
      <Canvas
        dpr={[1, isMobile ? 1.25 : 1.9]}
        camera={{ position: [0, 0, 9.5], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <Suspense fallback={null}>
          <System animate={!reducedMotion} compact={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
