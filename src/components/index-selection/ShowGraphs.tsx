import { useState } from "react";
import type { AppMeta } from "../../utils/AppMeta";
import CandleChart from "../../components/test-charts/CandleChart";
import LineChart from "../../components/test-charts/LineChart";
import ChartWithEvent from "../../components/test-charts/ChartWithEvent";

type ShowGraphProps = {
    appMeta: AppMeta;
    currentLang: string;
    duration: number;
    selectedIndicators: Record<string, string[]>;
};

function ShowGraph(
    { 
        appMeta, currentLang, duration, selectedIndicators
    }: ShowGraphProps
) {

    // TODO : API 서버한테 이벤트 리스트 GET 요청 해야한다. 1 번이면 된다.
    // TODO : CDN 서버한테 json들 GET 요청 하되, 5개의 스레드로 concurrent 하게 처리해야 한다.
    // TODO : 이러한 fetch 작업에 시간이 오래 걸린다면 작업이 진행 중이라는 걸 알려주는 게 필요하다.
    // TODO : 그래프별로 한 줄 정도의 간단한 설명이 필요할 수 있다. 예를 들면 '종가 기준' 등등.

    // 상태 정의
    const [showGraphs, setShowGraphs] = useState(false);  // 그래프 표시 여부
    const [loading, setLoading] = useState(false);         // 로딩 중 여부

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

    //console.log("!!! 쇼프래프 내 출력 !!!");
    //Object.entries(sortedIndicators).forEach(([key, val]) =>
    //    console.log(`${key}: ${val[1]}`)
    //);

    // 버튼 클릭 시 로직
    const handleShowGraphs = async () => {
        if (showGraphs) {
            setShowGraphs(false); // 이미 보여지는 중이면 숨기기
            return;
        }

        // 그래프 로딩 시작
        setLoading(true);
        setShowGraphs(false);
        // 실제 fetch 시뮬레이션 (예: API 통신 대기). 나중엔 여기를 실제 API 호출로 바꾼다.
        await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5초 대기

        // 로딩 완료 후 그래프 표시
        setLoading(false);
        setShowGraphs(true);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
                onClick={handleShowGraphs}
                style={{
                    backgroundColor: "#007bff",
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
                    ?  "Hide Graphs"
                    : appMeta["contents-text"][currentLang]["show-graph"] || "Show Graphs"
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