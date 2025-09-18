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
    <h2>원하는 경제지표들을 한 번에!</h2>
    <br></br>
    <br></br>

    <h2>지표를 선택해주세요(최대 6개)</h2>
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
    <div>
      <h3>새로운 기능과 지표를 추가하고 싶다면...? 👉 dongvin99@naver.com</h3>
    </div>
  </div>
);
}

export default App;
