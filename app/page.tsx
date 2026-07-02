import IntroDashboard from "@/components/IntroDashboard";
import Navbar from "@/components/Navbar";
import HudFrame from "@/components/HudFrame";
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
      <main id="main">
        <IntroDashboard />
        <StatsBar />
        <Projects />
        <Skills />
        <Blueprint />
        <About />
        <Contact />
      </main>
    </>
  );
}
