import Fastify from "fastify";
import cors from "@fastify/cors";
import * as config from "../config.json";
import pg from "@fastify/postgres";

import dataRoute from "./routes/data-route";

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

// CORS
await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Database
fastify.register(pg, {
  connectionString: `postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`,
});

// Routes
fastify.register(dataRoute, { prefix: "api/data" });

// 404 page handling
fastify.setNotFoundHandler(async (request, reply) => {
  reply.code(404).send({ error: "This resource does not exist" });
});

await fastify.ready();

try {
  await fastify.listen({
    host: config.server.host,
    port: config.server.port,
  });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
