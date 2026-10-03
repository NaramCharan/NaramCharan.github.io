"use client";

import { Suspense, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import HelmetGLB from "./HelmetGLB";
import { ArmorProvider, useArmor } from "./context";
import { BODY, sampleCamera } from "./timeline";

const FOV = 30;
const DEG = Math.PI / 180;

/** Raw scroll progress → smoothed progress the whole scene reads. Damping
 *  gives the scrub a cinematic weight without decoupling it from scroll. */
function ProgressDriver({ raw }: { raw: MutableRefObject<number> }) {
  const { progressRef, reduced } = useArmor();
  useFrame((_, dt) => {
    progressRef.current = reduced ? 1 : THREE.MathUtils.damp(progressRef.current, raw.current, 4.5, Math.min(dt, 0.1));
  }, -1);
  return null;
}

/**
 * Camera: spherical orbit sampled from CAMERA_KEYS. The final radius is
 * solved from the viewport so the full body (head → feet) fills ~80% of the
 * height, centred on the body axis — and widened if a narrow portrait screen
 * would clip the arms.
 */
function CameraRig() {
  const { progressRef } = useArmor();
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const aspect = size.width / size.height;
    const tanHalf = Math.tan((FOV / 2) * DEG);
    // The helmet fills ~62% of the height (56% on portrait, leaving the
    // title clear above it).
    const fill = aspect < 0.8 ? 0.56 : 0.62;
    const byHeight = (BODY.height / fill) / 2 / tanHalf;
    const byWidth = (BODY.width / 0.8) / 2 / (tanHalf * aspect);
    const finalR = Math.max(byHeight, byWidth);
    // Narrow screens pull every earlier shot back a little too.
    const rScale = aspect < 0.8 ? 1.35 : aspect < 1.2 ? 1.12 : 1;
    const c = sampleCamera(progressRef.current, finalR, rScale);
    target.set(c.tx, c.ty, 0);
    const az = c.az * DEG;
    const el = c.el * DEG;
    camera.position.set(
      target.x + c.r * Math.sin(az) * Math.cos(el),
      target.y + c.r * Math.sin(el),
      target.z + c.r * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(target);
  });
  return null;
}

/** Drifting dust caught in the light — deterministic positions. */
function Particles({ count = 700 }: { count?: number }) {
  const { reduced } = useArmor();
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    let seed = 1337;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rnd() - 0.5) * 8;
      a[i * 3 + 1] = (rnd() - 0.5) * 4.4;
      a[i * 3 + 2] = (rnd() - 0.6) * 6;
    }
    return a;
  }, [count]);
  useFrame((_, dt) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y += dt * 0.012;
    ref.current.position.y = ((ref.current.position.y + 0.2 + dt * 0.03) % 0.4) - 0.2;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#9fd8ff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function Stage({ raw }: { raw: MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#030405"]} />
      <fog attach="fog" args={["#030405", 7, 16]} />
      <ProgressDriver raw={raw} />
      <CameraRig />

      <ambientLight intensity={0.06} />
      {/* key — warm, high front-left: the hot highlight across the faceplate */}
      <directionalLight position={[-2.4, 3.2, 4.2]} intensity={2.6} color="#fff1e2" />
      {/* soft cool fill from the right so the shadow side keeps its red */}
      <directionalLight position={[3.2, -0.4, 3]} intensity={0.55} color="#cfe3ff" />
      {/* rims — cool back-left, warm back-right: cuts the silhouette out of the black */}
      <directionalLight position={[-3.5, 2.2, -3.2]} intensity={3.4} color="#8fd6ff" />
      <directionalLight position={[3.4, 1.4, -3.0]} intensity={2.6} color="#ffad7a" />

      {/* studio reflections for the metal — framed lightformers, no HDR fetch */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-1.5, 3.5, 3]} scale={[5, 1.6, 1]} rotation-x={Math.PI / 2.6} />
        <Lightformer form="rect" intensity={1.1} color="#ffd9b0" position={[-4, 0.5, 1]} scale={[2, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} color="#e6eeff" position={[4, 0.5, -1]} scale={[2, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={0.5} color="#ffffff" position={[0, 0, 5]} scale={2} />
      </Environment>

      <Suspense fallback={null}>
          <HelmetGLB />
        </Suspense>
      <Particles />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.75} luminanceThreshold={1} luminanceSmoothing={0.1} mipmapBlur radius={0.55} />
        <Noise opacity={0.035} premultiply blendFunction={BlendFunction.ADD} />
        <Vignette eskil={false} offset={0.25} darkness={0.8} />
      </EffectComposer>
    </>
  );
}

export default function ArmorScene({ raw, reduced }: { raw: MutableRefObject<number>; reduced: boolean }) {
  const progress = useRef(reduced ? 1 : raw.current);
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      camera={{ fov: FOV, near: 0.05, far: 40, position: [3, 1.6, 3] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <ArmorProvider progress={progress} reduced={reduced}>
        <Stage raw={raw} />
      </ArmorProvider>
    </Canvas>
  );
}
