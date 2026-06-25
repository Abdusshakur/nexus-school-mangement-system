import Navbar from "../../common/Navbar";
import Hero from "../../home/sections/Hero";
import ProblemStatement from "../../home/sections/ProblemStatement";
import Features from "../../home/sections/Features";
import ProductShowcase from "../../home/sections/ProductShowcase";
import Benefits from "../../home/sections/Benefits";
import Pricing from "../../home/sections/Pricing";
import { FAQ } from "../../home/sections/FAQ";
import CTA from "../../home/sections/CTA";
import Footer from "../../common/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-slate-800 overflow-x-hidden ">
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
    </div>
  );
}
