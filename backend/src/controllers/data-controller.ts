import { FastifyReply, FastifyRequest } from "fastify";

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
        COUNT(*) AS count,
        SUM(consumptionamount) AS "totalConsumption",
        SUM(productionamount) AS "totalProduction",
        AVG(hourlyprice) AS "averagePrice",
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

// // Calculate longset consecutive negative hours
// for (const row of result.rows) {
//   let consecutiveNegativeHours = 0;
//   let maxNegativeHours = 0;

//   for (const entry of row.entries) {
//     // console.log(entry.hourlyPrice, entry.hourlyPrice < 0);

//     if (entry.hourlyPrice < 0) {
//       consecutiveNegativeHours++;
//       maxNegativeHours = Math.max(maxNegativeHours, consecutiveNegativeHours);
//     } else {
//       consecutiveNegativeHours = 0;
//     }
//   }

//   row.longestConsecutiveNegativeHours = maxNegativeHours;
//   // console.log(row.date, maxNegativeHours);
// }

// // Calculate hour with most consumption compared to production
// for (const row of result.rows) {
//   let obj = {
//     hour: 0,
//     percentage: 0,
//   };
//   let currentHighest = 0;

//   for (const entry of row.entries) {
//     const mWhConsumption = entry.consumptionAmount / 1000;
//     const ratio = mWhConsumption / entry.productionAmount;

//     console.log(
//       mWhConsumption,
//       "/",
//       entry.productionAmount,
//       "=",
//       ratio,
//       currentHighest
//     );

//     if (ratio > currentHighest) {
//       currentHighest = ratio;

//       obj = {
//         hour: entry.startTime.split("T")[1],
//         percentage: Math.round(ratio * 1000) / 10,
//       };
//     }
//   }

//   console.log("final", obj);
//   row.mostConsumptionComparedToProduction = obj;
// }

// // Get top 3 cheapest hours
// for (const row of result.rows) {
//   row.cheapestHours = row.entries
//     .sort((a, b) => a.hourlyPrice - b.hourlyPrice)
//     .slice(0, 3);
// }
