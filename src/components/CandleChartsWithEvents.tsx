import React, { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

const CandleChartsWithEvent: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !tooltipRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#fff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries();

    // Set candle data
    candleSeries.setData([
      { time: '2023-07-01', open: 100, high: 110, low: 90, close: 105 },
      { time: '2023-07-02', open: 105, high: 115, low: 100, close: 110 },
      { time: '2023-07-03', open: 110, high: 120, low: 105, close: 115 },
      { time: '2023-07-04', open: 115, high: 125, low: 110, close: 120 },
    ]);

    // 이벤트들을 이런 식으로 추가해볼 수도 있다.
    // 결국 지표나 지수 데이터와 이벤트 데이터는 별도로 관리해야 한다.
    const markerSeries = [
      {
        time: '2023-07-02',
        position: 'aboveBar',
        color: 'black',
        shape: 'circle',
        text: 'FOMC 발표',
      },
      {
        time: '2023-07-03',
        position: 'aboveBar',
        color: '',
        shape: 'circle',
        text: '중국 CPI 발표',
      },
    ];

    // Set event markers
    candleSeries.setMarkers(markerSeries);

    const tooltip = tooltipRef.current;
    tooltip.style.display = "none";

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || param.point === undefined) {
        tooltip.style.display = "none";
        return;
      }

      const event = markerSeries.find((m) => m.time === param.time);
      if (event) {
        tooltip.innerText = event.text;
        tooltip.style.left = param.point.x + 10 + "px";
        tooltip.style.top = param.point.y + 10 + "px";
        tooltip.style.display = "block";
      } else {
        tooltip.style.display = "none";
      }
    });

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: 400 }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "4px",
          pointerEvents: "none",
          display: "none",
          fontSize: "12px",
          zIndex: 10,
        }}
      />
    </div>
  );
};

export default CandleChartsWithEvent;
