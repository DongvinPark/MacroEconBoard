
export const VALUES = {

    defaultLang: "ko",
    jsonDownloaderThreadCnt: 10, //(실제 AWS Cloudfront 환경에서 안정적인 값)
    floatFix: 3,
    durationYearForWeekAvg: 5,
    chartHeight: 300,

    endDateForOnGoingEvent: new Date("2100-12-31"),

    emptyStr: "",

    // 그래프 렌더링 시, '값이 없는 시간'를 표시하기 위한 데이터를 만들 때 사용함.
    EMTPY_FOR_GRAPH: Number.MIN_SAFE_INTEGER, 

    elapsedTimeThresholdMs: 150,
    moveThreshold: 5,

    // 그래프에 이벤트 렌더링 할 때, 렌더링 대상 이벤트 구분하기 위한 기준 기간
    eventRenderYearDuration: 2,

    // 이벤트 중요도
    mostImportantEvent: 3,
    secondaryImportantEvent: 2,
    thirdImportantEvent: 1

} as const;