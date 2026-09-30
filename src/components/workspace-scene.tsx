"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/cn";
import { finishFor } from "@/lib/finishes";
import { layoutScene, sceneRadius, type Placement } from "@/lib/scene";
import { useWorkspace } from "@/store/workspace-store";
import type { Setup } from "@/types/workspace";

/**
 * The live 3D preview.
 *
 * Meshes are generated offline from monis.rent product photography by
 * Hunyuan3D (see tools/asset-pipeline) and shipped as static Draco-compressed
 * .glb — there is no backend and no inference at request time. Because the
 * public model only returns untextured geometry, each product is tinted to its
 * real finish so items stay distinguishable.
 */

interface WorkspaceSceneProps {
  setup: Setup;
  /** Checkout summary: slow auto-orbit, no user controls. */
  readOnly?: boolean;
  className?: string;
}

export function WorkspaceScene({
  setup,
  readOnly = false,
  className,
}: WorkspaceSceneProps) {
  const placements = layoutScene(setup);
  const radius = sceneRadius(setup);

  return (
    <div className={cn("absolute inset-0 h-full w-full", className)}>
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [2.1 + radius * 0.5, 1.5 + radius * 0.3, 2.6 + radius * 0.55], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f4ece0"]} />
        <fog attach="fog" args={["#f4ece0", 6, 15]} />

        {/* Key light from the upper left, matching the artwork convention */}
        <directionalLight
          position={[-3.2, 4.4, 2.6]}
          intensity={2.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />
        {/* Warm bounce from the right, so shadow sides aren't dead */}
        <directionalLight position={[3.6, 2.2, 1.4]} intensity={0.5} color="#ffd9b8" />
        <ambientLight intensity={0.55} />
        <Environment preset="apartment" environmentIntensity={0.42} />

        <Suspense fallback={null}>
          <group position={[0, -0.42, 0]}>
            {placements.map((p) => (
              <PlacedModel key={p.key} placement={p} />
            ))}

            <Floor radius={radius} />
            <ContactShadows
              position={[0, 0.002, 0]}
              opacity={0.42}
              scale={radius * 3}
              blur={2.4}
              far={2.2}
              resolution={512}
            />
          </group>
        </Suspense>

        <OrbitControls
          makeDefault
          enabled={!readOnly}
          autoRotate={readOnly}
          autoRotateSpeed={0.55}
          target={[0, 0.25, 0]}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.08}
          minDistance={1.8}
          maxDistance={6.5}
          enablePan={false}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}

/** A single product instance, tinted and animated into place. */
function PlacedModel({ placement }: { placement: Placement }) {
  if (!placement.url) return <GhostBox placement={placement} />;
  return <GLTFModel placement={placement} url={placement.url} />;
}

function GLTFModel({
  placement,
  url,
}: {
  placement: Placement;
  url: string;
}) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const highlight = useWorkspace((s) => s.highlight);
  const isHighlighted = highlight?.productId === placement.productId;

  // Clone so the same asset can appear twice (dual monitors) with its own
  // transform, and apply the product's finish to every mesh in it.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const finish = finishFor(placement.productId);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.color),
      metalness: finish.metalness,
      roughness: finish.roughness,
      emissive: finish.emissive
        ? new THREE.Color(finish.emissive)
        : new THREE.Color("#000000"),
      emissiveIntensity: finish.emissiveIntensity ?? 0,
      flatShading: false,
    });
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, placement.productId]);

  // Drop-in on mount, then a gentle lift while highlighted.
  const progress = useRef(0);
  useFrame((_, delta) => {
    if (!group.current) return;
    progress.current = Math.min(1, progress.current + delta * 2.6);
    const eased = 1 - Math.pow(1 - progress.current, 3);
    const target = isHighlighted ? 1.035 : 1;
    const current = group.current.scale.x;
    const next = current + (target - current) * Math.min(1, delta * 8);

    group.current.scale.setScalar(eased * next);
    group.current.position.y =
      placement.position[1] + (1 - eased) * 0.55 + (isHighlighted ? 0.012 : 0);
  });

  return (
    <group
      ref={group}
      position={placement.position}
      rotation={placement.rotation}
      scale={0}
    >
      <primitive object={model} />
    </group>
  );
}

/**
 * Placeholder for catalog items with no generated mesh — a translucent volume
 * rather than nothing, so the setup still reads as complete.
 */
function GhostBox({ placement }: { placement: Placement }) {
  const finish = finishFor(placement.productId);
  return (
    <mesh
      position={[
        placement.position[0],
        placement.position[1] + 0.11,
        placement.position[2],
      ]}
      rotation={placement.rotation}
      castShadow
    >
      <boxGeometry args={[0.2, 0.22, 0.2]} />
      <meshStandardMaterial
        color={finish.color}
        transparent
        opacity={0.42}
        roughness={0.7}
      />
    </mesh>
  );
}

/** The platform the setup stands on. */
function Floor({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[radius * 1.35, 64]} />
      <meshStandardMaterial color="#efe6d6" roughness={0.95} metalness={0} />
    </mesh>
  );
}
