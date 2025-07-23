import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CandleChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
    });

    // Correct method for v5
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderDownColor: "#ef5350",
      borderUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      wickUpColor: "#26a69a",
    });

    candleSeries.setData([
      { time: "2023-07-01", open: 100, high: 110, low: 90, close: 105 },
      { time: "2023-07-02", open: 105, high: 115, low: 100, close: 110 },
      { time: "2023-07-03", open: 110, high: 120, low: 105, close: 115 },
    ]);

    return () => chart.remove();
  }, []);

  return (
    <div>
      <div>Chart Container:</div>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: 300, backgroundColor: "#eee" }}
      />
    </div>
  );
};

export default CandleChart;
