import { useEffect, useRef, useState, type RefObject } from "react";
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

  // 사용자가 그래프 내부를 드래그 할 때, 이벤트 추적 대상 구간 표시용.
  const overlayRef = useRef<HTMLDivElement>(null);
  let dragging = false;
  let dragStart = null;

  // 사용자가 그래프 내부를 드래그 할 때, 이벤트 추적 대상 구간에 히당하는 이벤트 리스트 표시용.
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

    // 마우스/터치 동작 감지
    chart.subscribeClick((param) => {
      // 이벤트 추적 구간 표시용
      if(!dragging){
        dragging = true;
        dragStart = param.time;
        console.log("드래깅스타트 기록 !!! : " + param.time);
      } else {
        dragging = false;
        dragStart = null;
        clearOverlay(overlayRef);
      }
    });

    // 🎯 마우스/터치 이동(드래그) 동작 감지
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.point) {
        setTooltip(null);
        return;
      }

      drawOverlay(chart, overlayRef, dragStart, param.time);

      // 이벤트 리스트 표시용.
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
        style={{ 
          width: "100%",
          height: VALUES.chartHeight,
          backgroundColor: COLORS.eventAreaBackgroundColor,
          position: "relative"
        }} 
      >
        {/* overayRef 가 chartContainerRef 안에 있으면서
        zIndex가 chartContainerRef 보다 커야 그래프 안에 회색 박스 영역이 보인다. */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(180,180,180,0.25)",
            pointerEvents: "none",
            display: "none",
            zIndex: 10,
          }}
        />
      </div>
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


function clearOverlay(overlayRef: RefObject<HTMLDivElement | null>){
  if(!overlayRef.current) return;
  overlayRef.current.style.display = "none";
}

function drawOverlay(
  chart: any,
  overlayRef: any,
  startTime: any,
  endTime: any
) {
  if (!chart || !overlayRef.current) return;
  if (startTime === null || startTime === undefined) return;

  const timeScale = chart.timeScale();

  const x1 = timeScale.timeToCoordinate(startTime);
  const x2 = timeScale.timeToCoordinate(endTime);

  if (x1 == null || x2 == null) return;

  const left = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);

  overlayRef.current.style.display = "block";
  overlayRef.current.style.left = `${left}px`;
  overlayRef.current.style.width = `${width}px`;
}