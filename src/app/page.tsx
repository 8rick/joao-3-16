"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import VerseViewer from "@/components/VerseViewer";
import VerseAnalysis from "@/components/VerseAnalysis";
import PrayerSection from "@/components/PrayerSection";
import Footer from "@/components/Footer";
import ConsentLocationModal from "@/components/ConsentLocationModal";
import MarketingDashboardModal from "@/components/MarketingDashboardModal";

export default function Home() {
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Barra de Navegação */}
      <Navbar onOpenDashboard={() => setIsDashboardOpen(true)} />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col items-center">
        {/* Cabeçalho Hero */}
        <div className="w-full max-w-4xl mx-auto px-4 pt-12 sm:pt-16 pb-4 text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Evangelho Segundo São João
          </span>
          <h1 className="font-serif-title text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-100 mt-5 mb-4 tracking-tight">
            A Maior Declaração de <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              Amor da História
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Descubra as profundas verdades contidas no versículo mais memorável e transformador
            de toda a literatura bíblica.
          </p>
        </div>

        {/* Visualizador do Versículo Interativo */}
        <VerseViewer />

        {/* Análise Exegética das 4 Chaves */}
        <VerseAnalysis />

        {/* Seção de Oração & Reflexão */}
        <PrayerSection />
      </main>

      {/* Rodapé */}
      <Footer />

      {/* Modal e Banner de Consentimento de Localização */}
      <ConsentLocationModal onOpenDashboard={() => setIsDashboardOpen(true)} />

      {/* Painel de Métricas de Marketing */}
      <MarketingDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </div>
  );
}
