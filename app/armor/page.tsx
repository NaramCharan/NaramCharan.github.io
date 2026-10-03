import type { Metadata } from "next";
import ArmorExperience from "@/components/armor/ArmorExperience";

export const metadata: Metadata = {
  title: "Project Aegis — Helmet Assembly Sequence",
  description:
    "A scroll-driven 3D armored-helmet assembly sequence, built with React Three Fiber and GSAP ScrollTrigger.",
  alternates: { canonical: "/armor/" },
};

export default function ArmorPage() {
  return <ArmorExperience />;
}
