import { useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
  Container,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import CheckBox from "../src/components/index-selection/CheckBox"
import DurationSelection from "./components/index-selection/Duration";
import ShowGraph from "./components/index-selection/ShowGraphs";
import SelectLang from "./components/languiage/SelectLang";
import { loadAppMeta, type AppMeta, type ContentsTextWithTranslation, type UiContentText } from "./utils/AppMeta";

import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import SettingsIcon from "@mui/icons-material/Settings";

function App() {
  const leftSidebarWidth = 23;

  // TODO - 테스트용
  // (async () => {
  //   const meta = await loadAppMeta();
  //   console.log(meta["contents-text"]["ko"].catchphrase);
  //   console.log(meta.index["kr"][0].items[0].name["ko"])
  // })();

  // app meta 다운로드. 웹앱 구동 시 필수.
  const [meta, setMeta] = useState<AppMeta | null>(null);
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

  // 검색 기록 보관용
  const [searchRecord, setSearchRecord] = useState< Map<string, Record<string, string[]>> >();
  const handleSearchRecrod = (
    curSearch: Record<string, string[]>
  ) => {
    //기록 중 가장 최근 것과 넘겨 받은 elem을 비교한다.
    //둘이 같으면 기록하지 않고, 같지 않으면 last append 방식으로 기록한다.
    const latest = searchRecord?.keys().next().value;

    var keyCompare = true;
    var valueCompare = true;
    
    if(latest?.length != curSearch.keys.length){
      keyCompare = false;
      valueCompare = false;
    } else {
      const latestRecordOjt = Object.entries(latest);
      const curSearchOjt = Object.entries(curSearch);
      for (let i = 0; i<latestRecordOjt.length; i++) {
        if(latestRecordOjt[i][0] == curSearchOjt[i][0]){
          // ex : {"kr", {"kospi", "000"}} 에서 kr 부분이 같은 것이므로, 내부의 {"kospi", "000"} 부분을 비교해야 한다.
          if(
            latestRecordOjt[i][0][0] != curSearchOjt[i][0][0] ||
            latestRecordOjt[i][0][1] == curSearchOjt[i][0][1]
          ){
            keyCompare = false;
            valueCompare = false;
            break;
          }
        } else {
          keyCompare = false;
          valueCompare = false;
          break;
        }
      }
    }

    if(keyCompare && valueCompare){
      // do noting
    } else {
      const now = new Date();
      const utcString = now.toISOString();
      searchRecord?.set(utcString, curSearch);
      setSearchRecord(
        // ??
      );
    }
  };

  //테스트용 체크박스 선택창에서 ✅ 표시 상태가 바뀔 때마다 콘솔에 찍어보기
  useEffect(
    () => {
      console.log("✅ 현재 선택된 key:", selectedIndicators);
      console.log(" 현재 선택된 기간 : ", duration)
    }, [selectedIndicators]
  ); // <- selectedKeys가 바뀔 때마다 실행

  if(!meta) return (<div>Loading...</div>);

  const uiContentTextMap: ContentsTextWithTranslation = meta["contents-text"];
  // default 언어는 한국어(ko).
  const currentText: UiContentText = uiContentTextMap[lang] ?? uiContentTextMap["ko"];

  return (
  <div>
    {/*Left Sidebar*/}
    <Drawer
      variant="permanent"
      sx={{
        width: leftSidebarWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: leftSidebarWidth,
          boxSizing: "border-box",
          backgroundColor: "#1e1e1e",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Toolbar />
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        {/* 상단 아이콘들 */}
        <Stack spacing={2} alignItems="center">
          
          <IconButton color="inherit">
            <AccessTimeIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ width: "80%", backgroundColor: "#444" }} />

        {/* 하단 아이콘 (예: 설정) */}
        <IconButton color="inherit">
          <SettingsIcon />
        </IconButton>
      </Box>
    </Drawer>

    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: `${leftSidebarWidth}px`, // ← 사이드바 폭만큼 오른쪽으로 밀기
        p: 2,
      }}
    >
      {/*Header*/}
      <Box
        component="header"
        sx={{
          backgroundColor: "#1e1e1e",
          color: "#fff",
          p: 2,
        }}
      >
        <Typography variant="h5">{meta.title}</Typography>
        <Typography variant="subtitle1" sx={{ color: "gray", mt: 0.5 }}>
          {currentText.catchphrase}
        </Typography>
      </Box>
      <br></br>

      <br></br>
      {/*
        MAIN CONTENTS
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

      <h3>{
        currentText["select-index-words"][0] +
        meta["max-index-cnt"] +
        currentText["select-index-words"][1]
      }</h3>
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

      {/*Footer*/}
      <Box sx={{ textAlign: "center", color: "#777", mt: 6, width: "100%" }}>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2">
          {currentText["customer-service"] + " " + meta["developer-email"]}
        </Typography>
      </Box>
    </Box>
  </div>
);
}

export default App;
