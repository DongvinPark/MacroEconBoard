
export const VALUES = {

    defaultLang: "ko",
    jsonDownloaderThreadCnt: 10, //(실제 AWS Cloudfront 환경에서 안정적인 값)
    floatFix: 3,
    durationYearForWeekAvg: 5,
    chartHeight: 300,

    endDateForOnGoingEvent: new Date("2100-12-31"),

    // 그래프 렌더링 시, '값이 없는 시간'를 표시하기 위한 데이터를 만들 때 사용함.
    EMTPY_FOR_GRAPH: Number.MIN_SAFE_INTEGER, 

    elapsedTimeThresholdMs: 150,
    moveThreshold: 5,

} as const;