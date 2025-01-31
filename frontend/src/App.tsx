import { useState, useEffect } from "react";
import "./styles.scss";
import DataTable from "react-data-table-component";

function App() {
  const [source, setSource] = useState(null);
  const [filteredSource, setFilteredSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const current = new Date("2024-03-01");
  const now = current.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(current - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(now);

  const API_URL = "http://localhost:5555/api/data";

  const tableStyles = {
    headCells: {
      style: {
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1.2em",
        fontWeight: "bold",
      },
    },
  };

  useEffect(() => {
    // const now = new Date();
    // setFromDate(now.toISOString().split("T")[0]);

    // const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // setToDate(sevenDaysAgo.toISOString().split("T")[0]);

    console.log(
      startDate,
      endDate,
      `${API_URL}?startDate=${startDate}&endDate=${endDate}`
    );

    fetch(`${API_URL}?startDate=${startDate}&endDate=${endDate}`)
      .then((response) => {
        if (!response.ok) {
          // 200
          console.log("ERROR", response);
          throw new Error(
            `Failed to fetch API data. Reason: ${response.statusText} (${response.status})`
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log("LOAD", data);

        // CLIENT SIDE CALCULATIONS TO GET THE REST OF THE REQUIRED DATA

        // Calculate longset consecutive negative hours
        for (const day of data.data) {
          let consecutiveNegativeHours = 0;
          let maxNegativeHours = 0;

          for (const entry of day.entries) {
            // console.log(entry.hourlyPrice, entry.hourlyPrice < 0);

            if (entry.hourlyPrice < 0) {
              consecutiveNegativeHours++;
              maxNegativeHours = Math.max(
                maxNegativeHours,
                consecutiveNegativeHours
              );
            } else {
              consecutiveNegativeHours = 0;
            }
          }

          day.longestConsecutiveNegativeHours = maxNegativeHours;
        }

        setSource(data);
        setFilteredSource(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(
          `Failed to fetch data from: ${API_URL} - Please ensure the Backend app AND Postgres server are running (Docker)`
        );
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      name: "Date",
      selector: (row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{row.date}</span>
          <button onClick={() => {}} className="view-details-button">
            View details
          </button>
        </div>
      ),
      sortable: true,
      onHeaderClick: () => {
        console.log("clicked");
      },
    },
    {
      name: "Total production", // Listed as mWh in database
      selector: (row) => `${Math.round(row.totalProduction)} mWh`,
      sortable: true,
    },
    {
      name: "Total consumption", // Listed as kWh in database, convert to mWh
      selector: (row) => `${Math.round(row.totalConsumption / 1000)} mWh`,
      sortable: true,
    },
    {
      name: "Average price",
      selector: (row) =>
        `${((row.averagePrice * 100) / 100).toFixed(2)} snt / kWh`,
      sortable: true,
    },
    {
      name: "Longest consecutive negative hours",
      selector: (row) => row.longestConsecutiveNegativeHours,
      sortable: true,
    },
  ];

  const dayColumns = [
    {
      name: "Time",
      selector: (row) => row.startTime.split("T")[1].slice(0, 5),
      sortable: true,
    },
    {
      name: "Production", // Listed as mWh in database
      selector: (row) => `${Math.round(row.productionAmount)} mWh`,
      sortable: true,
    },
    {
      name: "Consumption", // Listed as kWh in database, convert to mWh
      selector: (row) => `${Math.round(row.consumptionAmount / 1000)} mWh`,
      sortable: true,
    },
    {
      name: "Hour price",
      selector: (row) =>
        `${((row.hourlyPrice * 100) / 100).toFixed(2)} snt / kWh`,
      sortable: true,
    },
    {
      name: "Longest consecutive negative hours",
      selector: (row) => row.longestConsecutiveNegativeHours,
      sortable: true,
    },
  ];

  const handleDateChange = (e) => {
    const start = document.querySelector("#startDate").value;
    const end = document.querySelector("#endDate").value;

    console.log(start, end);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    console.log("Q:", query);
    console.log("DATA", source);

    const newData = {
      count: source.count,
      data: source.data.filter((row) => {
        return row.date.toLowerCase().includes(query);
      }),
    };

    setFilteredSource(newData);

    console.log("FILTERED", source);
  };

  const toggleDayView = () => {
    console.log("toggleDayView");

    const dayView = document.querySelector(".day-view");
    dayView.style.display = dayView.style.display == "none" ? "flex" : "none";
  };

  return (
    <>
      <div className="day-view" style={{ display: "none" }}>
        <div className="background" onClick={toggleDayView}></div>
        <div className="window">
          <h2>Day view</h2>
          {loading ? (
            <p>Loading data...</p>
          ) : error ? (
            <p className="error">Error: {error}</p>
          ) : (
            <>
              <p>Total production: </p>
              <p>Total consumption: </p>
              <p>Average price: </p>
              <p>Hour with most consumption compared to production: </p>
              <p>Top 3 cheapest hours: </p>

              {/* <DataTable
                className="day-view-table"
                columns={dayColumns}
                data={filteredSource.data[2].entries}
                customStyles={tableStyles}
                pagination
              /> */}
            </>
          )}
        </div>
      </div>
      <div className="container">
        <div className="block">
          <div className="header">
            <h2>Electricity stats</h2>

            <div className="instructions">
              <p>Instructions:</p>
              <ul>
                <li>
                  enter start and end date
                  <ul>
                    <li>
                      by default showing the last 7 days (starting from the
                      latest available data entry)
                    </li>
                  </ul>
                </li>
                <li>click on table headers to sort data</li>
                <li>filter data with filters (search and tags)</li>
                <li>
                  click on "view details" button to see a more detailed view of
                  the day
                </li>
              </ul>
            </div>

            <p>
              Fetch data between:
              <input
                type="date"
                id="endDate"
                onChange={handleDateChange}
                value={endDate}
              />
              ---
              <input
                type="date"
                id="startDate"
                onChange={handleDateChange}
                value={startDate}
              />
            </p>

            <h3>Filtering</h3>
            <p>
              Search:{" "}
              <input
                type="text"
                placeholder="Search by date yyyy-mm-dd"
                onChange={handleSearch}
              />
            </p>
            <input type="checkbox" id="monday" name="weekday" value="monday" />
            <label htmlFor="monday">Show week (mon-fri)</label>
            <input
              type="checkbox"
              id="tuesday"
              name="weekday"
              value="tuesday"
            />
            <label htmlFor="tuesday">Show weekend (sat-sun)</label>
          </div>
          <div className="card">
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="error">Error: {error}</p>
            ) : (
              <DataTable
                className="electricity-table"
                columns={columns}
                data={filteredSource.data}
                customStyles={tableStyles}
                pagination
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
