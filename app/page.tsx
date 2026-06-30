import DashboardIntro from "@/components/DashboardIntro";
import Navbar from "@/components/Navbar";
import HudFrame from "@/components/HudFrame";
import Hero from "@/components/Hero";
import ReactorBuild from "@/components/ReactorBuild";
import StatsBar from "@/components/StatsBar";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Blueprint from "@/components/Blueprint";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <DashboardIntro />
      <Navbar />
      <HudFrame />
      <main id="main">
        <Hero />
        <ReactorBuild />
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
