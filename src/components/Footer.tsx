import React from "react";
import { Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="font-serif-title font-semibold text-slate-300">
            João 3:16 — A Palavra da Vida
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> para edificação
          </span>
        </div>
      </div>
    </footer>
  );
}
