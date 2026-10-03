"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";

/**
 * GLB replacement path for the procedural placeholder rig.
 *
 * Export one node per armor component from your DCC tool, named exactly as
 * the <Part id> it replaces ("helmet_back", "faceplate", "chest_l",
 * "forearm_r", "finger_2_l", … — see ArmorModel.tsx), modelled in that
 * part's FINAL docked pose in the bone's local space. Then:
 *
 *   const assets = useArmorAssets("/models/aegis.glb");
 *   <ArmorProvider assets={assets} …>
 *
 * Any id present in the file replaces the procedural geometry and inherits
 * its scroll window and fly-in; ids not present keep the placeholder, so a
 * model can be swapped in piece by piece. Only use assets you have a licence
 * for.
 */
export function useArmorAssets(url: string) {
  const { nodes } = useGLTF(url);
  return useMemo(() => {
    const map: Record<string, THREE.Object3D> = {};
    for (const [name, node] of Object.entries(nodes)) map[name] = node;
    return map;
  }, [nodes]);
}
