import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

async function main() {
  const dataPath = path.join(process.cwd(), "data", "metrics.json");
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, "utf-8");
    try {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) {
        for (const item of items) {
          await prisma.locationMetric.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              timestamp: new Date(item.timestamp),
              latitude: item.latitude,
              longitude: item.longitude,
              accuracy: item.accuracy,
              status: item.status,
              userAgent: item.userAgent,
              cityEstimate: item.cityEstimate,
            },
          });
        }
      }
    } catch (e) {
      console.warn("Could not parse existing metrics.json:", e);
    }
  }

  const count = await prisma.locationMetric.count();
  console.log("Seeding complete. Total records in Neon database:", count);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
