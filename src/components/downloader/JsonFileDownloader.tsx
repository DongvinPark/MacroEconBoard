import { VALUES } from '../../constants/Values';
import { PromiseLimiter } from './PromiseLimiter';

type JsonFileDownloaderProps = {
    durationFrom: number;
    durationTo: number;
    sortedIndicators: Record<string, string[]>;
}

type GraphDataItem = { time: string; value: number };
type GraphData = Map<
    string, {time: string, value: number}[]
>;

async function downloadJsonFilesForGraph(
    { durationFrom, durationTo, sortedIndicators }: JsonFileDownloaderProps
): Promise<GraphData> {
    const currentYear = new Date().getFullYear();
    const cdnRoot = import.meta.env.VITE_CDN_ROOT_URL;
    const resultMap: GraphData = new Map();
    
    // 1. 모든 파일 다운로드 태스크를 담을 단일 배열 선언
    const allIndicatorTasks: Promise<void>[] = [];
    const limiter = new PromiseLimiter(VALUES.jsonDownloaderThreadCnt);

    // 2. 큐에 모든 태스크를 병렬로 먼저 주입
    for (const [indexName, [categoryName]] of Object.entries(sortedIndicators)) {
        const yearTasks: Promise<GraphDataItem[]>[] = [];

        for (let year = durationFrom; year <= durationTo; year++) {
            const isPast = year < currentYear;
            const base = isPast ? "past-year" : "this-year";
            const url = `${cdnRoot}${base}/${categoryName}/${indexName}/${year}-${indexName}.json`;

            // 각 파일 다운로드를 PromiseLimiter 에 태움
            const task = limiter.run(async () => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) return [];

                    const raw = await res.json();
                    if (raw.length > 0 && "value" in raw[0]) {
                        return raw as GraphDataItem[];
                    }
                    return raw.map(({ time, close }: any) => ({ time, value: close }));
                } catch (error) {
                    console.error(`Failed to fetch: ${url}`, error);
                    return [];
                }
            });
            yearTasks.push(task);
        }

        // 지표별로 묶어서 결과를 resultMap에 세팅하는 흐름을 하나의 상위 프로미스로 관리
        const indicatorProcess = Promise.all(yearTasks).then((results) => {
            resultMap.set(indexName, results.flat());
        });
        
        allIndicatorTasks.push(indicatorProcess);
    }

    // 3. 글로벌 큐에 쌓인 200~300개의 다운로드가 동시성 제한 개수(ThreadCnt)만큼 동시에 완료됨
    await Promise.all(allIndicatorTasks);

    // 4. 가장 데이터 범위가 넓은(가장 이른 날짜) 기준 데이터 리스트 찾기
    let longestDataList: GraphDataItem[] = [];
    let earliestTime = "";

    for (const list of resultMap.values()) {
        const firstItemTime = list[0]?.time; // 🛠️ Optional chaining으로 안전하게 접근
        if (!firstItemTime) continue;

        if (!earliestTime || firstItemTime < earliestTime) {
            earliestTime = firstItemTime;
            longestDataList = list;
        }
    }

    // 5. 기준 데이터셋 기반으로 빈 데이터 구간 Dummy Data 채우기
    const longestDataTimes = longestDataList.map(item => item.time);

    for (const [indexName, allResults] of resultMap.entries()) {
        // 데이터가 아예 없는 지표 처리
        if (allResults.length === 0) {
            const dummyList = longestDataTimes.map(time => ({ time, value: VALUES.EMTPY_FOR_GRAPH }));
            resultMap.set(indexName, dummyList);
            continue;
        }

        // 데이터가 일부 늦게 시작하는 지표 처리
        const curIdxFirstTime = allResults[0].time;
        const dummyItems: GraphDataItem[] = [];

        for (const targetTime of longestDataTimes) {
            if (targetTime < curIdxFirstTime) {
                dummyItems.push({ time: targetTime, value: VALUES.EMTPY_FOR_GRAPH });
            } else {
                break; // 정렬되어 있으므로 더 이상 검사할 필요 없음 (성능 최적화)
            }
        }//inner for

        if (dummyItems.length > 0) {
            // 원본 데이터 앞에 더미 데이터를 안전하게 병합 후 재정렬
            const merged = [...dummyItems, ...allResults];
            merged.sort((a, b) => a.time.localeCompare(b.time));
            resultMap.set(indexName, merged);
        }
    }//outer for

    return resultMap;
}

export default downloadJsonFilesForGraph;