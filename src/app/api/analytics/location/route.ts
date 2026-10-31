import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export interface LocationMetric {
  id: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: "granted" | "denied";
  cityEstimate?: string;
  userAgent?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");

// Função auxiliar para carregar métricas salvas em disco
async function readMetricsFromFile(): Promise<LocationMetric[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(METRICS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    // Se o arquivo não existir ainda, inicializa com array padrão
    const initialData: LocationMetric[] = [];
    try {
      await fs.writeFile(METRICS_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    } catch {
      // ignore
    }
    return initialData;
  }
}

// Função auxiliar para persistir métricas em disco
async function saveMetricsToFile(metrics: LocationMetric[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(METRICS_FILE, JSON.stringify(metrics, null, 2), "utf-8");
}

export async function GET() {
  try {
    const metricsLog = await readMetricsFromFile();
    return NextResponse.json({
      success: true,
      totalCount: metricsLog.length,
      grantedCount: metricsLog.filter((m) => m.status === "granted").length,
      deniedCount: metricsLog.filter((m) => m.status === "denied").length,
      recentMetrics: metricsLog.slice(-50).reverse(),
      storageType: "Arquivo JSON persistente (data/metrics.json)"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Falha ao ler métricas do arquivo" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, accuracy, status } = body;

    const newMetric: LocationMetric = {
      id: "metric_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      latitude: typeof latitude === "number" ? Number(latitude.toFixed(4)) : null,
      longitude: typeof longitude === "number" ? Number(longitude.toFixed(4)) : null,
      accuracy: typeof accuracy === "number" ? Math.round(accuracy) : null,
      status: status === "granted" ? "granted" : "denied",
      userAgent: request.headers.get("user-agent") || "Desconhecido"
    };

    // Identificar cidade aproximada via OpenStreetMap Nominatim se tiver coordenadas
    if (newMetric.latitude && newMetric.longitude && newMetric.status === "granted") {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newMetric.latitude}&lon=${newMetric.longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              "User-Agent": "Joao316-MarketingMetrics/1.0"
            },
            next: { revalidate: 3600 }
          }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.municipality || geoData.address?.state_district;
          const state = geoData.address?.state;
          const country = geoData.address?.country;
          newMetric.cityEstimate = [city, state, country].filter(Boolean).join(", ");
        }
      } catch {
        newMetric.cityEstimate = "Coordenadas salvas";
      }
    }

    const currentMetrics = await readMetricsFromFile();
    currentMetrics.push(newMetric);

    // Manter até os últimos 500 registros para controle
    const trimmedMetrics = currentMetrics.length > 500 ? currentMetrics.slice(-500) : currentMetrics;
    await saveMetricsToFile(trimmedMetrics);

    return NextResponse.json({
      success: true,
      message: "Métrica salva com sucesso no arquivo JSON persistente.",
      data: newMetric
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Falha ao gravar métrica no arquivo" },
      { status: 500 }
    );
  }
}
