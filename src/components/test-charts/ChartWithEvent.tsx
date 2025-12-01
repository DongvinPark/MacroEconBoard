import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type LineData } from "lightweight-charts";
import type { Event } from "../../components/downloader/EventJsonDownloader"

type GraphProps = {
  timeAndValueData: {time: string, value: number}[];
  eventData: Event[];
  graphName: string;
  durationYear: number;
};

function updateTimeAndValueData(
  inputList: {time: string, value: number}[],
  duration: number
){
  /*
  duration 값에 따라서 timeAndValueData 를 변형시켜야 한다.
  lightweight chart 라이브러리로 표시할 수 있는 최대 가로 값 개수가 360 개 정도로 제한돼 있기 때문이다.
  
  duration 이 1 년일 때는 변경이 필요 없다.

  duration 이 5 년일 때는 월~금 종가 기준 주평균 통계를 내서 timeAndValueData 값 개수를 축소시킨다.
  {time: "?", value: "?"} 에서
  time : "?" 의 ? 부분 표시는 매주 마지막 영엽일의 YYYY-MM-DD로 맞추고, value는 평균으로 하면 된다.

  duration 이 10년 이상일 때는 월평균 통계를 내서 timeAndValueData 값 개수를 축소시킨다.
  {time: "?", value: "?"} 에서
  time : "?" 의 ? 부분 표시는 매월 마지막 영업일의 YYYY-MM-DD로 맞추고, vaue는 평균으로 하면 된다.
  */
  let list: {time: string, value: number}[] = [];
  return list;
}

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
      handleScroll: { vertTouchDrag: true },
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
    chart.timeScale().scrollToRealTime();

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
  }, [timeAndValueData]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: 300, backgroundColor: "#eee" }} 
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