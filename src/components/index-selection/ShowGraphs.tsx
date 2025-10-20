import type { AppMeta } from "../../utils/AppMeta";
import CandleChart from "../../components/test-charts/CandleChart";
import LineChart from "../../components/test-charts/LineChart";
import ChartWithEvent from "../../components/test-charts/ChartWithEvent";

type ShowGraphProps = {
    appMeta: AppMeta;
    currentLang: string;
}

function ShowGraph(
    { appMeta, currentLang }: ShowGraphProps
){
    return(
        <div>
            <button>
                {appMeta['contents-text'][currentLang]["show-graph"]}
            </button>

            <div>
                <h2 style={{ color: "green" }}>Test Candle Chart</h2>
                <CandleChart />

                <h2 style={{ color: "green" }}>{"Test line Chart" + "(" + "%" + ")"}</h2>
                <LineChart />

                <h2 style={{ color: "green" }}>Test Chart with Event</h2>
                <ChartWithEvent />
            </div>
        </div>
    );
}

export default ShowGraph;