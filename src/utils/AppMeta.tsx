// json으로 표현한 메타데이터를 위한 타입을 정의할 때는 가장 작은 단위부터 정의한다.
// 그 후, '작은' 단위들을 활용해서 json 메타데이터 자체를 표현하는 가장 큰 타입을 정의한다.

export type CountryLanguageMap = Record<string, string>;
// ex) {"kr" : "ko","us" : "en"}

export type LocalizedIndexText = Record<string, string>;
// ex) { "ko": "국채 3년물", "en": "3-Year Korea Treasury Bond" }

export type LocalizedCategoryText = Record<string, string>;
// ex) {"ko": "주가지수", "en": "Stock Market Index"}

export type IndexItem = {
    key: string;
    name: LocalizedIndexText; // 언어별 지표명
    info: LocalizedIndexText; // 언어별 메타데이터 또는 별도 설명용 정보
    "y-axis-unit": string; // "", "%", "$", "원" 등
};

export type Category = {
    "category-name": LocalizedCategoryText;
    items: IndexItem[]
}

export type UiContentText = {
  native: string; // 언어명 자기 표현
  catchphrase: string;
  "select-index-words": string[];
  "select-duration": string;
  country: Record<string, string>; // "kr": "한국", "us": "미국"
  "duration-year-word": string[];
  "no-selection-warning": string;
  "selection-limit-exceed": string;
  "invalid-duration" : string,
  "duration-limit-exceed": string[],
  "week-avg": string,
  "month-avg": string,
  "show-graph": string;
  "new-search": string;
  "customer-service": string;
};

export type ContentsTextWithTranslation = Record<string, UiContentText>;

export type AppMeta = {
    "app-version": string;
    "developer-email": string;
    "max-duration-year": number;
    "earliest-year": number;
    title: string;
    "max-index-cnt": number;
    "max-search-record-cnt": number;
    "country-language": CountryLanguageMap;
    "contents-text": ContentsTextWithTranslation;
    index: Record<string, Category[]>;
}


export async function loadAppMeta(): Promise<AppMeta> {
    const response = await fetch(import.meta.env.VITE_APP_META_DOWNLOAD_URL);
    if (!response.ok){
        throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    //console.log(data);
    return data as Promise<AppMeta>;
}