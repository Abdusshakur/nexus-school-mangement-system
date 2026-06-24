import Navbar from "../common/Navbar";
import Hero from "../sections/Hero";
import ProblemStatement from "../sections/ProblemStatement";
import Features from "../sections/Features";
import ProductShowcase from "../sections/ProductShowcase";
import Benefits from "../sections/Benefits";
import Pricing from "../sections/Pricing";
import { FAQ } from "../sections/FAQ";
import CTA from "../sections/CTA";
import Footer from "../common/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-gray-800 overflow-x-hidden antialiased">
      <Navbar />
      <Hero />
      <ProblemStatement />
      <Features />
      <ProductShowcase />
      <Benefits />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      {/* <Contact /> */}
    </div>
  );
}
