import { VALUES } from '../../constants/Values';

type JsonFileDownloaderProps = {
    durationFrom: number;
    durationTo: number;
    sortedIndicators: Record<string, string[]>;
}

type GraphData = Map<
    string, {time: string, value: number}[]
>;

async function downloadJsonFilesForGraph(
    { durationFrom, durationTo, sortedIndicators }: JsonFileDownloaderProps
) {
    const currentYear = new Date().getFullYear();
    const cdnRoot = import.meta.env.VITE_CDN_ROOT_URL;
    const resultMap: GraphData = new Map();
    // 동시성 제한 함수 (p-limit 방식을 따르도록 구현)
    const limiter = createLimiter(VALUES.jsonDownloaderThreadCnt); // 최대 동시 실행 태스크 개수 제한

    let longestDataList: {time:string, value:number}[] = [];

    // 각 indexName 별로 전체 요청을 모아서 병렬 실행
    for (const [indexName, [categoryName]] of Object.entries(sortedIndicators)) {
        const tasks: Promise<{ time: string; value: number }[]>[] = [];

        // 이 루프에서는 Promise 타입 태스크들을 만들어서 tasks 라는 일종의 큐에 집어 넣으며 실행시킨다.
        for (let year = durationFrom; year <= durationTo; year++) {
            const isPast = year < currentYear;
            const base = isPast ? "past-year" : "this-year";

            const url =
                `${cdnRoot}${base}/${categoryName}/${indexName}/` +
                `${year}-${indexName}.json`;

            // limit() 안에 fetch 작업을 넣어 동시성 제한
            const task = limiter(
                async () => {
                    const res = await fetch(url);
                    if (!res.ok) return []; // 404 등 무시 (엣지 케이스 대응 코드 추가할 수 있음)

                    const raw = await res.json();
                    if (raw.length > 0 && "value" in raw[0]) {
                        return raw; // 이미 { time, value } 타입의 json일 경우.
                    } else {
                        // {time, open, high, ..., close} 같은 캔들형 json일 경우.
                        return raw.map(
                            ( { time, close }: any ) => ( {time, value: close} )
                        );
                    }
                }
            );
            tasks.push(task);
        }
        // indexName 의 모든 연도 fetch가 완료될 때까지 '기다린다'.
        const allResults = (await Promise.all(tasks)).flat();

        resultMap.set(indexName, allResults);
    }

    // resultMap에서 가장 이른 날짜 데이터를 가지고 있는 지표를 찾아낸다.
    let earliestKey: string | null = null;
    let earliestDate: string | null = null;
    for (const [key, list] of resultMap.entries()) {
        if (!list.length) continue;

        const firstDate = list[0].time; // 이미 정렬돼 있음.

        if (!earliestDate || firstDate < earliestDate) {
            earliestDate = firstDate;
            earliestKey = key;
            longestDataList = list;
        }
    }

    // 최종 렌더링 되는 그래프들의 X 축 시간 범위 통일을 위해서, 첫 데이터 시작 날짜가 더 늦는 지표들의 데이터는
    // dummy date 들로 채운다.
    // 예를 들어서, KOSPI는 첫 날짜가 1980 년대에 있지만, Bitcoin(BTC)은 첫 공식 데이터의 날짜가 2014년부터다.
    // kospi와 BTC를 둘다 2025년 기준 '최근 20년'으로 조회한다면,
    // BTC는 2005년부터 2013년까지를 dummy data로 채우는 것.
    for(const allResults of resultMap.values()){
        const curIdxFirstDate: Date = new Date(allResults[0].time);
        for(let i=0; i<longestDataList.length; i++){
            const curDummyDateStr: string = longestDataList[i].time;
            if(new Date(curDummyDateStr).getTime() < curIdxFirstDate.getTime()){
                allResults.push(
                    {time: curDummyDateStr, value: VALUES.EMTPY_FOR_GRAPH}
                );
            }
        }
        // 시간순 정렬(그래프 그릴 때 사용돼야 하므로)
        allResults.sort((a, b) => a.time.localeCompare(b.time));
    }

    return resultMap;
}


// --- 동시성 제한기 (p-limit 대체) ---
/*
Javascript, Typescript는 Java/C++의 스레드 개념이 없다.
대신 '이벤트 루프' + 'Promise 객체'로 동시성을 제어한다.
즉 스레드 풀, 세마포어, 뮤텍스 대신
Promise를 큐에 넣어 두고 순서대로 resolve 해주는 방식으로 동시성을 제한한다.
*/
function createLimiter(max: number) {
    // createLimiter 함수는 함수 객체를 리턴하는 팩토리 함수다. Java/C++ 의 클래스와 거의 똑같이 기능한다.
    let running = 0;
    const queue: Function[] = [];

    // JS/TS 에서는 함수도 객체 취급이다. 변수처럼 정의 및 리턴 될 수 있다.
    const next = () => {
        if (running >= max) return;
        const fn = queue.shift(); // queue.poll()과 같다.
        if (!fn) return;
        running++;
        fn().finally( // 여기가 실제 비동기 fetching 작업을 처리하는 곳이다.
            () => {
                running--;
                next();
            }
        );
    };

    /*
    limiter<T> 에서 T는 프로미스의 결과물의 타입이다.
    프로미스가 어떤 타입을 다룰지 모르기 때문에 generic T로 쓴 것.
    */
    return function limiter<T>(
        fn: () => Promise<T>//limiter 라는 함수는 아무 입력을 받지 않고 프로미스를 반환하는 함수 1 개를 인자로서 받는다.
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const run = () => fn().then(resolve).catch(reject);
            queue.push(run);
            next(); // 바로 위에 정의돼 있는 next 라는 함수객체를 실행시킨다.
        });
    };
}

export default downloadJsonFilesForGraph;