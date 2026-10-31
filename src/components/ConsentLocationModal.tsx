"use client";

import React, { useState, useEffect } from "react";
import { MapPin, ShieldCheck, X, CheckCircle2, AlertCircle, BarChart3, Globe, Cookie } from "lucide-react";

interface ConsentLocationModalProps {
  onOpenDashboard: () => void;
}

export default function ConsentLocationModal({ onOpenDashboard }: ConsentLocationModalProps) {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [locationInfo, setLocationInfo] = useState<{
    latitude?: number;
    longitude?: number;
    city?: string;
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  useEffect(() => {
    // Verificar se já houve uma decisão prévia salva
    const savedConsent = localStorage.getItem("joao316_location_consent");
    if (!savedConsent) {
      // Mostrar banner com um leve atraso para uma experiência suave
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (savedConsent === "granted") {
      setStatus("granted");
      const savedInfo = localStorage.getItem("joao316_user_location_info");
      if (savedInfo) {
        try {
          setLocationInfo(JSON.parse(savedInfo));
        } catch {
          // ignore error
        }
      }
    } else {
      setStatus("denied");
    }
  }, []);


  const handleGrant = async () => {
    try {
      const res = await fetch("/api/analytics/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await res.json();

      if (result.success) {
        setLocationInfo({
          latitude: result.data.latitude,
          longitude: result.data.longitude,
          city: result.data.city
            ? `${result.data.city}, ${result.data.region || ""}`
            : "Localização aproximada indisponível",
        });
        setShowBanner(false);
      }
    } catch (error) {
      console.error("Erro ao registrar localização:", error);
    }
  };


  const handleDeny = async () => {
    setStatus("denied");
    localStorage.setItem("joao316_location_consent", "denied");
    setFeedbackMessage("Você optou por não compartilhar sua localização. Respeitamos sua escolha!");

    try {
      await fetch("/api/analytics/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "denied"
        })
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setShowBanner(false);
    }, 2000);
  };

  return (
    <>
      {/* Modal / Banner de Consentimento */}
      {showBanner && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 overflow-hidden">
            {/* Decoração superior */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Cookie className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-title text-lg font-semibold text-amber-200">
                    Aceita nossos cookies
                  </h3>
                </div>
              </div>

              <button
                onClick={handleGrant}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              <span>Ajude-nos a tornar sua experiência mais relevante.</span>
            </p>
            {feedbackMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${status === "granted"
                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                    : status === "requesting"
                      ? "bg-amber-950/60 border border-amber-500/40 text-amber-200"
                      : "bg-slate-800 border border-slate-700 text-slate-300"
                  }`}
              >
                {status === "granted" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                )}
                <span>{feedbackMessage}</span>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGrant}
                disabled={status === "requesting"}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
              >
                Não, obrigado
              </button>

              <button
                type="button"
                onClick={handleGrant}
                disabled={status === "requesting" || status === "granted"}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Cookie className="w-4 h-4" />
                {status === "requesting"
                  ? "Solicitando..."
                  : status === "granted"
                    ? "Autorizado!"
                    : "Aceitar Cookies"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
