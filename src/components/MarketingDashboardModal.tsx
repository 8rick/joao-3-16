"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  MapPin,
  CheckCircle,
  XCircle,
  BarChart,
  Shield,
  Clock,
  Navigation
} from "lucide-react";
import type { LocationMetric } from "../app/api/analytics/location/route";

interface MarketingDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MarketingDashboardModal({
  isOpen,
  onClose
}: MarketingDashboardModalProps) {
  const [metrics, setMetrics] = useState<LocationMetric[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [granted, setGranted] = useState<number>(0);
  const [denied, setDenied] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analytics/location");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.recentMetrics || []);
        setTotal(data.totalCount || 0);
        setGranted(data.grantedCount || 0);
        setDenied(data.deniedCount || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar métricas de marketing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const consentRate = total > 0 ? Math.round((granted / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <BarChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-amber-200">
                Painel de Controle de Marketing
              </h2>
              <p className="text-xs text-slate-400">
                Métricas de alcance regional e consentimento em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              disabled={isLoading}
              title="Atualizar dados"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resumo de Indicadores */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-800 bg-slate-900/60">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total de Acessos</p>
              <p className="text-2xl font-bold text-slate-100">{total}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Consentimento Aceito</p>
              <p className="text-2xl font-bold text-emerald-400">
                {granted}{" "}
                <span className="text-xs font-normal text-slate-400">({consentRate}%)</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Recusados (Opt-out)</p>
              <p className="text-2xl font-bold text-rose-400">{denied}</p>
            </div>
          </div>
        </div>

        {/* Lista de Registros Recentes */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>ÚLTIMAS VISITAS REGISTRADAS</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Shield className="w-3.5 h-3.5 text-amber-500/80" /> Dados anonimizados
            </span>
          </div>

          {metrics.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhuma métrica registrada ainda.
            </div>
          ) : (
            metrics.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      item.status === "granted"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">
                      {item.status === "granted"
                        ? item.cityEstimate || `Lat: ${item.latitude}, Lon: ${item.longitude}`
                        : "Usuário optou por não compartilhar localização"}
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleString("pt-BR")}</span>
                      {item.accuracy && (
                        <span>• Precisão aprox: ~{item.accuracy}m</span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-medium text-[11px] ${
                    item.status === "granted"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {item.status === "granted" ? "Autorizado" : "Recusado"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Rodapé explicativo */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            As localizações exatas exigem autorização via diálogo de permissão do navegador.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 transition text-xs"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
