import React from "react";
import CandleChart from "./components/CandleChart";
import LineChart from "./components/LineChart";

function App() {
  return (
  <div>
    <h1 style={{ color: "green" }}>Test Candle Chart</h1>
    <CandleChart />

    <h1 style={{ color: "green" }}>Test line Chart</h1>
    <LineChart />
  </div>
);
}

export default App;
