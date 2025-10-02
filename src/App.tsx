import { useEffect, useState } from "react";
import CandleChart from "./components/test-charts/CandleChart";
import LineChart from "./components/test-charts/LineChart";
import CandleChartsWithEvent from "./components/test-charts/CandleChartsWithEvents";
import CheckBox from "../src/components/index-selection/CheckBox"
import DurationSelection from "./components/index-selection/Duration";
import ShowGraph from "./components/index-selection/ShowGraphs";
import SelectLang from "./components/languiage/SelectLang";
import { loadAppMeta, type AppMeta, type Category, type ContentsTextWithTranslation, type CountryLanguageMap, type UiContentText } from "./utils/AppMeta";

function App() {

  // TODO - 테스트용
  // (async () => {
  //   const meta = await loadAppMeta();
  //   console.log(meta["contents-text"]["ko"].catchphrase);
  //   console.log(meta.index["kr"][0].items[0].name["ko"])
  // })();

  const [meta, setMeta] = useState<AppMeta | null>(null);

  // default 언어는 한국어
  const [lang, setLang] = useState<string>("");

  useEffect(
    () => {
      (async () => {
        const loadedMeta = await loadAppMeta();
        setMeta(loadedMeta);
      })();
    }, []
  );

  if(!meta) return (<div>Loading...</div>);

  const uiContentTextMap: ContentsTextWithTranslation = meta["contents-text"];
  // default 언어는 한국어(ko).
  const currentText: UiContentText = uiContentTextMap[lang] ?? uiContentTextMap["ko"];

  return (
  <div>
    <h1>{meta.title}</h1>
    <h2>{currentText.catchphrase}</h2>
    <br></br>
    <SelectLang
      appMeta={meta}
      availableLangs={Object.keys(meta["contents-text"])}
      currentLang={lang}
      onChangeLang={(newLang) => setLang(newLang)}
    />
    <br></br>

    <h2>{
      currentText["select-index-words"][0] +
      meta["max-index-cnt"] +
      currentText["select-index-words"][1]
      }
    </h2>
    <CheckBox />
    <br></br>
    <br></br>

    <DurationSelection />
    <br></br>

    <ShowGraph />
    <br></br>
    <br></br>

    <div>
      <h2 style={{ color: "green" }}>Test Candle Chart</h2>
      <CandleChart />

      <h2 style={{ color: "green" }}>Test line Chart</h2>
      <LineChart />

      <h2 style={{ color: "green" }}>Test Candle + Events Chart</h2>
      <CandleChartsWithEvent />
    </div>
    <div>
      <h3>{currentText["customer-service"] + "\t" + meta["developer-email"]}</h3>
    </div>
  </div>
);
}

export default App;
