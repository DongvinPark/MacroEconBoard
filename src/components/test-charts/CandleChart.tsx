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
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      timeScale: {
        borderVisible: true,
        tickMarkFormatter: (time: string | number | Date) => {
          // lightweight-charts의 time은 문자열("YYYY-MM-DD") 또는 timestamp일 수 있음
          const dateObj = typeof time === "string" ? new Date(time) : new Date((time as number) * 1000);
          if (isNaN(dateObj.getTime())) return "";
      
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dateObj.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        },
      },
      localization: {
        // 사용자의 위치와 상관없이 항상 ISO로 표시
        locale: "en-GB",
        timeFormatter: (time: string | number | Date) => {
          const dateObj = typeof time === "string" ? new Date(time) : new Date((time as number) * 1000);
          if (isNaN(dateObj.getTime())) return "";
      
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dateObj.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        },
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

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, []);

  return (
    <div>
      <div
        ref={chartContainerRef}
        style={{ height: 300, backgroundColor: "#eee" }}
      />
    </div>
  );
};

export default CandleChart;
