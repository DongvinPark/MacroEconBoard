import { DAYS } from "../../constants/Day";
import { VALUES } from "../../constants/Values";


export function updateTimeAndValueData(
  inputList: {time: string, value: number}[],
  duration: number
): ({time: string, value: number}|{time: string})[]{
  /*
  duration 값에 따라서 timeAndValueData 를 변형시키되, EMTPY_FOR_GRAPH 도 처리해야 한다.
  lightweight chart 라이브러리로 표시할 수 있는 최대 가로 값 개수가 360 개 정도로 제한돼 있기 때문이다.
  
  duration 이 1 년일 때는 EMTPY_FOR_GRAPH 인 경우만 {time:"YYYY-MM-DD"} 로 바꾸면 된다.

  duration 이 5 년일 때는 월~금 종가 기준 주평균 통계를 내서 timeAndValueData 값 개수를 축소시킨다.
  {time: "?", value: "?"} 에서
  time : "?" 의 ? 부분 표시는 매주 첫 영엽일의 YYYY-MM-DD로 맞추고, value는 평균으로 하면 된다.
  단, 1 개의 영엄일이라도 EMTPY_FOR_GRAPH 를 포함하고 있다면 그 '주'는 무조건 {time:"YYYY-MM-DD"}로 축소시킨다.

  duration 이 10년 이상일 때는 월평균 통계를 내서 timeAndValueData 값 개수를 축소시킨다.
  {time: "?", value: "?"} 에서
  time : "?" 의 ? 부분 표시는 매월 첫 영업일의 YYYY-MM-DD로 맞추고, vaue는 평균으로 하면 된다.
  단, 1 개의 영엄일이라도 EMTPY_FOR_GRAPH 를 포함하고 있다면 그 '월'은 무조건 {time:"YYYY-MM-DD"}로 축소시킨다.
  */

  if(duration < VALUES.durationYearForWeekAvg) { // 일 별 데이터 내의 EMTPY_FOR_GRAPH 처리
    let resultList = [];
    for(let i=0; i<inputList.length; i++){
      if(inputList[i].value == VALUES.EMTPY_FOR_GRAPH){
        resultList.push(
          {time: inputList[i].time}
        );
      } else {
        resultList.push(inputList[i]);
      }
    }
    return resultList;
  }

  let resultList: ({time: string, value: number}|{time: string})[] = [];
  if(duration === VALUES.durationYearForWeekAvg){//주 평균 적용 후 EMTPY_FOR_GRAPH 처리
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

    // 주 별로 평균 내거나, '값 없음' 처리한 후 리턴.
    for(let i=0; i<weekList.length; i++){
      const list: { time: string, value: number }[] = weekList[i];

      let isDummy: boolean = false;
      for(const elem of list){
        if(elem.value == VALUES.EMTPY_FOR_GRAPH){
          isDummy = true;
          break;
        }
      }

      if(isDummy){
        resultList.push(
          {time: list[0].time}
        );
      } else {
        const avg = list.reduce((sum, item) => sum + item.value, 0) / list.length;
        const avgTo3Float = Number(avg.toFixed(VALUES.floatFix));
        resultList.push(
          {time: list[0].time, value: avgTo3Float}
        );
      }
    }
  } else if(duration > VALUES.durationYearForWeekAvg) {// 월 평균 적용 후 EMTPY_FOR_GRAPH 처리
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

    // 각 월별로 첫 영업일 날짜와 평균 값 구하거나, '값 없음' 처리해서 별도의 리스트로 모은다.
    // TS에서 Map은 입력 순서가 보존된다.
    for(let i=0; i<entries.length; i++){
      const list: { time: string, value: number }[] = entries[i][1];

      let isDummy: boolean = false;
      for(const elem of list){
        if(elem.value == VALUES.EMTPY_FOR_GRAPH){
          isDummy = true;
          break;
        }
      }

      if(isDummy){
        resultList.push(
          {time: list[0].time}
        );
      } else {
        const avg = list.reduce((sum, item) => sum + item.value, 0) / list.length;
        const avgTo3Float = Number(avg.toFixed(VALUES.floatFix));
        resultList.push(
          {time: list[0].time, value: avgTo3Float}
        );
      }
    }
  }
  return resultList;
}

export default updateTimeAndValueData;