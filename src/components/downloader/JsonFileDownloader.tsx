import { type AppMeta } from '../../utils/AppMeta'

type JsonFileDownloaderProps = {
    appMeta: AppMeta;
    currentLang: string;
    duration: number;
    sortedIndicators: Record<string, string[]>;
}

async function downloadJsonFilesForGraph(
    {appMeta, currentLang, duration, sortedIndicators}: JsonFileDownloaderProps
){
    // 실제 api 호출 진행
    console.log("!!! 앱메타 !!!");
    console.log(appMeta);
    console.log("!!! 현재 언어 !!!");
    console.log(currentLang);
    console.log("!!! 기간 !!!");
    console.log(duration);
    console.log("!!! 인덱스 맵 !!!");
    console.log(sortedIndicators);

    // 1.5초(1500ms) 강제 지연 : API 호출로 인한 네트워크 지연 
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("!!! 네트워킹 끝 !!!");
}

export default downloadJsonFilesForGraph;