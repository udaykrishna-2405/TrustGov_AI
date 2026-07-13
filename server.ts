import 'dotenv/config';
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import net from "net";
import app from "./server/app";
import { verifyMongoConnection, seedDemoUser } from "./server/db/mongo";

const RESERVED_DEV_PORTS = new Set([3001, 5000]);
const DEFAULT_HMR_PORT = Number(process.env.VITE_HMR_PORT || 24678);

const isPortAvailable = (port: number, host = '0.0.0.0') => new Promise<boolean>((resolve) => {
  const tester = net.createServer();
  tester.once('error', () => resolve(false));
  tester.once('listening', () => {
    tester.close(() => resolve(true));
  });
  tester.listen(port, host);
});

const resolveServerPort = async (basePort: number) => {
  const allowFallback = (process.env.AUTO_PORT_FALLBACK || 'false').toLowerCase() !== 'false';
  if (await isPortAvailable(basePort)) return basePort;
  if (!allowFallback) return basePort;

  for (let offset = 1; offset <= 20; offset += 1) {
    const candidate = basePort + offset;
    if (RESERVED_DEV_PORTS.has(candidate)) continue;
    if (await isPortAvailable(candidate)) {
      console.warn(`[TrustGov] Port ${basePort} is in use. Falling back to ${candidate}.`);
      return candidate;
    }
  }

  return basePort;
};

const resolveHmrPort = async (basePort: number) => {
  if (await isPortAvailable(basePort, '127.0.0.1')) return basePort;

  for (let offset = 1; offset <= 20; offset += 1) {
    const candidate = basePort + offset;
    if (await isPortAvailable(candidate, '127.0.0.1')) {
      console.warn(`[TrustGov] HMR port ${basePort} is in use. Falling back to ${candidate}.`);
      return candidate;
    }
  }

  return basePort;
};

async function startServer() {
  const DEFAULT_PORT = Number(process.env.PORT || 3000);

  try {
    await verifyMongoConnection();
    console.log('[TrustGov] MongoDB connection verified.');
    await seedDemoUser(); // seed demo account so login works immediately
  } catch (error) {
    console.error('[TrustGov] MongoDB connection failed. Check MONGO_URI and MONGO_DB_NAME.');
    console.error(error);
    process.exit(1);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const hmrPort = await resolveHmrPort(DEFAULT_HMR_PORT);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          host: 'localhost',
          port: hmrPort,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = await resolveServerPort(DEFAULT_PORT);

  app.listen(port, "0.0.0.0", () => {
    console.log(`[TrustGov] Server running on http://localhost:${port}`);
    console.log(`[TrustGov] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
