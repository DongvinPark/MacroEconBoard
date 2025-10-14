import type { AppMeta } from "../../utils/AppMeta";

type ShowGraphProps = {
    appMeta: AppMeta;
    currentLang: string;
}

function ShowGraph(
    { appMeta, currentLang }: ShowGraphProps
){
    return(
        <button>
            {appMeta['contents-text'][currentLang]["show-graph"]}
        </button>
    );
}

export default ShowGraph;