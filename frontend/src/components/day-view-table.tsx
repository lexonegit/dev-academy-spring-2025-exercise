import DataTable from "react-data-table-component";
import formats from "../formats/data-formatting";
import "../styles/styles.scss";

export default function DayViewTable(props) {
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
      name: <div>Time</div>,
      selector: (data) => data.startTime,
      cell: (data) => (
        <div className="time-cell">
          <span className="time">{formats.time(data.startTime)}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: (
        <div>
          Production <div className="highlight">(mWh)</div>
        </div>
      ),
      selector: (data) => data.productionAmount,
      cell: (data) => formats.production(data.productionAmount),
      sortable: true,
    },
    {
      name: (
        <div>
          Consumption <div className="highlight">(mWh)</div>
        </div>
      ),
      selector: (data) => data.consumptionAmount,
      cell: (data) => formats.consumption(data.consumptionAmount),
      sortable: true,
    },
    {
      name: (
        <div>
          Hour price <div className="highlight">(snt/kWh)</div>
        </div>
      ),
      selector: (data) => data.hourlyPrice,
      cell: (data) => formats.price(data.hourlyPrice),
      sortable: true,
    },
  ];

  return (
    <div style={{ overflowY: "hidden" }}>
      <DataTable
        className="day-view-table"
        fixedHeader
        fixedHeaderScrollHeight="100%"
        defaultSortFieldId="time"
        columns={columns}
        data={props.data.entries}
        customStyles={styles}
      />
    </div>
  );
}
