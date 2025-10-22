import type { AppMeta } from "../../utils/AppMeta";
import CandleChart from "../../components/test-charts/CandleChart";
import LineChart from "../../components/test-charts/LineChart";
import ChartWithEvent from "../../components/test-charts/ChartWithEvent";

type ShowGraphProps = {
    appMeta: AppMeta;
    currentLang: string;
    duration: number;
    selectedIndicators: Record<string, string[]>;
}

function ShowGraph(
    { appMeta, currentLang, duration, selectedIndicators }: ShowGraphProps
){
    /*
    { kospi: ["kr", "001"], kosdaq: ["kr", "002"] } 과 같은 Record를
    "001" 부분의 문자열로 오름차순 정렬한다. 이렇게 함으로써
    유저의 인덱스 선택 순서와 상관없이 인덱스 선택창에서 나열한 순서대로 그래프들을 보여준다.
    */
    const sortedIndicators = Object.entries(selectedIndicators) // 객체를 배열로 만든다.
        .sort( (a,b) => a[1][1].localeCompare(b[1][1]) ) // 배열을 정렬한다.
        .reduce( // 배열을 다시 객체로 만든다.
            (accResult, [key, value]) => { // acc 는 accumulator를 축약한 컨벤션이다.
                accResult[key] = value;
                return accResult;
            }, {} as Record<string, string[]>
        );

    // TODO : API 서버한테 이벤트 리스트 GET 요청 해야한다. 1 번이면 된다.
    // TODO : CDN 서버한테 json들 GET 요청 하되, 5개의 스레드로 concurrent 하게 처리해야 한다.
    // TODO : 이러한 fetch 작업에 시간이 오래 걸린다면 작업이 진행 중이라는 걸 알려주는 게 필요하다.
    // TODO : 그래프별로 한 줄 정도의 간단한 설명이 필요할 수 있다. 예를 들면 '종가 기준' 등등.

    return(
        <div>
            <button>
                {appMeta['contents-text'][currentLang]["show-graph"]}
            </button>

            <div>
                <h2 style={{ color: "green" }}>Test Candle Chart</h2>
                <p>{"test meta data 1"}</p>
                <CandleChart />

                <h2 style={{ color: "green" }}>{"Test line Chart" + "(" + "%" + ")"}</h2>
                <p>{/* empty meta data */}</p>
                <LineChart />

                <h2 style={{ color: "green" }}>Test Chart with Event</h2>
                <p>{"test meta data 2"}</p>
                <ChartWithEvent />
            </div>
        </div>
    );
}

export default ShowGraph;