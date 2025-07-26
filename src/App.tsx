import React from "react";
import CandleChart from "./components/CandleChart";
import LineChart from "./components/LineChart";
import CandleChartsWithEvent from "./components/CandleChartsWithEvents";

function App() {
  return (
  <div>
    <h1 style={{ color: "green" }}>Test Candle Chart</h1>
    <CandleChart />

    <h1 style={{ color: "green" }}>Test line Chart</h1>
    <LineChart />

    <h1 style={{ color: "green" }}>Test Candle + Events Chart</h1>
    <CandleChartsWithEvent />
  </div>
);
}

export default App;
