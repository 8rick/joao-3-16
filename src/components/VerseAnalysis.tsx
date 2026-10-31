"use client";

import React from "react";
import { Heart, Gift, Users, Infinity, MessageSquareQuote, Compass } from "lucide-react";

const pillars = [
  {
    icon: Heart,
    title: "A Fonte",
    phrase: "Porque Deus amou o mundo...",
    description:
      "A iniciativa da salvação nunca partiu da humanidade, mas do próprio coração de Deus. Um amor universal, sem distinção de raça, classe social ou passado.",
    color: "from-rose-500/20 to-amber-500/10",
    iconColor: "text-rose-400"
  },
  {
    icon: Gift,
    title: "O Sacrifício",
    phrase: "...de tal maneira que deu o seu Filho...",
    description:
      "O amor bíblico não é apenas um sentimento, é uma ação tangível. Deus não poupou o que tinha de mais precioso: entregou Jesus como prova viva do Seu perdão.",
    color: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-400"
  },
  {
    icon: Users,
    title: "O Convite",
    phrase: "...para que todo aquele que nele crê...",
    description:
      "A salvação não é conquistada por mérito ou esforço religioso humano, mas recebida pela fé sincera. 'Todo aquele' significa que ninguém está excluído dessa oportunidade.",
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-cyan-400"
  },
  {
    icon: Infinity,
    title: "A Promessa",
    phrase: "...não pereça, mas tenha a vida eterna.",
    description:
      "O resgate de um destino de vazio e condenação para uma vida com propósito presente e plenitude eterna na presença do Criador.",
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400"
  }
];

export default function VerseAnalysis() {
  return (
    <section id="significado" className="w-full max-w-6xl mx-auto px-4 py-16">
      {/* Título da Seção */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-300 text-xs font-semibold mb-3">
          <Compass className="w-3.5 h-3.5" />
          Exegese & Significado
        </div>
        <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-slate-100">
          As 4 Chaves de João 3:16
        </h2>
        <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
          Martin Lutero chamava este versículo de <span className="text-amber-300 italic">"a Bíblia em miniatura"</span>,
          pois em apenas 27 palavras no original grego, toda a mensagem da redenção é revelada.
        </p>
      </div>

      {/* Cards dos 4 Pilares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 border border-slate-700/50 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">
                  {item.title}
                </span>
                <h3 className="font-serif-title text-lg font-bold text-slate-100 mt-1 mb-3">
                  {item.phrase}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                Pilar {idx + 1} de 4
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloco de Contexto Histórico: O Encontro com Nicodemos */}
      <div className="mt-16 rounded-3xl bg-slate-900/50 border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
          <MessageSquareQuote className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div>
          <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-amber-200">
            O Contexto: Uma conversa no silêncio da noite
          </h3>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Jesus pronunciou João 3:16 durante um encontro noturno e secreto com <strong>Nicodemos</strong>,
            um respeitado fariseu e mestre em Israel. Nicodemos compreendia que havia algo divino nos sinais de
            Jesus, mas foi confrontado com a verdade de que a religiosidade e as leis não bastavam:
            era necessário <span className="text-amber-300 font-semibold">"nascer de novo"</span> pelo Espírito Santo.
          </p>
          <p className="mt-2 text-slate-400 text-xs italic">
            "Importa-vos nascer de novo. O vento sopra onde quer, e ouves a sua voz, mas não sabes de onde vem, nem para onde vai..." — João 3:7-8
          </p>
        </div>
      </div>
    </section>
  );
}
