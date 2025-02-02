import DataTable from "react-data-table-component";
import formats from "../formats/data-formatting";
import "../styles/styles.scss";

export default function MainViewTable(props) {
  const styles = {
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

  const columns = [
    {
      id: "time",
      name: <div>Date</div>,
      selector: (data) => data.date,
      sortable: true,
      cell: (data) => (
        <div className="time-cell">
          <span className="time">{data.date}</span>
          <button
            onClick={() => props.handleToggleDayView(data)}
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
      selector: (data) => data.totalProduction,
      cell: (data) => formats.production(data.totalProduction),
      sortable: true,
    },
    {
      name: (
        <div>
          Total consumption <div className="highlight">(mWh)</div>
        </div>
      ),
      selector: (data) => data.totalConsumption,
      cell: (data) => formats.consumption(data.totalConsumption),
      sortable: true,
    },
    {
      name: (
        <div>
          Average price <div className="highlight">(snt/kWh)</div>
        </div>
      ),

      selector: (data) => data.averagePrice,
      cell: (data) => formats.price(data.averagePrice),
      sortable: true,
    },
    {
      name: <div>Longest consecutive negative hours</div>,
      selector: (data) => data.longestConsecutiveNegativeHours,
      cell: (data) => formats.hours(data.longestConsecutiveNegativeHours),
      sortable: true,
    },
  ];

  return (
    <DataTable
      className="electricity-table"
      defaultSortFieldId="time"
      defaultSortAsc={false}
      columns={columns}
      data={props.filteredSource.data}
      customStyles={styles}
      pagination
      paginationRowsPerPageOptions={[10, 20, 30, 100, 365]}
    />
  );
}
