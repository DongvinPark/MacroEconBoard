import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type LineData } from "lightweight-charts";
import type { Event } from "../../components/downloader/EventJsonDownloader"

type GraphProps = {
  timeAndValueData: {time: string, value: number}[];
  eventData: Event[];
  graphName: string;
};

const ChartWithEvent: React.FC<GraphProps> = ({timeAndValueData, eventData, graphName}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [tooltip, setTooltip] = useState<any>(null);

  // console.log("!!! 이벤트 테스트 !!! : ");
  // console.log(eventData[0]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#222",
      },
      grid: {
        vertLines: { visible: /*true, color: "#e6e6e6"*/false },
        horzLines: { visible: /*true, color: "#e6e6e6"*/false },
      },
      rightPriceScale: {
        visible: true,
        borderColor: "#000",
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
      crosshair: { mode: 1 },
      handleScroll: { vertTouchDrag: false },
      handleScale: { pinch: true },
    });

    chartRef.current = chart;

    const kospiSeries = chart.addLineSeries({
      color: "#d00",
      lineWidth: 2,
      title: "",
    });

    kospiSeries.setData(
      timeAndValueData
    );

    chart.timeScale().fitContent();

    // 🎯 터치/마우스 이동 이벤트
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.point) {
        setTooltip(null);
        return;
      }

      const kospi = param.seriesData.get(kospiSeries) as LineData;

      setTooltip({
        time: param.time,
        kospi: kospi?.value,
        x: param.point.x,
        y: param.point.y,
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={chartContainerRef}
        style={{ height: 300, backgroundColor: "#eee" }} 
      />
      {tooltip && (
        <div
          className="absolute bg-white/90 border border-gray-200 shadow rounded-lg text-xs p-2"
          style={{
            left: Math.min(tooltip.x + 10, window.innerWidth - 120),
            top: tooltip.y - 50,
            pointerEvents: "none",
          }}
        >
          <div className="font-semibold">{tooltip.time}</div>
          <div className="text-red-600">KOSPI: {tooltip.kospi}</div>
        </div>
      )}
    </div>
  );
}

export default ChartWithEvent;