import { useState, useEffect } from "react";
import type { AppMeta, IndexItem } from "../../utils/AppMeta";
import CandleChart from "../../components/test-charts/CandleChart";
import LineChart from "../../components/test-charts/LineChart";
import ChartWithEvent from "../../components/test-charts/ChartWithEvent";
import downloadJsonFilesForGraph from "../../components/downloader/JsonFileDownloader";
import type { Event } from "../../components/downloader/EventJsonDownloader";
import { loadEventsData } from "../../components/downloader/EventJsonDownloader";
import { getIndexMetaList } from "../downloader/FilterIndexMeta";

type ShowGraphProps = {
    appMeta: AppMeta;
    currentLang: string;
    duration: number;
    selectedIndicators: Record<string, string[]>;
};

type GraphData = Map<
    string, {time: string, value: number}[]
>;

function ShowGraph(
    { 
        appMeta, currentLang, duration, selectedIndicators
    }: ShowGraphProps
) {

    // 상태 정의
    const [showGraphs, setShowGraphs] = useState(false);  // 그래프 표시 여부
    const [loading, setLoading] = useState(false);         // 로딩 중 여부

    const [graphData, setGraphData] = useState(new Map()); // 실제 그래프 표시용 데이터
                        // useState<...>(...); 여기에서 <> 안의 ... 부분에 타입을 꼭 정의해줘야 한다.
    const [graphMeta, setGraphMeta] = useState<IndexItem[]>([]); // 그래프 표시용 메타데이터
    const [events, setEvents] = useState<Event[]>(); // 이벤트 정보

    /*
    { kospi: ["kr", "000"], kosdaq: ["kr", "001"] } 과 같은 Record를
    "001" 부분의 문자열로 오름차순 정렬한다. 이렇게 함으로써
    유저의 인덱스 선택 순서와 상관없이 인덱스 선택창에서 나열한 순서대로 그래프들을 보여준다.
    */
    const sortedIndicators = Object.entries(selectedIndicators)
        .sort((a, b) => a[1][1].localeCompare(b[1][1]))
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, string[]>);

    //console.log("!!! 쇼그래프 API 호출용 인디케이터 선택 리스트 출력 !!!");
    // Object.entries(sortedIndicators).forEach(([key, val]) =>
    //    console.log(`${key}: ${val[1]}`)
    // );

    // 버튼 클릭 시 로직
    const handleShowGraphs = async () => {
        // 이미 보여지는 중이면 새 탭에서 새 검색을 진행하게 만든다.
        // 탭이 곳 검색 기록 역할을 하게 된다.
        if (showGraphs) {
            window.open("http://localhost:5173");
            return;
        }

        // 그래프 로딩 시작
        setLoading(true);
        setShowGraphs(false);
        
        // React에서는 async 함수를 호출하더라도, await를 앞에 붙여서 호출하지 않으면
        // 말 그대로 'wait'를 하지 않는다.
        const graphDataAsync: GraphData = await downloadJsonFilesForGraph({
            appMeta, currentLang, duration, sortedIndicators
        });
        setGraphData(graphDataAsync);

        // 그래프 메타데이터 검색 후 초기화
        const graphMeta: IndexItem[] = getIndexMetaList(appMeta, sortedIndicators);
        setGraphMeta(graphMeta);

        // 이벤트 정보 다운로드
        const loadedEvents: Event[] = await loadEventsData();
        setEvents(loadedEvents);

        // 로딩 완료 후 그래프 표시
        setLoading(false);
        setShowGraphs(true);
    };

    // fetching api 호출 결과 테스트용
    // useEffect(
    //  () => {
    //    console.log("!!! json fetching OR index meta OR event json !!!")
    //    console.log(
    //      //Props 를 정의해서 호출할 때는 인자를 아래와 같은 key-value 쌍의 집합으로 넘겨줘야 한다.
    //      graphMeta or graphData or events
    //    );
    //  }, [graphMeta or graphData or events]
    // ); // <- graphData 가 바뀔 때마다 실행

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
                onClick={handleShowGraphs}
                style={{
                    backgroundColor: "#00703C",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "none",
                }}
            >
                {loading
                    ? "Loading..."
                    : showGraphs
                    ?  appMeta["contents-text"][currentLang]["new-search"]
                    : appMeta["contents-text"][currentLang]["show-graph"]
                }
            </button>

            {/* 로딩 중일 때 스피너 표시 */}
            {loading && (
                <div style={{ marginTop: "40px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            margin: "0 auto",
                            border: "6px solid #f3f3f3",
                            borderTop: "6px solid #007bff",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                        }}
                    />
                    <p style={{ marginTop: "10px" }}>Loading charts...</p>

                    {/* 인라인 keyframes */}
                    <style>
                        {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </div>
            )}

            {/*
            >>> 그래프 렌더링용 컴포넌트에 인자들 전달할 때 필요한 데이터들 정리.
            graphData : Map< string, {time: string, value: number}[] > 타입.
                      : ex : { kospi, [ {time, value}, ..., {time, value}] } 이런 모양이다.
            graphMeta : IndexItem[] 타입. 그래프의 제목, Y축 단위, 부연 설명 이 3 가지를 언어에 맞춰 렌더링.
                        IndexItem 내의 key 필드의 값을 가지고, graphData 맵에서 get()을 호출하면 된다.
            events : 그래프마다 그냥 그대로 넘긴다. Event[] 타입. 렌더링은 Chart 류 컴포넌트에서 담당한다.
            */}
            {showGraphs && !loading && (
                <div style={{ textAlign: "left", marginTop: "40px" }}>
                {
                    graphMeta.map(
                        (indicatorMeta) => (
                            <div key={indicatorMeta.key}>
                                <h2 style={{ color: "green" }}>
                                    {indicatorMeta.name[currentLang] + (
                                        indicatorMeta["y-axis-unit"] === "" ?
                                        "" : ( "(" + indicatorMeta["y-axis-unit"] + ")" )
                                    )}
                                </h2>
                                <p>{indicatorMeta.info[currentLang]}</p>
                                <ChartWithEvent
                                    timeAndValueData={graphData.get(indicatorMeta.key)}
                                    eventData={events === undefined ? [] : events}
                                    graphName={graphMeta[0].key}
                                />
                            </div>
                        )
                    )
                }
                </div>
            )}
        </div>
    );
}

export default ShowGraph;