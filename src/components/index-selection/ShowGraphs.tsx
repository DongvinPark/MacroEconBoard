import { useState, useEffect } from "react";
import type { AppMeta } from "../../utils/AppMeta";
import CandleChart from "../../components/test-charts/CandleChart";
import LineChart from "../../components/test-charts/LineChart";
import ChartWithEvent from "../../components/test-charts/ChartWithEvent";
import downloadJsonFilesForGraph from "../../components/downloader/JsonFileDownloader";
import type { Event } from "../../components/downloader/EventJsonDownloader";
import { loadEventsData } from "../../components/downloader/EventJsonDownloader";
import getIndexMeta from "../downloader/FilterIndexMeta";

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
        
        // 실제 fetch 시뮬레이션용(예: API 통신 대기). TODO : 리턴 타입 설정해야 한다!!!
        // React에서는 async 함수를 호출하더라도, await를 앞에 붙여서 호출하지 않으면
        // 말 그대로 'wait'를 하지 않는다.
        const graphDataAsync: GraphData = await downloadJsonFilesForGraph({
            appMeta, currentLang, duration, sortedIndicators
        });
        setGraphData(graphDataAsync);

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
    //    console.log("!!! json download api fecthing 결과 !!!");
    //    console.log(events or graphData)
    //    console.log("!!! 인덱스 메타 찾기 테스트 !!!")
    //    console.log(
    //      //Props 를 정의해서 호출할 때는 인자를 아래와 같은 key-value 쌍의 집합으로 넘겨줘야 한다.
    //      getIndexMeta({meta: appMeta, categoryName: "kr", indexName:"kospi"})
    //    );
    //  }, [events or graphData]
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

            {/* ✅ 그래프 표시. TODO : API 를 통해서 fetch 한 데이터들로 차트들을 만들어야 한다.*/}
            {showGraphs && !loading && (
                <div style={{ textAlign: "left", marginTop: "40px" }}>
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
            )}
        </div>
    );
}

export default ShowGraph;