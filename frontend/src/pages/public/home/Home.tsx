import Navbar from "../../../components/common/Navbar";
import Hero from "../../../components/home/Hero";
import ProblemStatement from "../../../components/home/ProblemStatement";
import Features from "../../../components/home/Features";
import ProductShowcase from "../../../components/home/ProductShowcase";
import Benefits from "../../../components/home/Benefits";
import Pricing from "../../../components/home/Pricing";
import { FAQ } from "../../../components/home/FAQ";
import CTA from "../../../components/home/CTA";
import Footer from "../../../components/common/Footer";

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
