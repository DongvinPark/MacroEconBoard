import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type LineData } from "lightweight-charts";
import type { Event } from "../../components/downloader/EventJsonDownloader"
import { COLORS } from "../../constants/Colors";
import { VALUES } from "../../constants/Values";
import updateTimeAndValueData from "./PlotDataUpdater";

type GraphProps = {
  timeAndValueData: {time: string, value: number}[];
  eventData: Event[];
  graphName: string;
  durationYear: number;
};


const ChartWithEvent: React.FC<GraphProps> = (
  {timeAndValueData, eventData, graphName, durationYear}
) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [tooltip, setTooltip] = useState<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!timeAndValueData?.length) return; // 데이터 없으면 생성 금지

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: VALUES.chartHeight,
      layout: {
        background: { color: COLORS.chartBackgroundColor },
        textColor: COLORS.chartTextColor,
      },
      grid: {
                              // 차트 내부에 점선을 긋고 싶을 때 주석 해제.
        vertLines: { visible: /*true, color: "#e6e6e6"*/false },
        horzLines: { visible: /*true, color: "#e6e6e6"*/false },
      },
      rightPriceScale: {
        visible: true,
        borderColor: COLORS.axisColor,
      },
      timeScale: {
        borderVisible: true,
        tickMarkFormatter: (time: string | number | Date) => {
          // lightweight-charts의 time은 문자열("YYYY-MM-DD") 또는 timestamp일 수 있음
          const dateObj = typeof time === "string" ? new Date(time) : new Date((time as number) * 1000);
          if (isNaN(dateObj.getTime())) return ""; // 방어 코드
      
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          //const dd = String(dateObj.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}`;//`${yyyy}-${mm}-${dd}`;
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
      handleScroll: { vertTouchDrag: true },
      handleScale: { pinch: true },
    });

    chartRef.current = chart;

    const lineDataSeries = chart.addLineSeries({
      color: COLORS.rolexGreenColor,
      lineWidth: 2,
      title: "",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // durationYear 값에 맞춰서 원본 데이터의 개수를 줄인다(주 평균 또는 월 평균 적용).
    const timeValueDataForGraph: {time: string, value: number}[] = updateTimeAndValueData(
      timeAndValueData, durationYear
    );

    lineDataSeries.setData(
      timeValueDataForGraph
    );

    chart.timeScale().fitContent();
    chart.timeScale().scrollToRealTime();

    // 🎯 터치/마우스 이동 이벤트
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.point) {
        setTooltip(null);
        return;
      }

      const kospi = param.seriesData.get(lineDataSeries) as LineData;

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
  }, [timeAndValueData]); //-- end of useEffect();

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: VALUES.chartHeight, backgroundColor: COLORS.eventAreaBackgroundColor }} 
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
          <div className="text-red-600"> {graphName + ": " + tooltip.kospi}</div>
        </div>
      )}
    </div>
  );
}

export default ChartWithEvent;