import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

// Backup assíncrono em arquivo JSON local para persistência redundante
async function backupMetricToFile(metric: LocationMetric): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let currentMetrics: LocationMetric[] = [];
    try {
      const content = await fs.readFile(METRICS_FILE, "utf-8");
      currentMetrics = JSON.parse(content);
    } catch {
      currentMetrics = [];
    }
    currentMetrics.push(metric);
    const trimmed = currentMetrics.length > 500 ? currentMetrics.slice(-500) : currentMetrics;
    await fs.writeFile(METRICS_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.warn("Aviso ao salvar backup local em metrics.json:", err);
  }
}

export async function GET() {
  try {
    const [totalCount, grantedCount, deniedCount, recentDbRecords] = await Promise.all([
      prisma.locationMetric.count(),
      prisma.locationMetric.count({ where: { status: "granted" } }),
      prisma.locationMetric.count({ where: { status: "denied" } }),
      prisma.locationMetric.findMany({
        take: 50,
        orderBy: { timestamp: "desc" },
      }),
    ]);

    const recentMetrics: LocationMetric[] = recentDbRecords.map((m) => ({
      id: m.id,
      timestamp: m.timestamp.toISOString(),
      latitude: m.latitude,
      longitude: m.longitude,
      accuracy: m.accuracy,
      status: m.status === "granted" ? "granted" : "denied",
      cityEstimate: m.cityEstimate ?? undefined,
      userAgent: m.userAgent ?? undefined,
    }));

    return NextResponse.json({
      success: true,
      totalCount,
      grantedCount,
      deniedCount,
      recentMetrics,
      storageType: "Neon DB PostgreSQL (Prisma ORM)",
    });
  } catch (error) {
    console.error("Erro ao consultar métricas no Neon DB:", error);

    // Fallback de contingência caso ocorra falha de rede temporária com o banco
    try {
      const content = await fs.readFile(METRICS_FILE, "utf-8");
      const fallbackMetrics: LocationMetric[] = JSON.parse(content);
      return NextResponse.json({
        success: true,
        totalCount: fallbackMetrics.length,
        grantedCount: fallbackMetrics.filter((m) => m.status === "granted").length,
        deniedCount: fallbackMetrics.filter((m) => m.status === "denied").length,
        recentMetrics: fallbackMetrics.slice(-50).reverse(),
        storageType: "Fallback Local JSON (Neon Offline)",
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Falha ao ler métricas do banco de dados Neon" },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, accuracy, status } = body;

    const parsedLatitude = typeof latitude === "number" ? Number(latitude.toFixed(4)) : null;
    const parsedLongitude = typeof longitude === "number" ? Number(longitude.toFixed(4)) : null;
    const parsedAccuracy = typeof accuracy === "number" ? Math.round(accuracy) : null;
    const metricStatus: "granted" | "denied" = status === "granted" ? "granted" : "denied";
    const userAgent = request.headers.get("user-agent") || "Desconhecido";
    let cityEstimate: string | undefined = undefined;

    // Identificar cidade aproximada via OpenStreetMap Nominatim se tiver coordenadas válidas
    if (parsedLatitude !== null && parsedLongitude !== null && metricStatus === "granted") {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${parsedLatitude}&lon=${parsedLongitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              "User-Agent": "Joao316-MarketingMetrics/1.0",
            },
            next: { revalidate: 3600 },
          }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.municipality ||
            geoData.address?.state_district;
          const state = geoData.address?.state;
          const country = geoData.address?.country;
          cityEstimate = [city, state, country].filter(Boolean).join(", ");
        }
      } catch {
        cityEstimate = "Coordenadas salvas";
      }
    }

    // Salvar no Neon DB via Prisma
    const savedRecord = await prisma.locationMetric.create({
      data: {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        accuracy: parsedAccuracy,
        status: metricStatus,
        cityEstimate: cityEstimate ?? null,
        userAgent: userAgent.slice(0, 500),
      },
    });

    const responseMetric: LocationMetric = {
      id: savedRecord.id,
      timestamp: savedRecord.timestamp.toISOString(),
      latitude: savedRecord.latitude,
      longitude: savedRecord.longitude,
      accuracy: savedRecord.accuracy,
      status: savedRecord.status === "granted" ? "granted" : "denied",
      cityEstimate: savedRecord.cityEstimate ?? undefined,
      userAgent: savedRecord.userAgent ?? undefined,
    };

    // Atualizar backup local silenciosamente
    backupMetricToFile(responseMetric);

    return NextResponse.json({
      success: true,
      message: "Métrica salva com sucesso no banco de dados Neon.",
      data: responseMetric,
      storageType: "Neon DB PostgreSQL (Prisma ORM)",
    });
  } catch (error) {
    console.error("Erro ao salvar métrica no banco de dados Neon:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao gravar métrica no banco de dados Neon" },
      { status: 500 }
    );
  }
}
