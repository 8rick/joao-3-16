import { NextResponse } from "next/server";

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

// Em memória para fins de demonstração e controle de métricas locais
let metricsLog: LocationMetric[] = [
  {
    id: "sample-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    latitude: -23.5505,
    longitude: -46.6333,
    accuracy: 25,
    status: "granted",
    cityEstimate: "São Paulo, SP (Demonstração)",
    userAgent: "Mozilla/5.0 Example"
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    totalCount: metricsLog.length,
    grantedCount: metricsLog.filter((m) => m.status === "granted").length,
    deniedCount: metricsLog.filter((m) => m.status === "denied").length,
    recentMetrics: metricsLog.slice(-20).reverse()
  });
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

    // Tentar identificar cidade aproximada se tiver coordenadas via OpenStreetMap Nominatim público (reverso simples)
    if (newMetric.latitude && newMetric.longitude && newMetric.status === "granted") {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newMetric.latitude}&lon=${newMetric.longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              "User-Agent": "Joao316-MarketingControl/1.0"
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
        newMetric.cityEstimate = "Coordenadas registradas";
      }
    }

    metricsLog.push(newMetric);

    // Manter últimos 100 registros
    if (metricsLog.length > 100) {
      metricsLog = metricsLog.slice(-100);
    }

    return NextResponse.json({
      success: true,
      message: "Métrica registrada com sucesso respeitando o consentimento do usuário.",
      data: newMetric
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Falha ao processar métrica de marketing" },
      { status: 400 }
    );
  }
}
