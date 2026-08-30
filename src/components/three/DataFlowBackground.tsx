import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./DataFlowBackground.css";

/* =====================================================================
   DataFlowBackground
   A subtle, full-page engineering ambience: faint drifting system
   nodes, connection lines, and packet-like dots moving through them.
   Not space — a distributed-systems field. Downgrades on mobile and
   fully static under prefers-reduced-motion.
   ===================================================================== */

interface FieldProps {
  count: number;
  animate: boolean;
}

/** Slowly drifting node field with soft connection lines. */
function NodeField({ count, animate }: FieldProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Deterministic-ish node layout across a wide, shallow volume.
  const nodes = useMemo(() => {
    const arr: { pos: THREE.Vector3; speed: number; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6
        ),
        speed: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  // Connection lines between nodes that are reasonably close together.
  const linePositions = useMemo(() => {
    const pts: number[] = [];
    const maxDist = 2.8;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < maxDist) {
          pts.push(
            nodes[i].pos.x,
            nodes[i].pos.y,
            nodes[i].pos.z,
            nodes[j].pos.x,
            nodes[j].pos.y,
            nodes[j].pos.z
          );
        }
      }
    }
    return new Float32Array(pts);
  }, [nodes]);

  const nodePositions = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      arr[i * 3] = n.pos.x;
      arr[i * 3 + 1] = n.pos.y;
      arr[i * 3 + 2] = n.pos.z;
    });
    return arr;
  }, [nodes]);

  useFrame((state) => {
    if (!animate || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Barely-there drift + a whisper of pointer parallax.
    groupRef.current.rotation.y = Math.sin(t * 0.03) * 0.05;
    groupRef.current.rotation.x = Math.cos(t * 0.025) * 0.03;
    groupRef.current.position.x = state.pointer.x * 0.2;
    groupRef.current.position.y = state.pointer.y * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </lineSegments>

      {/* Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#7dd3fc"
          size={0.07}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <Packets nodes={nodes} animate={animate} />
    </group>
  );
}

/** Packet-like dots traveling between random node pairs. */
function Packets({
  nodes,
  animate,
}: {
  nodes: { pos: THREE.Vector3 }[];
  animate: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const count = Math.min(5, Math.floor(nodes.length / 4));

  const routes = useMemo(() => {
    const r: { from: THREE.Vector3; to: THREE.Vector3; offset: number; speed: number }[] = [];
    for (let i = 0; i < count; i++) {
      const from = nodes[Math.floor(Math.random() * nodes.length)].pos;
      const to = nodes[Math.floor(Math.random() * nodes.length)].pos;
      r.push({
        from,
        to,
        offset: Math.random(),
        speed: 0.04 + Math.random() * 0.05,
      });
    }
    return r;
  }, [nodes, count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const prog = animate ? (route.offset + t * route.speed) % 1 : route.offset;
      attr.setXYZ(
        i,
        THREE.MathUtils.lerp(route.from.x, route.to.x, prog),
        THREE.MathUtils.lerp(route.from.y, route.to.y, prog),
        THREE.MathUtils.lerp(route.from.z, route.to.z, prog)
      );
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f59e0b"
        size={0.11}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function DataFlowBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Static gradient fallback (also what shows under reduced motion).
  if (reducedMotion) {
    return <div className="bg-layer bg-layer--static" aria-hidden="true" />;
  }

  const count = isMobile ? 8 : 16;

  return (
    <div className="bg-layer" aria-hidden="true">
      <Canvas
        dpr={[1, isMobile ? 1.25 : 1.75]}
        camera={{ position: [0, 0, 12], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <NodeField count={count} animate={!reducedMotion} />
          <fog attach="fog" args={["#06101d", 12, 24]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
