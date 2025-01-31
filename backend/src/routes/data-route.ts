import { FastifyInstance } from "fastify";
import { getDayDetailed, getData } from "../controllers/data-controller";

async function dataRoute(fastify: FastifyInstance) {
  fastify.get("/", getData);
  fastify.get("/day", getDayDetailed);
}

export default dataRoute;
