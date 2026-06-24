import { useState, useEffect } from "react";
import Logo from "../../assets/images/logo.png";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "CTA", href: "#cta" },
  ];

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-inter ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="relative w-28 h-10 transition-transform ">
            <Link to="/">
              <img
                src={Logo}
                alt="Nexus Logo"
                className="w-full h-full object-contain"
              />
            </Link>
          </div>

          {/* Desktop screen */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                id={`nav-link-${item.name.toLowerCase()}`}
                className="text-slate-600 hover:text-indigo-500 font-medium text-sm transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-5">
            <Link
              to="/login"
              id="nav-btn-login"
              className="text-slate-600 hover:text-indigo-500 font-medium text-sm transition-colors duration-200 px-3 py-2"
            >
              Login
            </Link>
            <a
              href="#pricing"
              id="nav-btn-get-started"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-indigo-500/10 hover:shadow-indigo-600/20 active:scale-98 transition-all duration-200"
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              id="mobile-menu-toggle"
              aria-label="Toggle Menu"
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none transition-colors duration-200"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-navigation"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-slate-100 ${
          isOpen
            ? "max-h-screen py-4 opacity-100"
            : "max-h-0 py-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              id={`mobile-nav-link-${item.name.toLowerCase()}`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-slate-700 hover:text-indigo-500 hover:bg-indigo-50 font-medium text-base transition-colors duration-200"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3 px-4">
            <a
              href="/login"
              id="mobile-nav-btn-login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center py-2.5 rounded-xl text-slate-700 hover:text-indigo-500 font-medium text-base hover:bg-indigo-50"
            >
              Login
            </a>
            <a
              href="#pricing"
              id="mobile-nav-btn-get-started"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center bg-indigo-500 text-white py-3 rounded-xl font-medium text-base shadow-md shadow-indigo-500/20 hover:bg-indigo-600 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
