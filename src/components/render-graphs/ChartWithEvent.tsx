import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type LineData, type Time } from "lightweight-charts";
import type { MyEvent } from "../downloader/EventJsonDownloader"
import { COLORS } from "../../constants/Colors";
import { VALUES } from "../../constants/Values";
import updateTimeAndValueData from "./PlotDataUpdater";
import { clearOverlay, drawOverlay } from "./EventTracingAreaRenderer";
import { findEventsInRangeByStartDateAndEndDate, findEventsInRangeByStartDate } from "./EventFinder";
import { formatDateYYYY_MM_DD } from "../../utils/DateFormater";
import { getEventMarkerList } from "./EventMarkerMaker";

type GraphProps = {
  timeAndValueData: { time: string, value: number }[];
  totalEvents: MyEvent[];
  eventDataByStart: MyEvent[];
  eventDataByEnd: MyEvent[];
  graphName: string;
  durationYear: number;
  language: string;
};

const ChartWithEvent: React.FC<GraphProps> = ({
  timeAndValueData,
  totalEvents,
  eventDataByStart,
  eventDataByEnd,
  graphName,
  durationYear,
  language}) => {

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // 사용자가 그래프 내부를 드래그 할 때, 이벤트 추적 대상 구간 표시용.
  const overlayRef = useRef<HTMLDivElement>(null);
  // 드래그 상태 저장
  const isDragging = useRef(false);
  const dragStartTime = useRef<Time | null>(null);
  const dragEndTime = useRef<Time | null>(null);

  const pointerDownTs = useRef(0);
  const pointerDownX = useRef(0);

  // 사용자가 그래프 내부를 드래그 할 때, 이벤트 추적 대상 구간에 히당하는 이벤트 리스트 표시용.
  const [tooltip, setTooltip] = useState<any>(null);
  const targetEvents = useRef<MyEvent[]>([]);

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
        vertLines: { visible: true, color: COLORS.innerVerticalLineColor },
        horzLines: { visible: false /*, color: COLORS.innerVerticalLineColor */ },
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
      autoSize: false,
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

    // 이벤트들의 시작 날짜를 기준으로 그래프에 라벨을 표시한다.
    const enventMarkers = getEventMarkerList(
      reducedData[0].time,
      reducedData[reducedData.length-1].time,
      eventDataByStart
    );
    line.setMarkers(enventMarkers);

    chart.timeScale().fitContent();
    chart.timeScale().scrollToRealTime();

    // ========= Pointer Event 기반 새로운 드래그 로직 =========
    // 터치 또는 클릭 시작 -> 드래그 -> 터치 또는 클릭 해제 직후 이벤트 추적 영역 확정
    // ========= crosshairMove → param.time 확보 =========
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !isDragging.current) return;

      if (!dragStartTime.current) {
        // 최초 드래그 시작점 세팅
        dragStartTime.current = param.time;
        dragEndTime.current = param.time;

        drawOverlay(chart, overlayRef,
          dragStartTime.current,
          dragEndTime.current,
          dragStartTime.current
        );
        return;
      }

      // 이후 드래그 구간 계속 업데이트
      dragEndTime.current = param.time;
      drawOverlay(chart, overlayRef,
        dragStartTime.current,
        dragEndTime.current,
        param.time
      );
    });;

    // 처음 터치/클릭 할 때의 이벤트 처리
    const handlePointerDown = (e: PointerEvent) => {
      // 모든 상태 초기화
      clearOverlay(overlayRef);
      setTooltip({
        time: "",
        targetEventList: []
      });
      isDragging.current = true;

      // 아직 param.time 없음 → startTime은 crosshairMove 첫 1회에서 세팅
      dragStartTime.current = null;
      dragEndTime.current = null;

      pointerDownTs.current = Date.now();
      pointerDownX.current = e.clientX;
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging.current = false;

      const elapsed = Date.now() - pointerDownTs.current;
      const moved = Math.abs(e.clientX - pointerDownX.current);

      // 단순 클릭이면 overlay 제거
      if (elapsed < VALUES.elapsedTimeThresholdMs && moved < VALUES.moveThreshold) {
        clearOverlay(overlayRef);
        setTooltip({
          time: "",
          targetEventList: []
        });
        dragStartTime.current = null;
        dragEndTime.current = null;
        isDragging.current = false;
        return;
      }

      // 드래그 구간 확정
      if (!dragStartTime.current || !dragEndTime.current) return;

      const start = new Date(dragStartTime.current as any);
      const end = new Date(dragEndTime.current as any);

      let startParam = null;
      let endParam = null;
      if(start.getTime() <= end.getTime()){
        startParam = start;
        endParam = end;
      } else {
        startParam = end;
        endParam = start;
      }

      // const targetEvents = findEventsInRangeByStartDateAndEndDate(
      //   startParam,
      //   endParam,
      //   eventDataByStart,
      //   eventDataByEnd,
      //   totalEvents
      // );

      // 구간 렌더링은 사용하지 않고, 이벤트 시작날짜 기준으로만 탐색한다.
      console.log(startParam);
      const targetEvents = findEventsInRangeByStartDate(
        startParam,
        endParam,
        eventDataByStart
      );

      console.log(targetEvents);

      let tooltipStartDate = null;
      let tooltipEndDate = null;
      if(start.getTime() < end.getTime()){
        tooltipStartDate = start;
        tooltipEndDate = end;
      } else {
        tooltipStartDate = end;
        tooltipEndDate = start;
      }

      setTooltip({
        time: `${formatDateYYYY_MM_DD(tooltipStartDate)} ~ ${formatDateYYYY_MM_DD(tooltipEndDate)}`,
        targetEventList: targetEvents
      });
    };

    const container = chartContainerRef.current;
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    // ========= 리사이즈 =========
    const resizeObserver = new ResizeObserver(() => {
      // 화면 돌려도 그래프와 이벤트 추적 area 를 재렌더링 하지 않게 막는다.
      //chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
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
            backgroundColor: COLORS.eventTracingAreaBoxColor,
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
          <div className="font-semibold">{"🗓️ " + tooltip.time}</div>
          <div className="text-red-600">
            {
              tooltip.targetEventList.map((event, idx)=>{
                return (
                  <div key={idx}>
                    {
                      ("❗ ") +
                      (language === "ko" ? event.titleKr : event.titleEn)
                       + " : " + formatDateYYYY_MM_DD(event.start)
                    }
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartWithEvent;