"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import ArmorModel from "./ArmorModel";
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
    // ~80% of the viewport height; 76% on portrait so the title clears the helmet.
    const fill = aspect < 0.8 ? 0.76 : 0.8;
    const byHeight = (BODY.height / fill) / 2 / tanHalf;
    const byWidth = 0.95 / 2 / (tanHalf * aspect); // arms + margin
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
      a[i * 3 + 1] = rnd() * 3.6;
      a[i * 3 + 2] = (rnd() - 0.6) * 6;
    }
    return a;
  }, [count]);
  useFrame((_, dt) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y += dt * 0.012;
    ref.current.position.y = (ref.current.position.y + dt * 0.03) % 0.4;
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

/** Fake volumetric shaft from above + a halo wall behind the armor. */
function Volumetrics() {
  const { progressRef } = useArmor();
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (beam.current) beam.current.opacity = 0.006 + progressRef.current * 0.01;
  });
  return (
    <>
      <mesh position={[0, 2.3, -0.3]}>
        <coneGeometry args={[0.95, 4.6, 48, 1, true]} />
        <meshBasicMaterial ref={beam} color="#bfe6ff" transparent opacity={0.006} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

function Stage({ raw }: { raw: MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#030405"]} />
      <fog attach="fog" args={["#030405", 6, 14]} />
      <ProgressDriver raw={raw} />
      <CameraRig />

      <ambientLight intensity={0.08} />
      {/* key — warm, high front-left, casts the shadows */}
      <directionalLight
        position={[2.2, 4.2, 3.6]}
        intensity={2.2}
        color="#fff1e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-1.5}
        shadow-camera-right={1.5}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-0.4}
      />
      {/* rims — cool from back-left, warm from back-right: the silhouette */}
      <directionalLight position={[-3.5, 2.8, -3.2]} intensity={3.2} color="#8fd6ff" />
      <directionalLight position={[3.4, 2.0, -3.0]} intensity={2.4} color="#ffad7a" />
      <spotLight position={[0, 4.6, 0.4]} angle={0.3} penumbra={0.85} intensity={9} color="#dfefff" distance={7} decay={2} />

      {/* studio reflections for the metal — framed lightformers, no HDR fetch */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 4, 2]} scale={[6, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.1} color="#ffd9b0" position={[-4, 1.5, 1]} scale={[2, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} color="#e6eeff" position={[4, 1.5, -1]} scale={[2, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={0.5} color="#ffffff" position={[0, 1, 5]} scale={2} />
      </Environment>

      <ArmorModel />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial color="#030304" metalness={0} roughness={0.92} envMapIntensity={0} />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} scale={3} blur={2.2} far={1.4} opacity={0.75} resolution={512} />
      <Particles />
      <Volumetrics />

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
      shadows
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
