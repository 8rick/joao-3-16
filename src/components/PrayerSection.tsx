"use client";

import React, { useState } from "react";
import { Sparkles, Heart, CheckCircle2, Send } from "lucide-react";

export default function PrayerSection() {
  const [prayed, setPrayed] = useState<boolean>(false);
  const [prayerRequest, setPrayerRequest] = useState<string>("");
  const [sentRequest, setSentRequest] = useState<boolean>(false);

  const handleMakePrayer = () => {
    setPrayed(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerRequest.trim()) return;
    setSentRequest(true);
    setPrayerRequest("");
    setTimeout(() => {
      setSentRequest(false);
    }, 5000);
  };

  return (
    <section id="oracao" className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/30 p-8 sm:p-12 shadow-2xl overflow-hidden">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Um Momento com Deus
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-100">
            Uma Oração de Resposta a João 3:16
          </h2>
          <p className="mt-2 text-slate-400 text-xs sm:text-sm">
            Se a mensagem do amor de Deus tocou seu coração, faça esta simples oração com sinceridade.
          </p>
        </div>

        {/* Texto da Oração */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 text-slate-300 font-serif-title text-base sm:text-lg leading-relaxed text-center italic">
          “Senhor Deus, hoje eu compreendi o quanto fui amado por Ti. Obrigado por ter entregue
          Teu Filho Jesus para perdoar os meus pecados e me conceder a vida eterna. Eu recebo essa
          graça no meu coração e decido colocar a minha fé e a minha confiança em Ti. Ensina-me a
          viver segundo o Teu propósito a cada dia. Amém.”
        </div>

        {/* Botão de Confirmação */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleMakePrayer}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition shadow-lg ${
              prayed
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400"
            }`}
          >
            {prayed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Oração Realizada no Coração! Glória a Deus!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Fiz esta oração hoje</span>
              </>
            )}
          </button>
        </div>

        {/* Caixa de Pedido de Reflexão / Oração */}
        <div className="border-t border-slate-800 pt-8 max-w-lg mx-auto">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-center mb-3">
            Deseja deixar um motivo de oração ou reflexão?
          </h4>
          <form onSubmit={handleSubmitRequest} className="space-y-3">
            <textarea
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              placeholder="Escreva aqui seu pedido ou pensamento..."
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Seu relato é confidencial e pessoal.
              </span>
              <button
                type="submit"
                disabled={!prayerRequest.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </form>

          {sentRequest && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs text-center">
              Recebido! Que a paz que excede todo o entendimento guarde o seu coração.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
