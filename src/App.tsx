import React from "react";
import CandleChart from "./components/test-charts/CandleChart";
import LineChart from "./components/test-charts/LineChart";
import CandleChartsWithEvent from "./components/test-charts/CandleChartsWithEvents";
import CheckBox from "../src/components/index-selection/CheckBox"
import DurationSelection from "./components/index-selection/Duration";
import ShowGraph from "./components/index-selection/ShowGraphs";

function App() {
  return (
  <div>
    <h1>Macro Economy Board</h1>
    <h2>여러가지 지표들을 한번에 비교하고,</h2>
    <h2>최적의 투자 타이밍을 잡으세요!</h2>
    <br></br>
    <br></br>

    <CheckBox />
    <br></br>
    <br></br>

    <DurationSelection />
    <br></br>

    <ShowGraph />
    <br></br>
    <br></br>

    <div>
      <h2 style={{ color: "green" }}>Test Candle Chart</h2>
      <CandleChart />

      <h2 style={{ color: "green" }}>Test line Chart</h2>
      <LineChart />

      <h2 style={{ color: "green" }}>Test Candle + Events Chart</h2>
      <CandleChartsWithEvent />
    </div>
  </div>
);
}

export default App;
