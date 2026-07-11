import IntroDashboard from "@/components/IntroDashboard";
import Navbar from "@/components/Navbar";
import HudFrame from "@/components/HudFrame";
import CircuitConduit from "@/components/CircuitConduit";
import StatsBar from "@/components/StatsBar";
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
        <StatsBar />
        <Projects />
        <Skills />
        <Blueprint />
        <About />
        <Contact />
        <CircuitConduit />
      </main>
    </>
  );
}
