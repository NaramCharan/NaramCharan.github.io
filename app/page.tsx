import IntroDashboard from "@/components/IntroDashboard";
import Navbar from "@/components/Navbar";
import DossierHologram from "@/components/DossierHologram";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import HowIThink from "@/components/HowIThink";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative">
        <IntroDashboard />
        <Projects />
        <Skills />
        <About />
        <HowIThink />
        <Contact />
      </main>
      {/* Projected by the navbar's RESUME button */}
      <DossierHologram />
    </>
  );
}
