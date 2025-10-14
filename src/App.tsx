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
  const [lang, setLang] = useState<string>("ko");

  // 유저가 선택한 indicator 기록용
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const handleIndicatorSelectionChange = (key: string, checked: boolean) => {
    setSelectedIndicators(
      (prev) => {
        if(checked) {
          // 중복 방지 + 추가
          return [...new Set([...prev, key])];
        } else {
          // 체크 해제 시 제거
          return prev.filter( (item) => item !== key );
        }
      }
    );
  };

  useEffect( // useEffect는 렌더링 이외의 작업(fetch 등)에 사용하는 리액트 훅이다.
    // useEffect 내부에서 호출된 () => {...}, [] 는
    // Run this effect once, when the component first mounts. 라는 뜻이다.
    () => {
      // (async () => {...})();는
      // Immediately Invoked Async Function Expression (IIAFE) 다.
      // async task를 수행하는 함수를 정의하는 즉시 실행되게 만든다.
      (async () => {
        const loadedMeta = await loadAppMeta();
        setMeta(loadedMeta);
      })();
    }, []
  );

  // 테스트용 체크박스 선택창에서 ✅ 표시 상태가 바뀔 때마다 콘솔에 찍어보기
  // useEffect(
  //   () => {
  //     console.log("✅ 현재 선택된 key:", selectedIndicators);
  //   }, [selectedIndicators]
  // ); // <- selectedKeys가 바뀔 때마다 실행

  if(!meta) return (<div>Loading...</div>);

  const uiContentTextMap: ContentsTextWithTranslation = meta["contents-text"];
  // default 언어는 한국어(ko).
  const currentText: UiContentText = uiContentTextMap[lang] ?? uiContentTextMap["ko"];

  return (
  <div>
    <h1>{meta.title}</h1>
    <h2>{currentText.catchphrase}</h2>
    <br></br>
    {/*
        SelectLang.tsx 에서 정의 해놓은 Props 타입의 property 필드들과,
        바로 아래의 코드와 같이
        SelectLang 태그를 실제로 호출하면서 넘겨주는 property 들의 이름이 일치해야 한다.
    */}
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
    }</h2>
    <CheckBox 
      appMeta={meta}
      availableCategories={Object.keys(meta.index)}
      currentLang={lang}
      selectedIndicators={selectedIndicators}
      onChangeSelection={handleIndicatorSelectionChange}
    />
    <br></br>
    <br></br>

    <DurationSelection />
    <br></br>

    <ShowGraph
      appMeta={meta}
      currentLang={lang}
     />
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
