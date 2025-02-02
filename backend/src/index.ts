import Fastify from "fastify";
import cors from "@fastify/cors";
import config from "../config.json";
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
  connectionString: `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
});

// Routes
fastify.register(dataRoute, { prefix: "api" });

// 404 page handling
fastify.setNotFoundHandler(async (request, reply) => {
  reply.code(404).send({ error: "This resource does not exist" });
});

await fastify.ready();

try {
  await fastify.listen({
    host: config.SERVER_HOST,
    port: config.SERVER_PORT,
  });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
