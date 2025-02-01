import { useState, useEffect } from "react";
import "./styles.scss";
import DataTable from "react-data-table-component";

import { DayView } from "./components/day-view";

function App() {
  const [source, setSource] = useState(null);
  const [filteredSource, setFilteredSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visible, setVisible] = useState(false);
  const [row, setRow] = useState(null);

  const start = new Date("2024-10-01");
  const end = new Date(start.getTime() - (365 - 1) * 24 * 60 * 60 * 1000);

  const startIso = start.toISOString().split("T")[0];
  const startMinusSevenDaysIso = end.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(startIso);
  const [endDate, setEndDate] = useState(startMinusSevenDaysIso);

  const API_URL = "http://localhost:5555/api/data";

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

  useEffect(() => {
    console.log("useEffect");

    // const now =  new Date("2024-01-01");
    // setStartDate(now.toISOString().split("T")[0]);

    // const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // setEndDate(sevenDaysAgo.toISOString().split("T")[0]);

    setLoading(true);

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
  }, [startDate, endDate]);

  useEffect(() => {
    console.log("useEffect filteredSource", filteredSource);
  }, [filteredSource]);

  const columns = [
    {
      id: "time",
      name: <div>Date</div>,
      selector: (row) => row.date,
      sortable: true,
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{row.date}</span>
          <button
            onClick={() => handleToggleDayView(row)}
            className="view-details-button"
          >
            View details
          </button>
        </div>
      ),
      width: "25%",
    },
    {
      name: <div>Total production</div>, // Listed as mWh in database
      selector: (row) => `${Math.round(row.totalProduction)} mWh`,
      sortable: true,
    },
    {
      name: <div>Total consumption</div>, // Listed as kWh in database, convert to mWh
      selector: (row) => `${Math.round(row.totalConsumption / 1000)} mWh`,
      sortable: true,
    },
    {
      name: <div>Average price</div>,

      selector: (row) =>
        `${((row.averagePrice * 100) / 100).toFixed(2)} snt / kWh`,
      sortable: true,
    },
    {
      name: <div>Longest consecutive negative hours</div>,
      selector: (row) => row.longestConsecutiveNegativeHours,
      sortable: true,
    },
  ];

  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    setEndDate(newDate);
  };

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
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

  const handleTagFilter = (e) => {
    const query = e.target.value;
    console.log("Q:", query);
    console.log("DATA", source);

    const newData = {
      count: source.count,
      data: source.data.filter((row) => {
        return row.tags.includes(query);
      }),
    };

    setFilteredSource(newData);

    console.log("FILTERED", source);
  };

  const handleToggleDayView = (row) => {
    console.log("toggleDayView (App)", row);
    setRow(row);
    setVisible(!visible);
  };

  return (
    <>
      <DayView
        handleToggleDayView={handleToggleDayView}
        visible={visible}
        row={row}
      />
      <div className="container">
        <div className="block">
          <div className="header">
            <div className="instructions">
              <h2>Electricity stats</h2>
              <p>Feature instructions:</p>
              <ul>
                <li>
                  enter time range to fetch data from
                  <ul>
                    <li>
                      by default showing the last 365 days (starting from the
                      latest available data entry)
                    </li>
                  </ul>
                </li>
                <li>click on table headers to sort data by column</li>
                <li>filter data with filters (search and tags)</li>
                <li>
                  click on the "View details" buttons to see a more detailed
                  view of the day (single day view)
                </li>
              </ul>

              <h3>Time range</h3>
              <p>
                Fetch data between:{" "}
                <input
                  type="date"
                  id="endDate"
                  onChange={handleEndDateChange}
                  value={endDate}
                  className="date-input"
                />
                and
                <input
                  type="date"
                  id="startDate"
                  onChange={handleStartDateChange}
                  value={startDate}
                  className="date-input"
                />
              </p>

              <h3>Filtering</h3>
              <p>
                <input
                  type="text"
                  placeholder="Search by date (yyyy-mm-dd)"
                  onChange={handleSearch}
                  className="search-input"
                />
                <input type="checkbox" className="filter-input" />
                Show only days where average price is negative
              </p>
            </div>
          </div>
          <div className="card">
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="error">Error: {error}</p>
            ) : (
              <DataTable
                className="electricity-table"
                defaultSortFieldId="time"
                defaultSortAsc={false}
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
