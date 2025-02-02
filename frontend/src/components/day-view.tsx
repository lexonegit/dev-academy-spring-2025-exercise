import { useState, useEffect } from "react";
import "../styles.scss";
import DataTable from "react-data-table-component";

export function DayView(props) {
  const [data, setData] = useState(null);

  const toggleDayView = (row) => {
    console.log("toggleDayView (DayView)", row);

    setData(null);
    props.handleToggleDayView(null);
  };

  const tableStyles = {
    headCells: {
      style: {
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1.2em",
        fontWeight: "bold",
        padding: "1em 1em",
      },
    },
    rows: {
      style: {
        padding: "1em 0",
        fontSize: "1em",
      },
    },
  };

  const dayColumns = [
    {
      id: "time",
      name: "Time",
      selector: (row) => row.startTime,
      cell: (row) => row.startTime.split("T")[1].slice(0, 5),
      sortable: true,
    },
    {
      name: "Production", // Listed as mWh in database
      selector: (row) => row.productionAmount,
      cell: (row) => `${Math.round(row.productionAmount)} mWh`,
      sortable: true,
    },
    {
      name: "Consumption", // Listed as kWh in database, convert to mWh
      selector: (row) => row.consumptionAmount,
      cell: (row) => `${Math.round(row.consumptionAmount / 1000)} mWh`,
      sortable: true,
    },
    {
      name: "Hour price",
      selector: (row) => row.hourlyPrice,
      cell: (row) => (
        <>{((row.hourlyPrice * 100) / 100).toFixed(2)} snt / kWh</>
      ),
      sortable: true,
    },
  ];

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && props.visible) {
        toggleDayView(null);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [props.visible]);

  useEffect(() => {
    if (!props.visible) return;
    console.log("useEffect, day-view:", props.row);

    const dayViewData = {
      totalProduction: props.row.totalProduction,
      totalConsumption: props.row.totalConsumption,
      averagePrice: props.row.averagePrice,
      mostConsumptionComparedToProduction: null,
      cheapestHours: [],
    };

    // Get hour with most consumption compared to production
    console.log("@@@", props.row.entries);

    let obj = {
      hour: 0,
      percentage: 0,
    };
    let currentHighest = 0;
    for (const entry of props.row.entries) {
      const mWhConsumption = entry.consumptionAmount / 1000;
      const ratio = mWhConsumption / entry.productionAmount;

      console.log(
        mWhConsumption,
        "/",
        entry.productionAmount,
        "=",
        ratio,
        currentHighest
      );

      if (ratio > currentHighest) {
        currentHighest = ratio;

        obj = {
          hour: entry.startTime.split("T")[1],
          percentage: Math.round(ratio * 1000) / 10,
        };
      }
    }

    dayViewData.mostConsumptionComparedToProduction = `${obj.hour} ${obj.percentage}% consumed`;

    // Get top 3 cheapest hours from props.row.entries
    const priceSorted = props.row.entries.sort(
      (a, b) => a.hourlyPrice - b.hourlyPrice
    );
    dayViewData.cheapestHours = priceSorted
      .slice(0, 3)
      .map((entry) => `${entry.startTime.split("T")[1].slice(0, 5)}`);

    setData(dayViewData);

    console.log("DATA", dayViewData);
  }, [props.visible]);

  return (
    props.visible &&
    data && (
      <div
        className="day-view"
        style={{ display: props.visible ? "flex" : "none" }}
      >
        <div className="background" onClick={toggleDayView}></div>
        <div className="window">
          <div className="window-header">
            <h2>Day view</h2>
            <button onClick={toggleDayView}>X</button>
          </div>
          <div className="instructions">
            <p>Total production: {data.totalProduction}</p>
            <p>Total consumption: {data.totalConsumption}</p>
            <p>Average price: {data.averagePrice}</p>
            <p>
              Hour with most consumption compared to production:{" "}
              {data.mostConsumptionComparedToProduction}
            </p>
            <p>
              Top 3 cheapest hours:{" "}
              {data.cheapestHours.map((hour, index) => (
                <span className="tag" key={index}>
                  {hour}
                </span>
              ))}
            </p>
          </div>

          <div style={{ overflowY: "hidden" }}>
            <DataTable
              className="day-view-table"
              fixedHeader
              fixedHeaderScrollHeight="100%"
              defaultSortFieldId="time"
              columns={dayColumns}
              data={props.row.entries}
              customStyles={tableStyles}
            />
          </div>
        </div>
      </div>
    )
  );
}
