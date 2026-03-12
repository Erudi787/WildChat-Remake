"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Bell, Shield, Key } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
];

export default function SettingsNav() {
  const [activeSection, setActiveSection] = useState("profile");

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = document.getElementById("settings-content-area")?.scrollTop || 0;
      
      // Find the current section
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          
          // Add a little offset (e.g., 100px) so the nav highlights just before the section hits the top
          if (scrollPosition >= offsetTop - 100 && scrollPosition < offsetTop + height - 100) {
            setActiveSection(section.id);
          }
        }
      }
    };

    const scrollArea = document.getElementById("settings-content-area");
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      // Run once on mount to set initial state
      handleScroll();
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    const scrollArea = document.getElementById("settings-content-area");
    
    if (element && scrollArea) {
      scrollArea.scrollTo({
        top: element.offsetTop - 24, // 24px padding top
        behavior: "smooth"
      });
      // Optimistically set active section
      setActiveSection(id);
    }
  };

  return (
    <nav className="flex flex-col gap-2 relative">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        
        return (
          <Link
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => scrollToSection(e, section.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
              isActive 
                ? "text-primary-foreground font-medium shadow-sm translate-x-1" 
                : "text-muted-foreground hover:bg-white/10 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-1"
            }`}
          >
            {/* Active Indicator Background */}
            {isActive && (
              <motion.div
                layoutId="active-settings-nav"
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <section.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-sm" : ""}`} />
            <span className="relative z-10 tracking-wide">{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
