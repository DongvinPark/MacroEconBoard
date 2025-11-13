import { type AppMeta } from '../../utils/AppMeta'

type JsonFileDownloaderProps = {
    appMeta: AppMeta;
    currentLang: string;
    duration: number;
    sortedIndicators: Record<string, string[]>;
}

type GraphData = Map<
    string, {time: string, value: number}[]
>;

async function downloadJsonFilesForGraph(
    {appMeta, currentLang, duration, sortedIndicators}: JsonFileDownloaderProps
){
    // 실제 api 호출 진행
    // event fetch는 나중에 BE 구축되면 한다.
    // TODO : 404 not found, 각종 예외, 없는 파일들에 대한 처리, 지나치게 오래 걸릴 경우의 처리등
    // TODO : 각종 엣지 케이스들에 대응하면서 coucurrency 를 도입해야 한다.
    const currentYear: number = new Date().getFullYear();
    const cdnRoot: string = appMeta['cdn-root-url'];

    var resultMap: GraphData = new Map();
    const len: number = Object.entries(sortedIndicators).length;
    for(var i = 0; i<len; i++){
        var jsonArr: {time: string, value: number}[] = [];
        const indexName: string = Object.entries(sortedIndicators)[i][0];
        const categoryName: string = sortedIndicators[indexName][0];
        for(
            var startYear = currentYear - duration;
            startYear<currentYear + 1;
            startYear++
        ){
            var reqUrl = cdnRoot;
            if(startYear < currentYear){
                reqUrl += ( 
                    "past-year/" + categoryName + "/" + indexName + "/"
                    + String(startYear) + "-" + indexName + ".json"
                );
            } else {
                reqUrl += ( 
                    "this-year/" + categoryName + "/" + indexName + "/"
                    + String(startYear) + "-" + indexName + ".json"
                );
            }
            const response = await fetch(reqUrl);
            if (!response.ok){
                throw new Error(`HTTP error! status : ${response.status}`);
            }
            const rawData = await response.json();
            var converted;
            if(rawData.length > 0 && "value" in rawData[0]){
                converted = rawData;
            } else {
                converted = rawData.map(({ time, close }) => ({ time, value: close }));
            }
            jsonArr.push(...converted);
        }//inner for

        // put to Map
        resultMap.set(indexName, jsonArr);
    }//outer for

    console.log("!!! api fetch 결과 테스트용 !!!");
    console.log(resultMap);
    return resultMap;
}

export default downloadJsonFilesForGraph;