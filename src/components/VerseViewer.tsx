"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  Sparkles,
  BookOpen,
  Heart
} from "lucide-react";

interface Translation {
  key: string;
  name: string;
  tag: string;
  text: string;
  reference: string;
  lang: string;
}

const translations: Translation[] = [
  {
    key: "acf",
    name: "Almeida Corrigida Fiel",
    tag: "ACF",
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    reference: "João 3:16 (ACF)",
    lang: "pt-BR"
  },
  {
    key: "nvi",
    name: "Nova Versão Internacional",
    tag: "NVI",
    text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
    reference: "João 3:16 (NVI)",
    lang: "pt-BR"
  },
  {
    key: "nvt",
    name: "Nova Versão Transformadora",
    tag: "NVT",
    text: "Porque Deus amou tanto o mundo que deu seu Filho único, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
    reference: "João 3:16 (NVT)",
    lang: "pt-BR"
  },
  {
    key: "kjv",
    name: "King James Version",
    tag: "KJV",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    reference: "John 3:16 (KJV)",
    lang: "en-US"
  }
];

export default function VerseViewer() {
  const [selectedKey, setSelectedKey] = useState<string>("acf");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const current = translations.find((t) => t.key === selectedKey) || translations[0];

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não suporta leitura em voz alta.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Parar falas anteriores
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = current.lang;
    utterance.rate = 0.9; // Levemente mais pausado e solene
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${current.text}" — ${current.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const textToShare = encodeURIComponent(
      `📖 "${current.text}" — ${current.reference}\n\nConheça mais sobre essa passagem de esperança!`
    );
    window.open(`https://api.whatsapp.com/send?text=${textToShare}`, "_blank");
  };

  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 py-12">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cartão Principal do Versículo */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/30 p-8 sm:p-12 shadow-2xl backdrop-blur-xl gold-border-glow">
        {/* Distintivo Superior */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            O Resumo do Evangelho
          </div>

          {/* Seletor de Versão Bíblica */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {translations.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedKey(item.key);
                  if (isPlaying) {
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedKey === item.key
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {item.tag}
              </button>
            ))}
          </div>
        </div>

        {/* Citação Solene */}
        <div className="relative my-6 text-center">
          <span className="font-serif-title text-6xl text-amber-500/20 absolute -top-10 left-0 select-none">
            “
          </span>
          <p className="font-serif-title text-2xl sm:text-3xl md:text-4xl text-amber-100/95 leading-relaxed sm:leading-loose tracking-wide gold-glow px-4">
            {current.text}
          </p>
          <span className="font-serif-title text-6xl text-amber-500/20 absolute -bottom-12 right-0 select-none">
            ”
          </span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-amber-400/90">
          <BookOpen className="w-4 h-4" />
          <span>{current.reference}</span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">{current.name}</span>
        </div>

        {/* Botões de Ação */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3">
          {/* Botão de Áudio */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm ${
              isPlaying
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40"
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>Pausar Leitura</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Ouvir Versículo</span>
              </>
            )}
          </button>

          {/* Botão Copiar */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Citação</span>
              </>
            )}
          </button>

          {/* Botão WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Compartilhar no WhatsApp</span>
          </button>
        </div>
      </div>
    </section>
  );
}
