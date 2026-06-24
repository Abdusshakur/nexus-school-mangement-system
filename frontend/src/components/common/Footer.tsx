import { Mail } from "lucide-react";

import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";

import Logo from "../../assets/images/logo2.png";

export default function Footer() {
  const productLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Changelog", href: "#" },
    { name: "Roadmap", href: "#" },
  ];

  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "#" },
    { name: "Contact", href: "mailto:hello@nexusschool.io" },
    { name: "Status", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ];

  const currentYear: number = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="bg-[#0f111a] text-slate-400 font-inter animate-fade-in"
    >
      {/* Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand description details */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-6">
            <a href="#" className="flex items-center space-x-2 group">
              <img src={Logo} alt="Nexus Logo" />
            </a>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm text-left font-normal">
              School Management Simplified. Built for schools that care about
              efficiency.
            </p>

            {/* Social media links  */}
            <div className="flex items-center space-x-3 pt-3">
              <a
                href="#"
                id="social-X"
                aria-label="X link"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#6366F1] transition-colors"
              >
                <IconBrandX stroke={1.5} />
              </a>
              <a
                href="#"
                id="social-linkedin"
                aria-label="LinkedIn link"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#6366F1] transition-colors"
              >
                <IconBrandLinkedin stroke={1.5} />
              </a>
              <a
                href="#"
                id="social-facebook"
                aria-label="Facebook link"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#6366F1] transition-colors"
              >
                <IconBrandFacebook stroke={1.5} />
              </a>
            </div>
          </div>

          {/* Product list items */}
          <div className="col-span-1 lg:col-span-2 space-y-4 text-left">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              {productLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-all duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/*  Company list items */}
          <div className="col-span-1 lg:col-span-2 space-y-4 text-left">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-all duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support list items */}
          <div className="col-span-1 lg:col-span-4 space-y-4 text-left lg:pl-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-all duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        <p className="text-slate-500">
          &copy; {currentYear} Nexus Education Technologies. All rights
          reserved.
        </p>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href="mailto:hello@nexusschool.io"
            id="footer-email-link"
            className="flex items-center gap-1.5 font-bold hover:text-white transition-all duration-200"
          >
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>hello@nexusschool.io</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
