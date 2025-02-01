import { FastifyInstance } from "fastify";
import { getDayDetailed, getData } from "../controllers/data-controller";

async function dataRoute(fastify: FastifyInstance) {
  fastify.get("/", getData);

  // This other route ended up not being used, but idea was
  // to use it for direct URL access (for single day views)
  // (i.e. localhost:5555/view?date=2025-01-01)
  fastify.get("/view", getDayDetailed);
}

export default dataRoute;
