import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type LineData } from "lightweight-charts";
import type { Event } from "../../components/downloader/EventJsonDownloader"
import { COLORS } from "../../constants/Colors";
import { DAYS } from "../../constants/Day";
import { VALUES } from "../../constants/Values";

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
  time : "?" 의 ? 부분 표시는 매주 첫 영엽일의 YYYY-MM-DD로 맞추고, value는 평균으로 하면 된다.

  duration 이 10년 이상일 때는 월평균 통계를 내서 timeAndValueData 값 개수를 축소시킨다.
  {time: "?", value: "?"} 에서
  time : "?" 의 ? 부분 표시는 매월 첫 영업일의 YYYY-MM-DD로 맞추고, vaue는 평균으로 하면 된다.
  */

  if(duration < VALUES.durationYearForWeekAvg) { // 변형없이 그대로 리턴
    return inputList;
  }

  let resultList: {time: string, value: number}[] = [];
  if(duration === VALUES.durationYearForWeekAvg){ // 주 평균 적용
    // 첫 번째 월요일이 나오는 인덱스를 기억해 놓는다.
    let firstMonIdx = 0;
    for(let i=0; i<inputList.length; i++){
      const day = new Date(inputList[i].time).getDay();
      if(day === DAYS.MON){
        firstMonIdx = i;
        break;
      }
    }

    let weekList: {time: string, value: number}[][] = [];
    // 주(월요일 ~ 금요일) 별로 리스트에 담는다.
    for(let i=firstMonIdx; i<inputList.length; i++){
      const plotData = inputList[i];
      const day = new Date(plotData.time).getDay();
      if(weekList.length === 0 || day === DAYS.MON){
        // 최초 입력 또는 월요일인 경우
        weekList.push([]);
        weekList[weekList.length-1].push(plotData);
      } else {
        // 그 밖의 요일
        weekList[weekList.length-1].push(plotData);
      }
    }

    // 주 별로 평균 낸 후 리턴
    for(let i=0; i<weekList.length; i++){
      const list: { time: string, value: number }[] = weekList[i];
      const avg = list.reduce((sum, item) => sum + item.value, 0) / list.length;
      const avgTo3Float = Number(avg.toFixed(VALUES.floatFix));
      resultList.push(
        {time: list[0].time, value: avgTo3Float}
      );
    }
  } else if(duration > VALUES.durationYearForWeekAvg) { // 월 평균 적용
    // Map을 써서 월 별로 모은다.
    let monthMap: Map<string, { time: string, value: number }[]> = new Map();

    for(let i=0; i<inputList.length; i++){
      const elem = inputList[i];
      const monthStr: string = elem.time.substring(0, 7); // "2025-05-25"에서 2025-05 만 가져온다.
      let monthList = monthMap.get(monthStr);
      if(monthList == null || monthList == undefined){
        monthMap.set(monthStr, []); 
      }
      monthMap.get(monthStr)!.push(elem);
    }


    // Map 타입 객체는 Object.entries()가 아니라, .entries() 또는 Array.from()으로 다뤄야 한다.
    // 이걸 Object.entries();로 읽으려고 하면 빈 리스트가 리턴된다.
    const entries = Array.from(monthMap.entries());

    // 각 월별로 첫 영업일 날짜와 평균 값 구해서 별도의 리스트로 모은다.
    // TS에서 Map은 입력 순서가 보존된다.
    for(let i=0; i<entries.length; i++){
      const list: { time: string, value: number }[] = entries[i][1];
      const avg = list.reduce((sum, item) => sum + item.value, 0) / list.length;
      const avgTo3Float = Number(avg.toFixed(VALUES.floatFix));
      resultList.push(
        {time: list[0].time, value: avgTo3Float}
      );
    }
  }
  return resultList;
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

    const kospiSeries = chart.addLineSeries({
      color: COLORS.rolexGreenColor,
      lineWidth: 2,
      title: "",
    });

    // durationYear 값에 맞춰서 원본 데이터의 개수를 줄인다(주 평균 또는 월 평균 적용).
    const timeValueDataForGraph: {time: string, value: number}[] = updateTimeAndValueData(
      timeAndValueData, durationYear
    );

    kospiSeries.setData(
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