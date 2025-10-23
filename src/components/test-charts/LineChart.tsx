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
      timeScale: {
        borderVisible: true,
        tickMarkFormatter: (time: string | number | Date) => {
          // lightweight-charts의 time은 문자열("YYYY-MM-DD") 또는 timestamp일 수 있음
          const dateObj = typeof time === "string" ? new Date(time) : new Date((time as number) * 1000);
          if (isNaN(dateObj.getTime())) return ""; // 방어 코드
      
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

    const lineSeries = chart.addLineSeries({
      color: "#2196f3",
      lineWidth: 2,
      title: "test idx"
    });

    lineSeries.setData([
      { time: "2023-07-01", value: 0.4 },
      { time: "2023-07-02", value: 1.1 },
      { time: "2023-07-03", value: 1.4 },
      { time: "2023-07-04", value: 2.3 },
      { time: "2023-07-05", value: 1.1 },
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
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: 300, backgroundColor: "#eee" }}
      />
    </div>
  );
};

export default LineChart;