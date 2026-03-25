import { VALUES } from "../../constants/Values";

export type RawEvent = {
    startDate: string;
    endDate: string;
    titleKr: string;
    titleEn: string;
    descriptionKr: string;
    descriptionEn: string;
    locationKr: string;
    locationEn: string;
    eventType: string;
    category: string;
    importance: number;
}

export type MyEvent = {
    id: number;
    start: Date;
    end: Date;
    titleKr: string;
    titleEn: string;
    descriptionKr: string;
    descriptionEn: string;
    locationKr: string;
    locationEn: string;
    eventType: string;
    category: string;
    importance: number;
}

export async function loadRawEventsData(): Promise<RawEvent[]> {
    const response = await fetch(
        import.meta.env.VITE_EVENT_LIST_DOWNLOAD_URL,
        // 이 옵션을 줘야 S3 + CDN은 업데이트 됐는데
        // 브라우저 캐시 때문에 옛날 파일을 보고 있는 문제를 해결할 수 있다.
        { cache: "no-store" }
    );
    if (!response.ok){
        throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    return data as Promise<RawEvent[]>;
}

export function loadMyEventsList(inputList: RawEvent[]): MyEvent[] {
    let resultList = [];
    for(let i=0; i<inputList.length; i++){
        const item: RawEvent = inputList[i];
        // 현재 진행형인 이벤트의 endDate 는 null 이다.
        if(item.endDate === null || item.endDate === undefined || item.endDate === ""){
            const elem: MyEvent = {
                id: i,
                start: new Date(item.startDate),
                end: VALUES.endDateForOnGoingEvent,
                titleKr: item.titleKr,
                titleEn: item.titleEn,
                descriptionKr: item.descriptionKr,
                descriptionEn: item.descriptionEn,
                locationKr: item.locationKr,
                locationEn: item.locationEn,
                eventType: item.eventType,
                category: item.category,
                importance: item.importance
            };
            resultList.push(elem);
        } else {
            const elem: MyEvent = {
                id: i,
                start: new Date(item.startDate),
                end: new Date(item.endDate),
                titleKr: item.titleKr,
                titleEn: item.titleEn,
                descriptionKr: item.descriptionKr,
                descriptionEn: item.descriptionEn,
                locationKr: item.locationKr,
                locationEn: item.locationEn,
                eventType: item.eventType,
                category: item.category,
                importance: item.importance
            };
            resultList.push(elem);
        }
    }
    return resultList;
}

export function loadMyEventsAscByStartDate(events: MyEvent[]): MyEvent[] {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function loadMyEventsAscByEndDate(events: MyEvent[]): MyEvent[] {
    return [...events].sort((a, b) => a.end.getTime() - b.end.getTime());;
}