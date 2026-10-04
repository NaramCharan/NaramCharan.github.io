import type { Metadata } from "next";
import ArmorExperience from "@/components/armor/ArmorExperience";

export const metadata: Metadata = {
  title: "Project Aegis — Armor Assembly Sequence",
  description:
    "A scroll-driven 3D armor assembly sequence — hundreds of plates locking into place — built with React Three Fiber and GSAP ScrollTrigger.",
  alternates: { canonical: "/armor/" },
};

export default function ArmorPage() {
  return <ArmorExperience />;
}
