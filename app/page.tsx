import IntroDashboard from "@/components/IntroDashboard";
import Navbar from "@/components/Navbar";
import HudFrame from "@/components/HudFrame";
import CircuitConduit from "@/components/CircuitConduit";
import HoloDossier from "@/components/HoloDossier";
import ResumeHologram from "@/components/ResumeHologram";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Blueprint from "@/components/Blueprint";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <HudFrame />
      {/* relative: the CircuitConduit positions itself against <main> */}
      <main id="main" className="relative">
        <IntroDashboard />
        <HoloDossier />
        <Projects />
        <Skills />
        <Blueprint />
        <About />
        <Contact />
        <CircuitConduit />
      </main>
      {/* Projected by the navbar's RESUME button and the dossier's Full Resume */}
      <ResumeHologram />
    </>
  );
}
