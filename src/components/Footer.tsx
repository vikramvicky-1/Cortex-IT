"use client";

import { useState } from "react";
import Link from "next/link";

const mainPages = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Projects", href: "/#projects" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/#contact" },
];

const caseStudies = [
  { name: "Daily Docket", href: "/case-study/dailydocket" },
  { name: "SGS Laser", href: "/case-study/sgs-laser" },
  { name: "Humanity Calls", href: "/case-study/humanity-calls" },
  { name: "BUC India", href: "/case-study/buc-india" },
];

const services = [
  { name: "App Development", href: "/#services" },
  { name: "Web Development", href: "/#services" },
  { name: "UI/UX Design", href: "/#services" },
  { name: "Chatbot Building", href: "/#services" },
  { name: "SEO Optimization", href: "/#services" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 4000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 relative z-10 w-full overflow-hidden">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-heading font-bold text-xl md:text-2xl text-white leading-tight mb-6">
              Sign up for our<br />newsletter today.
            </h3>
            <form onSubmit={handleSubscribe} className="flex gap-0 mb-3" suppressHydrationWarning>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
                placeholder="Your email"
                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-l-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C8F542]/50 transition-colors"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="bg-[#C8F542] text-black font-medium text-sm px-6 py-3 rounded-r-lg hover:shadow-[0_0_15px_rgba(200,245,66,0.3)] transition-all duration-300 shrink-0"
              >
                {subscribed ? "✓" : "Subscribe"}
              </button>
            </form>
            <p className="text-gray-500 text-xs font-light">
              No spam, Just valued update.
            </p>
          </div>

          {/* Main Pages */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-heading font-bold text-xs text-white tracking-widest uppercase mb-6">
              Main Pages
            </h4>
            <ul className="space-y-3">
              {mainPages.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#C8F542] text-sm font-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Case Studies */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-xs text-white tracking-widest uppercase mb-6">
              Case Studies
            </h4>
            <ul className="space-y-3">
              {caseStudies.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#C8F542] text-sm font-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-xs text-white tracking-widest uppercase mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#C8F542] text-sm font-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-xs text-white tracking-widest uppercase mb-6">
              Connect
            </h4>
            <div className="flex flex-row gap-4">
              {/* Instagram */}
              <span role="link" tabIndex={0} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C8F542] hover:border-[#C8F542]/30 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </span>
              {/* X / Twitter */}
              <span role="link" tabIndex={0} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C8F542] hover:border-[#C8F542]/30 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </span>
              {/* LinkedIn */}
              <span role="link" tabIndex={0} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C8F542] hover:border-[#C8F542]/30 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-gray-500 hover:text-gray-300 text-xs font-light transition-colors cursor-pointer">
            Privacy policy
          </span>
          <span className="text-gray-500 hover:text-gray-300 text-xs font-light transition-colors cursor-pointer">
            Terms of Use
          </span>
        </div>
      </div>
    </footer>
  );
}
