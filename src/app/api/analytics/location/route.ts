
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
  status: "granted" | "denied" | "not_requested";
  cityEstimate?: string;
  userAgent?: string;
  ip?: string;
  provider?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");

// Backup local JSON
async function backupMetricToFile(
  metric: LocationMetric
): Promise<void> {
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

    const trimmed =
      currentMetrics.length > 500
        ? currentMetrics.slice(-500)
        : currentMetrics;

    await fs.writeFile(
      METRICS_FILE,
      JSON.stringify(trimmed, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn(
      "Aviso ao salvar backup local em metrics.json:",
      err
    );
  }
}

// GET - Consultar métricas
export async function GET() {
  try {
    const [
      totalCount,
      grantedCount,
      deniedCount,
      notRequestedCount,
      recentDbRecords,
    ] = await Promise.all([
      prisma.locationMetric.count(),

      prisma.locationMetric.count({
        where: { status: "granted" },
      }),

      prisma.locationMetric.count({
        where: { status: "denied" },
      }),

      prisma.locationMetric.count({
        where: { status: "not_requested" },
      }),

      prisma.locationMetric.findMany({
        take: 50,
        orderBy: { timestamp: "desc" },
      }),
    ]);

    const recentMetrics: LocationMetric[] =
      recentDbRecords.map((m) => ({
        id: m.id,
        timestamp: m.timestamp.toISOString(),
        latitude: m.latitude,
        longitude: m.longitude,
        accuracy: m.accuracy,
        status: m.status as LocationMetric["status"],
        cityEstimate: m.cityEstimate ?? undefined,
        userAgent: m.userAgent ?? undefined,
        ip: m.ip ?? undefined,
        provider: m.provider ?? undefined,
      }));

    return NextResponse.json({
      success: true,
      totalCount,
      grantedCount,
      deniedCount,
      notRequestedCount,
      recentMetrics,
      storageType: "Neon DB PostgreSQL (Prisma ORM)",
    });
  } catch (error) {
    console.error(
      "Erro ao consultar métricas no Neon DB:",
      error
    );

    // Fallback JSON
    try {
      const content = await fs.readFile(
        METRICS_FILE,
        "utf-8"
      );

      const fallbackMetrics: LocationMetric[] =
        JSON.parse(content);

      return NextResponse.json({
        success: true,
        totalCount: fallbackMetrics.length,

        grantedCount: fallbackMetrics.filter(
          (m) => m.status === "granted"
        ).length,

        deniedCount: fallbackMetrics.filter(
          (m) => m.status === "denied"
        ).length,

        notRequestedCount: fallbackMetrics.filter(
          (m) => m.status === "not_requested"
        ).length,

        recentMetrics: fallbackMetrics
          .slice(-50)
          .reverse(),

        storageType: "Fallback Local JSON (Neon Offline)",
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Falha ao ler métricas do banco de dados Neon",
        },
        { status: 500 }
      );
    }
  }
}

// POST - Registrar métrica por IP
export async function POST(request: Request) {
  try {
    const userAgent =
      request.headers.get("user-agent") ||
      "Desconhecido";

    // IP recebido do proxy
    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const realIp =
      request.headers.get("x-real-ip");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      null;

    let cityEstimate: string | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;
    let region: string | null = null;
    let country: string | null = null;
    let provider: string | null = null;

    // Consultar geolocalização aproximada por IP
    if (ip) {
      try {
        const geoRes = await fetch(
          `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,lat,lon,isp`,
          {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
          }
        );

        if (geoRes.ok) {
          const geoData = await geoRes.json();

          if (geoData.status === "success") {
            cityEstimate = geoData.city || null;
            region = geoData.regionName || null;
            country = geoData.country || null;
            provider = geoData.isp || null;

            latitude =
              typeof geoData.lat === "number"
                ? geoData.lat
                : null;

            longitude =
              typeof geoData.lon === "number"
                ? geoData.lon
                : null;
          }
        }
      } catch (error) {
        console.error(
          "Erro na geolocalização por IP:",
          error
        );
      }
    }

    // Registrar sem afirmar que houve recusa de GPS
    const savedRecord =
      await prisma.locationMetric.create({
        data: {
          latitude,
          longitude,
          accuracy: null,
          status: "not_requested",

          cityEstimate: cityEstimate
            ? [cityEstimate, region, country]
                .filter(Boolean)
                .join(", ")
            : null,

          userAgent: userAgent.slice(0, 500),
          ip,
          provider,
        },
      });

    // Montar objeto de resposta
    const responseMetric: LocationMetric = {
      id: savedRecord.id,
      timestamp: savedRecord.timestamp.toISOString(),
      latitude: savedRecord.latitude,
      longitude: savedRecord.longitude,
      accuracy: savedRecord.accuracy,
      status: "not_requested",
      cityEstimate:
        savedRecord.cityEstimate ?? undefined,
      userAgent: savedRecord.userAgent ?? undefined,
      ip: savedRecord.ip ?? undefined,
      provider: savedRecord.provider ?? undefined,
    };

    // Salvar backup local
    await backupMetricToFile(responseMetric);

    return NextResponse.json({
      success: true,
      message: "Métrica registrada com sucesso.",
      data: {
        ...responseMetric,
        city: cityEstimate,
        region,
        country,
        locationSource: "IP",
        precision: "approximate",
      },
      storageType: "Neon DB PostgreSQL (Prisma ORM)",
    });
  } catch (error) {
    console.error(
      "Erro ao registrar métrica:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Falha ao registrar métrica",
      },
      { status: 500 }
    );
  }
}
