import React from "react";
import Navbar from "../common/Navbar";
import Hero from "../sections/Hero";
import ProblemStatement from "../sections/ProblemStatement";
import Features from "../sections/Features";
import ProductShowcase from "../sections/ProductShowcase";
import Benefits from "../sections/Benefits";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-gray-800 overflow-x-hidden antialiased">
      <Navbar />
      <Hero />
      <ProblemStatement />
      <Features />
      <ProductShowcase />
      <Benefits />
    </div>
  );
}
