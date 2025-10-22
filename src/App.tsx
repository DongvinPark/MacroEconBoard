import { useEffect, useState } from "react";
import CheckBox from "../src/components/index-selection/CheckBox"
import DurationSelection from "./components/index-selection/Duration";
import ShowGraph from "./components/index-selection/ShowGraphs";
import SelectLang from "./components/languiage/SelectLang";
import { loadAppMeta, type AppMeta, type ContentsTextWithTranslation, type UiContentText } from "./utils/AppMeta";

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
  const [selectedIndicators, setSelectedIndicators] = useState<Record<string, string[]>>({});
  const handleIndicatorSelectionChange = (
    key: string,
    firstCategoryName: string,
    idxStr: string,
    checked: boolean
  ) => {
    const value = [firstCategoryName, idxStr];
    setSelectedIndicators(prev => {
      const next = { ...prev };
      if (checked) {
        // ✅ add or update key
        next[key] = value;
      } else {
        // ❌ remove key when unchecked
        delete next[key];
      }
      return next;
    });
  };

  // 기간 선택 : default 기간은 최근 1 년
  const [duration, setDuration] = useState<number>(1);

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

  //테스트용 체크박스 선택창에서 ✅ 표시 상태가 바뀔 때마다 콘솔에 찍어보기
  // useEffect(
  //   () => {
  //     console.log("✅ 현재 선택된 key:", selectedIndicators);
  //     console.log(" 현재 선택된 기간 : ", duration)
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

    <DurationSelection
      appMeta={meta}
      currentLang={lang}
      onChangeDuration={(newDuration) => setDuration(newDuration)}
    />
    <br></br>

    <ShowGraph
      appMeta={meta}
      currentLang={lang}
      duration={duration}
      selectedIndicators={selectedIndicators}
     />
    <br></br>
    <br></br>

    <div>
      <h3>{currentText["customer-service"] + "\t" + meta["developer-email"]}</h3>
    </div>
  </div>
);
}

export default App;
