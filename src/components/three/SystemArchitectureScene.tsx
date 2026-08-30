import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./SystemArchitectureScene.css";

/* =====================================================================
   SystemArchitectureScene
   Eight labelled nodes connected by data-flow edges, with request
   packets flowing along them and a central "Build -> Test -> Deploy"
   label. Each node can be grabbed and dragged; the edges and packets
   follow it live.
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
  { label: "Frontend", pos: [-3.1, 1.9, 0.3], accent: "cyan" },
  { label: "API Gateway", pos: [-0.2, 2.7, -0.4], accent: "blue" },
  { label: "Backend", pos: [2.9, 1.6, 0.2], accent: "amber" },
  { label: "Database", pos: [3.5, -1.1, -0.3], accent: "green" },
  { label: "Cloud", pos: [1.4, -2.7, 0.4], accent: "orange" },
  { label: "AI / OCR", pos: [-1.7, -2.6, -0.2], accent: "cyan" },
  { label: "Monitoring", pos: [-3.7, -0.7, 0.3], accent: "blue" },
  { label: "CI/CD", pos: [-2.2, 0.6, -0.5], accent: "amber" },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [5, 2],
  [4, 6],
  [6, 0],
  [7, 0],
  [7, 4],
  [3, 4],
];

function System({ animate }: { animate: boolean }) {
  const { gl } = useThree();

  // Live, mutable node positions shared by nodes, edges, and packets.
  const posts = useMemo(
    () => NODES.map((n) => new THREE.Vector3(...n.pos)),
    []
  );
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const lineRef = useRef<THREE.BufferGeometry>(null);
  const packetRef = useRef<THREE.Points>(null);
  const dragIndex = useRef<number | null>(null);
  const plane = useMemo(() => new THREE.Plane(), []);
  const planeNormal = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

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

  // Release drag anywhere the pointer is lifted.
  useEffect(() => {
    const up = () => {
      dragIndex.current = null;
      gl.domElement.style.cursor = "auto";
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [gl]);

  useFrame((state) => {
    // 1. If dragging, project the pointer onto the node's depth plane.
    if (dragIndex.current !== null) {
      const i = dragIndex.current;
      plane.setFromNormalAndCoplanarPoint(
        planeNormal,
        new THREE.Vector3(0, 0, posts[i].z)
      );
      state.raycaster.setFromCamera(state.pointer, state.camera);
      if (state.raycaster.ray.intersectPlane(plane, hit)) {
        posts[i].set(hit.x, hit.y, posts[i].z);
      }
    }

    // 2. Sync node groups (and their labels) to their positions.
    posts.forEach((p, i) => {
      const g = nodeRefs.current[i];
      if (g) g.position.copy(p);
    });

    // 3. Rebuild edge lines from the live positions.
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

    // 4. Move packets along their edges (respecting reduced motion).
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

  const startDrag = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragIndex.current = i;
    gl.domElement.style.cursor = "grabbing";
    try {
      gl.domElement.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
  };

  const onHover = (over: boolean) => () => {
    if (dragIndex.current === null) {
      gl.domElement.style.cursor = over ? "grab" : "auto";
    }
  };

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
      {NODES.map((node, i) => {
        const color = ACCENT_HEX[node.accent];
        return (
          <group
            key={node.label}
            position={node.pos}
            ref={(el) => (nodeRefs.current[i] = el)}
          >
            {/* invisible, larger grab target */}
            <mesh
              onPointerDown={startDrag(i)}
              onPointerOver={onHover(true)}
              onPointerOut={onHover(false)}
            >
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* soft halo */}
            <mesh>
              <sphereGeometry args={[0.34, 24, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
            </mesh>
            {/* core */}
            <mesh>
              <sphereGeometry args={[0.16, 24, 24]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* wire ring */}
            <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
              <torusGeometry args={[0.28, 0.012, 10, 40]} />
              <meshBasicMaterial color={color} transparent opacity={0.55} />
            </mesh>

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

      {/* Central label */}
      <Html center position={[0, 0, 0]} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        <span className="sysnode-core">Build → Test → Deploy</span>
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
      aria-label="Interactive 3D diagram of a software system: Frontend, API Gateway, Backend, Database, Cloud, AI/OCR, Monitoring, and CI/CD nodes connected by data-flow edges, centered on a Build, Test, Deploy pipeline. Each node can be dragged to rearrange it."
    >
      <Canvas
        dpr={[1, isMobile ? 1.25 : 1.9]}
        camera={{ position: [0, 0, 9.5], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <Suspense fallback={null}>
          <System animate={!reducedMotion} />
        </Suspense>
      </Canvas>
      <span className="sysscene__hint" aria-hidden="true">
        Drag the nodes
      </span>
    </div>
  );
}
