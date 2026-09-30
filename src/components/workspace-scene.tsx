"use client";

import { Suspense, useMemo, useRef, useState } from "react";
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
import { ObjectInspector3D, SceneHotspots } from "@/components/scene-hotspots";

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
  const selectedProductId = useWorkspace((s) => s.selectedProductId);
  const setSelectedProductId = useWorkspace((s) => s.setSelectedProductId);

  return (
    <div className={cn("absolute inset-0 h-full w-full", className)}>
      <Canvas
        shadows
        dpr={[1, 1.8]}
        onPointerMissed={() => setSelectedProductId(null)}
        camera={{
          position: [
            0.08,
            1.22 + radius * 0.15,
            3.15 + radius * 0.35,
          ],
          fov: 36,
        }}
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
              <PlacedModel
                key={p.key}
                placement={p}
                isSelected={selectedProductId === p.productId}
                onSelect={() =>
                  setSelectedProductId(
                    selectedProductId === p.productId ? null : p.productId,
                  )
                }
              />
            ))}

            {!readOnly && <SceneHotspots setup={setup} />}

            {setup.desk && (
              <SideTable deskProductId={setup.desk.productId} />
            )}

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
          target={[-0.04, 0.08, 0.18]}
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
function PlacedModel({
  placement,
  isSelected,
  onSelect,
}: {
  placement: Placement;
  isSelected: boolean;
  onSelect: () => void;
}) {
  if (!placement.url) {
    return (
      <GhostBox
        placement={placement}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  }
  return (
    <GLTFModel
      placement={placement}
      url={placement.url}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

function GLTFModel({
  placement,
  url,
  isSelected,
  onSelect,
}: {
  placement: Placement;
  url: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const highlight = useWorkspace((s) => s.highlight);
  const isHighlighted = highlight?.productId === placement.productId || isSelected;
  const [_hovered, setHovered] = useState(false);

  // Clone so the same asset can appear twice (dual monitors) with its own
  // transform, and apply the product's finish to every mesh in it.
  const model = useMemo(() => {
    const clone = scene.clone(true);

    // Auto-ground asset: ensure bottom surface rests on y=0
    const bbox = new THREE.Box3().setFromObject(clone);
    if (bbox.min.y < -0.005) {
      clone.position.y -= bbox.min.y;
    }

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
        // Keep original textured materials if the mesh already has textures.
        const mat = child.material as any;
        const hasTexture = Boolean(
          mat?.map ||
          mat?.emissiveMap ||
          mat?.normalMap ||
          (Array.isArray(mat) && mat.some((m: any) => m.map))
        );
        if (!hasTexture) {
          child.material = material;
        }
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
    const target = isHighlighted ? 1.04 : 1;
    const current = group.current.scale.x;
    const next = current + (target - current) * Math.min(1, delta * 8);

    group.current.scale.setScalar(eased * next);
    group.current.position.y =
      placement.position[1] + (1 - eased) * 0.55 + (isHighlighted ? 0.015 : 0);
  });

  return (
    <group
      ref={group}
      position={placement.position}
      rotation={placement.rotation}
      scale={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <primitive
        object={model}
        onClick={(e: any) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      />
      {isSelected && (
        <ObjectInspector3D
          productId={placement.productId}
          position={[0, 0.45, 0]}
          onClose={onSelect}
        />
      )}
    </group>
  );
}

/**
 * Placeholder for catalog items with no generated mesh — a translucent volume
 * rather than nothing, so the setup still reads as complete.
 */
function GhostBox({
  placement,
  isSelected,
  onSelect,
}: {
  placement: Placement;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const finish = finishFor(placement.productId);
  return (
    <group
      position={[
        placement.position[0],
        placement.position[1] + 0.11,
        placement.position[2],
      ]}
      rotation={placement.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.22, 0.2]} />
        <meshStandardMaterial
          color={finish.color}
          transparent
          opacity={isSelected ? 0.75 : 0.42}
          roughness={0.7}
        />
      </mesh>
      {isSelected && (
        <ObjectInspector3D
          productId={placement.productId}
          position={[0, 0.25, 0]}
          onClose={onSelect}
        />
      )}
    </group>
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

/** Side credenza / utility table for coffee gear and personal items. */
function SideTable({ deskProductId }: { deskProductId?: string }) {
  const isOak = deskProductId === "desk-mechanical";
  const topColor = isOak ? "#c08b55" : "#3d4240";
  const bodyColor = "#262a28";

  return (
    <group position={[-0.92, 0, -0.05]}>
      {/* Table top surface at y=0.58 */}
      <mesh position={[0, 0.568, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.024, 0.46]} />
        <meshStandardMaterial color={topColor} roughness={0.65} metalness={0.15} />
      </mesh>
      {/* Cabinet storage body */}
      <mesh position={[0, 0.31, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.40, 0.44, 0.42]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.25} />
      </mesh>
      {/* Drawer accent line */}
      <mesh position={[0, 0.33, 0.212]}>
        <boxGeometry args={[0.34, 0.005, 0.003]} />
        <meshStandardMaterial color="#141716" roughness={0.5} />
      </mesh>
      {/* Minimalist matte black base feet */}
      {[
        [-0.17, 0.045, -0.18],
        [0.17, 0.045, -0.18],
        [-0.17, 0.045, 0.18],
        [0.17, 0.045, 0.18],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.09, 16]} />
          <meshStandardMaterial color="#1a1c1b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
