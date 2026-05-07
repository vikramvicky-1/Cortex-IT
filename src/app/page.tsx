import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import WhyUs from "@/components/WhyUs";
import HowWeWork from "@/components/HowWeWork";
import Partners from "@/components/Partners";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export const revalidate = 0; // Set to 0 to ensure immediate visibility of logo fixes

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Testimonials />
        <WhyUs />
        <HowWeWork />
        <Partners />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
