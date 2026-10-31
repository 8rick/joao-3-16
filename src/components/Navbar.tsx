"use client";

import React from "react";
import { BookOpen, BarChart3, Heart } from "lucide-react";

interface NavbarProps {
  onOpenDashboard: () => void;
}

export default function Navbar({ onOpenDashboard }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Título */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif-title font-bold text-base sm:text-lg text-slate-100 group-hover:text-amber-200 transition">
              João 3:16
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              O Evangelho em Miniatura
            </span>
          </div>
        </a>

        {/* Links de navegação e Ações */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-medium text-slate-300">
          <a href="#significado" className="hover:text-amber-300 transition hidden sm:inline">
            Significado
          </a>
          <a href="#oracao" className="hover:text-amber-300 transition hidden sm:inline">
            Oração
          </a>
        </nav>
      </div>
    </header>
  );
}
