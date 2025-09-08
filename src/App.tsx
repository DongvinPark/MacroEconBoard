import React from "react";
import CandleChart from "./components/test-charts/CandleChart";
import LineChart from "./components/test-charts/LineChart";
import CandleChartsWithEvent from "./components/test-charts/CandleChartsWithEvents";

function App() {
  return (
  <div>
    <h1>Macro Economy Board</h1>
    <h2>여러가지 지표를 편리하게 비교하세요!</h2>
    <h2>그리고 최적의 투자 타이밍을 잡으세요!</h2>
    <h2>여기는 체크박스 컴포넌트</h2>
    <h2>여기는 기간 선택 다이얼 컴포넌트</h2>
    <h2>여기는 기간 선택 다이얼 컴포넌트</h2>
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
