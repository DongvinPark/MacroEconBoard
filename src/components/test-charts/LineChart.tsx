import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const LineChart: React.FC = () => {
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
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
    });

    const lineSeries = chart.addLineSeries({
      color: "#2196f3",
      lineWidth: 2,
      title: "test idx"
    });

    lineSeries.setData([
      { time: "2023-07-01", value: 100 },
      { time: "2023-07-02", value: 105 },
      { time: "2023-07-03", value: 102 },
      { time: "2023-07-04", value: 108 },
      { time: "2023-07-05", value: 103 },
    ]);

    chart.timeScale().fitContent();

    // Resize on container change
    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: chartContainerRef.current!.clientWidth,
      });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div>
      <div>Line Chart:</div>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: 300, backgroundColor: "#eee" }}
      />
    </div>
  );
};

export default LineChart;