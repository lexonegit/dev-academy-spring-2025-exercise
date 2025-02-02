import { FastifyReply, FastifyRequest } from "fastify";

export async function testApi(request: FastifyRequest, reply: FastifyReply) {
  reply.header("Content-Type", "application/json; charset=utf-8");
  reply.code(200).send({ message: "Yes, The backend API is running!" });
}

export async function getData(request: FastifyRequest, reply: FastifyReply) {
  const { startDate, endDate } = request.query as {
    startDate: string;
    endDate : string;
  };

  // TODO: Validate inputs (no exploits, etc.)

  const startDateIso = new Date(startDate).toISOString().split("T")[0];
  const endDateIso = new Date(endDate).toISOString().split("T")[0];

  console.log("Date:", startDateIso, endDateIso);

  const query = {
    text: `
      SELECT
        TO_CHAR(DATE(date), 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS count,
        SUM(consumptionamount)::float8 AS "totalConsumption",
        SUM(productionamount)::float8 AS "totalProduction",
        AVG(hourlyprice)::float8 AS "averagePrice",
        json_agg(
          json_build_object(
            -- 'id', id,
            'REMOVE_ME__date', date,
            'startTime', starttime,
            'productionAmount', productionamount,
            'consumptionAmount', consumptionamount,
            'hourlyPrice', hourlyprice
          ) ORDER BY starttime
        ) AS entries
      FROM electricityData
      WHERE DATE(date) BETWEEN $2 AND $1
      GROUP BY date
      ORDER BY date DESC
    `,
    values: [startDateIso, endDateIso],
  };

  // WHERE DATE(date) BETWEEN $1 AND $2
  //,
  // values: [startDateIso, endDateIso],

  const result = await request.server.pg.query(query);

  reply.header("Content-Type", "application/json; charset=utf-8");
  reply.code(200).send({
    count: result.rowCount,
    data: result.rows,
  });
}

export async function getDayDetailed(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { date } = request.query as {
    date: string;
  };

  const dateIso = new Date(date).toISOString().split("T")[0];

  console.log("Fetching day:", dateIso);

  const query = {
    text: `
      SELECT 
      TO_CHAR(DATE(date), 'YYYY-MM-DD') AS date,
      COUNT(*) AS "count",
      json_agg(
        json_build_object(
          -- 'id', id,
          'date', date,
          'startTime', starttime,
          'productionAmount', productionamount,
          'consumptionAmount', consumptionamount,
          'hourlyPrice', hourlyprice
        ) ORDER BY starttime ASC
      ) AS entries
      FROM electricityData
      WHERE DATE(date) = $1
      GROUP BY date
      LIMIT 1
    `,
    values: [dateIso],
  };

  const result = await request.server.pg.query(query);

  reply.header("Content-Type", "application/json; charset=utf-8");
  reply.code(200).send(result.rows[0]);
}