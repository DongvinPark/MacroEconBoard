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

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#ef5350",            // Bullish body (red)
      downColor: "#2196f3",          // Bearish body (blue)
      borderUpColor: "#ef5350",      // Bullish border
      borderDownColor: "#2196f3",    // Bearish border
      wickUpColor: "#ef5350",        // Bullish wick (match body)
      wickDownColor: "#2196f3",      // Bearish wick (match body)
    });


    candleSeries.setData([
      { time: "2023-07-01", open: 100, high: 110, low: 90, close: 105 },
      { time: "2023-07-02", open: 105, high: 115, low: 100, close: 99 },
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
