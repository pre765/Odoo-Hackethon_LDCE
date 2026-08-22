import "dotenv/config";
import app from "./app.js";
import { closeDatabase } from "./config/database.js";

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`GlobeTrotter API listening on http://localhost:${port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received; closing server.`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
