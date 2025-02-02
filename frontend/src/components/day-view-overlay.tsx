import { useState, useEffect } from "react";
import "../styles/styles.scss";
import formats from "../formats/data-formatting";
import DayViewTable from "./day-view-table";

export default function DayViewOverlay(props) {
  const [data, setData] = useState(null);

  const handleToggleDayView = () => {
    // console.log("handleToggleDayView (Overlay)");

    setData(null);
    props.handleToggleDayView(null);
  };

  // ESC key to close day view
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && props.visible) {
        handleToggleDayView();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  });

  // Update data
  useEffect(() => {
    if (!props.visible) return;
    // console.log("LOADING DAY VIEW TABLE");

    const dayViewData = {
      totalProduction: formats.production(props.data.totalProduction) + " mWh",
      totalConsumption:
        formats.consumption(props.data.totalConsumption) + " mWh",
      averagePrice: formats.price(props.data.averagePrice) + " snt/kWh",
      mostConsumptionComparedToProduction: null, // Replaced later
      cheapestHours: [], // Replaced later
    };

    // Get hour with most consumption compared to production
    let mostConsumption = {
      hour: "00:00",
      percentage: 0,
    };
    let currentHighest = 0;
    for (const entry of props.data.entries) {
      const mWhConsumption = entry.consumptionAmount / 1000;
      const ratio = mWhConsumption / entry.productionAmount;

      if (ratio > currentHighest) {
        currentHighest = ratio;

        mostConsumption = {
          hour: formats.time(entry.startTime),
          percentage: Math.round(ratio * 1000) / 10,
        };
      }
    }
    dayViewData.mostConsumptionComparedToProduction = `${mostConsumption.hour} (${mostConsumption.percentage}% consumed)`;

    // Get top 3 cheapest hours
    dayViewData.cheapestHours = props.data.entries
      .sort((a, b) => a.hourlyPrice - b.hourlyPrice)
      .slice(0, 3)
      .map((entry) => `${entry.startTime.split("T")[1].slice(0, 5)}`);

    setData(dayViewData);
  }, [props.visible, props.data]);

  return (
    props.visible &&
    data && (
      <div
        className="day-view"
        style={{ display: props.visible ? "flex" : "none" }}
      >
        <div className="background" onClick={handleToggleDayView}></div>
        <div className="window">
          <div className="window-header">
            <h2>Day view ({props.data.date})</h2>
            <button onClick={handleToggleDayView}>Close</button>
          </div>
          <div className="container-left">
            <p>
              Total production: <b>{data.totalProduction}</b>
            </p>
            <p>
              Total consumption: <b>{data.totalConsumption}</b>
            </p>
            <p>
              Average price: <b>{data.averagePrice}</b>
            </p>
            <p>
              Hour with the most consumption compared to production:{" "}
              <b>{data.mostConsumptionComparedToProduction}</b>
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

          <DayViewTable data={props.data} />
        </div>
      </div>
    )
  );
}
