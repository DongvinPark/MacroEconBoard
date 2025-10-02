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
  "show-graph": string;
  "customer-service": string;
};

export type ContentsTextWithTranslation = Record<string, UiContentText>;

export type AppMeta = {
    "meta-version": string;
    "developer-email": string;
    "cdn-root-url": string;
    "supporting-duration-years": number[];
    title: string;
    "max-index-cnt": number;
    "country-language": CountryLanguageMap;
    "contents-text": ContentsTextWithTranslation;
    index: Record<string, Category[]>;
}
// ex : {"ko" : UiContentText }

// 아래의 함수는 Promise<any>를 리턴한다.
// 이 함수를 호출하는 쪽에서 Async 한 처리를 해줘야 한다.
export async function loadAppMeta(): Promise<AppMeta> {
    const response = await fetch("http://localhost:8554/meta/app/app-meta-000.json");
    if (!response.ok){
        throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data as Promise<AppMeta>;
}