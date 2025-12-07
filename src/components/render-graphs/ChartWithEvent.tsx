import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type LineData, type Time } from "lightweight-charts";
import type { Event, MyEvent } from "../downloader/EventJsonDownloader"
import { COLORS } from "../../constants/Colors";
import { VALUES } from "../../constants/Values";
import updateTimeAndValueData from "./PlotDataUpdater";
import { clearOverlay, drawOverlay } from "./EventTracingAreaRenderer";

type GraphProps = {
  timeAndValueData: { time: string, value: number }[];
  eventDataByStart: MyEvent[];
  eventDataByEnd: MyEvent[];
  graphName: string;
  durationYear: number;
};

const ChartWithEvent: React.FC<GraphProps> = (
  {timeAndValueData, eventDataByStart, eventDataByEnd, graphName, durationYear}
) => {

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // 사용자가 그래프 내부를 드래그 할 때, 이벤트 추적 대상 구간 표시용.
  const overlayRef = useRef<HTMLDivElement>(null);
  // 드래그 상태 저장
  const isDragging = useRef(false);
  const dragStart = useRef<Time | null>(null);
  const dragEnd = useRef<Time | null>(null);

  const pointerDownTime = useRef(0);
  const pointerDownX = useRef(0);

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
      rightPriceScale: { visible: true, borderColor: COLORS.axisColor },
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
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const line = chart.addLineSeries({
      color: COLORS.rolexGreenColor,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // durationYear 값에 맞춰서 원본 데이터의 개수를 줄인다(주 평균 또는 월 평균 적용).
    const reducedData = updateTimeAndValueData(timeAndValueData, durationYear);
    line.setData(reducedData);

    chart.timeScale().fitContent();
    chart.timeScale().scrollToRealTime();

    // ========= Pointer Event 기반 새로운 드래그 로직 =========
    // 터치 또는 클릭 시작 -> 드래그 -> 터치 또는 클릭 해제 직후 이벤트 추적 영역 확정
    const container = chartContainerRef.current;

    const getTimeFromX = (x: number): Time | null => {
      if (!chartRef.current) return null;
      const logical = chartRef.current.timeScale().coordinateToTime(x);
      return logical ?? null;
    };

    // 처음 터치/클릭 할 때의 이벤트 처리
    const handlePointerDown = (e: PointerEvent) => {
      pointerDownTime.current = Date.now();
      pointerDownX.current = e.clientX;

      isDragging.current = true;

      const t = getTimeFromX(e.clientX);
      dragStart.current = t;
      dragEnd.current = t;

      drawOverlay(chart, overlayRef, dragStart.current, dragEnd.current, t);
    };

    // 터치/클릭 유지하면서 드래그 할 때의 이벤트 처리
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const t = getTimeFromX(e.clientX);
      dragEnd.current = t;

      drawOverlay(chart, overlayRef, dragStart.current, dragEnd.current, t);
    };

    // 드래그를 마치고 터치/클릭 해제할 때의 이벤트 처리
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;

      isDragging.current = false;

      const t = getTimeFromX(e.clientX);
      dragEnd.current = t;

      const elapsed = Date.now() - pointerDownTime.current;
      const moved = Math.abs(e.clientX - pointerDownX.current);

      // 단순 클릭이면 overlay 제거
      if (elapsed < 120 && moved < 5) {
        clearOverlay(overlayRef);
        dragStart.current = null;
        dragEnd.current = null;
        return;
      }

      // 드래그 영역 확정
      drawOverlay(chart, overlayRef, dragStart.current, dragEnd.current, t);
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerUp);

    // 기존 crosshairMove → tooltip 표시
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.point) {
        setTooltip(null);
        return;
      }
      const data = param.seriesData.get(line) as LineData;
      // TODO : 여기에 이벤트 구간 시작 ~ 끝 날짜, 이벤트들 내용 리스트를 넣어야 한다.
      setTooltip({
        time: param.time,
        kospi: data?.value,
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

      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [timeAndValueData]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: VALUES.chartHeight,
          backgroundColor: COLORS.eventAreaBackgroundColor,
          position: "relative",
        }}
      >
        {/* overayRef 가 chartContainerRef 안에 있으면서
        zIndex가 chartContainerRef 보다 커야
        그래프 안에 회색 박스 영역이 보인다.*/}
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
          <div className="text-red-600">
            {graphName + ": " + tooltip.kospi}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartWithEvent;