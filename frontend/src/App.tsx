import { useState, useEffect } from "react";
import "./styles.scss";
import "./checkbox.scss";
import DataTable from "react-data-table-component";

import { DayView } from "./components/day-view";
import formats from "./formats/data-formatting";

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
  const [dayDifference, setDayDifference] = useState(0);

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
    cells: {
      style: {
        borderRight: "1px solid #ddd",
      },
    },
  };

  useEffect(() => {
    console.log("useEffect");

    const days = new Date(startDate).getTime() - new Date(endDate).getTime();
    const dayCount = days / (1000 * 60 * 60 * 24) + 1;
    setDayDifference(dayCount < 0 ? 0 : dayCount);

    setError(null);
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
      name: (
        <div>
          Total production <div className="highlight">(mWh)</div>
        </div>
      ),
      selector: (row) => row.totalProduction,
      cell: (row) => formats.production(row.totalProduction),
      sortable: true,
    },
    {
      name: (
        <div>
          Total consumption <div className="highlight">(mWh)</div>
        </div>
      ),
      selector: (row) => row.totalConsumption,
      cell: (row) => formats.consumption(row.totalConsumption),
      sortable: true,
    },
    {
      name: (
        <div>
          Average price <div className="highlight">(snt/kWh)</div>
        </div>
      ),

      selector: (row) => row.averagePrice,
      cell: (row) => formats.price(row.averagePrice),
      sortable: true,
    },
    {
      name: <div>Longest consecutive negative hours</div>,
      selector: (row) => row.longestConsecutiveNegativeHours,
      cell: (row) => formats.hours(row.longestConsecutiveNegativeHours),
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

  const handlePriceTagFilter = (e) => {
    const isChecked = e.target.checked;

    const newData = {
      count: source.count,
      data: source.data.filter((row) => {
        if (isChecked) {
          return row.averagePrice < 0;
        } else {
          return true;
        }
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
              <h2>
                Electricity stats app - Leevi Seppälä -{" "}
                <a
                  href="https://github.com/lexonegit/solita-exercise-2025"
                  target="_blank"
                  rel="noreferrer"
                >
                  Link to GitHub
                </a>
              </h2>
              <p>Usage instructions:</p>
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
                <li>filter data with filters (search and 1 tag option)</li>
                <li>
                  click on the <b>"View details"</b> buttons to see a more
                  detailed view of the day (single day view)
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
                = range of {dayDifference} days
              </p>

              <h3>Filtering</h3>

              <p>
                <input
                  type="text"
                  placeholder="Search by date (yyyy-mm-dd)"
                  onChange={handleSearch}
                  className="search-input"
                />
                <label className="checkbox-container">
                  Only show days where average price was negative
                  <input type="checkbox" onChange={handlePriceTagFilter} />
                  <span className="checkmark"></span>
                </label>
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
                paginationRowsPerPageOptions={[10, 20, 30, 100, 365]}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
