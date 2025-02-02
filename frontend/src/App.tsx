import { useState, useEffect } from "react";
import config from "../config.json";
import "./styles/styles.scss";
import "./styles/checkbox.scss";

import DayViewOverlay from "./components/day-view-overlay";
import MainViewTable from "./components/main-view-table";

function App() {
  const [apiData, setApiData] = useState(null);
  const [filteredApiData, setFilteredApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dayViewVisible, setDayViewVisible] = useState(false);
  const [dayData, setDayData] = useState(null);

  const start = new Date("2024-10-01");
  const end = new Date(start.getTime() - (365 - 1) * 24 * 60 * 60 * 1000); // start minus 365 days

  const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
  const [dayDifference, setDayDifference] = useState(0);

  useEffect(() => {
    // console.log("FETCHING DATA");

    // Calculate the day difference between start and end
    const days = new Date(startDate).getTime() - new Date(endDate).getTime();
    const dayCount = days / (1000 * 60 * 60 * 24) + 1;
    setDayDifference(dayCount < 0 ? 0 : dayCount);

    setError(null);
    setLoading(true);

    fetch(`${config.API_URL}?startDate=${startDate}&endDate=${endDate}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch API data. Reason: ${response.statusText} (${response.status})`
          );
        }
        // 200
        return response.json();
      })
      .then((data) => {
        // Find the longest consecutive negative hours
        for (const day of data.data) {
          let consecutiveNegativeHours = 0;
          let maxNegativeHours = 0;

          for (const entry of day.entries) {
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

        setApiData(data);
        setFilteredApiData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(
          `Failed to fetch data from: ${config.API_URL} - Please ensure the Backend app AND Postgres server are running - Actual error: ${error}`
        );
        setLoading(false);
      });
  }, [startDate, endDate]);

  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    setEndDate(newDate);
  };

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
  };

  const handleSearch = (e) => {
    // console.log("handleSearch");
    const query = e.target.value.toLowerCase();

    const newData = {
      count: apiData.count,
      data: apiData.data.filter((data) => {
        return data.date.toLowerCase().includes(query);
      }),
    };

    setFilteredApiData(newData);
  };

  const handlePriceTagFilter = (e) => {
    // console.log("handlePriceTagFilter");
    const isChecked = e.target.checked;

    const newData = {
      count: apiData.count,
      data: apiData.data.filter((data) => {
        return isChecked ? data.averagePrice < 0 : true;
      }),
    };

    setFilteredApiData(newData);
  };

  const handleToggleDayView = (data) => {
    // console.log("handleToggleDayView (App)");
    setDayData(data);
    setDayViewVisible(!dayViewVisible);
  };

  return (
    <>
      <DayViewOverlay
        handleToggleDayView={handleToggleDayView}
        visible={dayViewVisible}
        data={dayData}
      />
      <div className="container">
        <div className="block">
          <div className="header">
            <div className="container-left">
              <h2>
                Electricity stats app - Leevi Seppälä -{" "}
                <a
                  href="https://github.com/lexonegit/solita-exercise-2025"
                  target="_blank"
                >
                  Link to GitHub
                </a>
              </h2>
              <div>
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
              </div>

              <h3>Time range</h3>
              <div>
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
              </div>

              <h3>Filtering</h3>

              <div>
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
              </div>
            </div>
          </div>
          <div className="card">
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="error">Error: {error}</p>
            ) : (
              <MainViewTable
                filteredSource={filteredApiData}
                handleToggleDayView={handleToggleDayView}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
