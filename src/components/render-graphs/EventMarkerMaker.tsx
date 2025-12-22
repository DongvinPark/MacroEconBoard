import { COLORS } from "../../constants/Colors";
import { VALUES } from "../../constants/Values";
import { formatDateYYYY_MM_DD } from "../../utils/DateFormater";
import type { MyEvent } from "../downloader/EventJsonDownloader";

export type EventMarker = {
    time: string,
    position: string,
    color: string,
    shape: string,
    size: number,
    text: string,
}

export function getFirstValidDate(
    inputList: {time:string, value:number}[]
): string|undefined {
    for(let i=0; i<inputList.length-1; i++){
        const curElem = inputList[i];
        const nextElem = inputList[i+1];
        if(curElem.value !== VALUES.EMTPY_FOR_GRAPH){
            return undefined;
        }else if(curElem.value == VALUES.EMTPY_FOR_GRAPH && nextElem.value !== VALUES.EMTPY_FOR_GRAPH){
            return nextElem.time;
        }
    }
    return undefined;
}

/* 예시 마커 1 개의 형태
{
    time: "2023-01-02",
    position: "aboveBar", // aboveBar | belowBar | inBar
    color: "#ff0000",
    shape: "circle", // circle | square | diamond | arrowUp | arrowDown
    size: 1,         // optional
    text: "E1",       // optional → 숫자, 글자 표시 가능
}
*/
export function getEventMarkerList(
    graphStartDate: string,
    graphEndDate: string,
    eventListByStartDateAsc: MyEvent[]
): EventMarker[]{
    const startDate: Date = new Date(graphStartDate);
    const endDate: Date = new Date(graphEndDate);

    let targetEventList: MyEvent[] = [];
    for(let i=0; i<eventListByStartDateAsc.length; i++){
        const event: MyEvent = eventListByStartDateAsc[i];
        if(
            event.start.getTime() >= startDate.getTime() &&
            event.start.getTime() <= endDate.getTime()
        ){
            targetEventList.push(event);
        }
    }

    let resultList: EventMarker[] = [];
    for(let i=0; i<targetEventList.length; i++){
        const event: MyEvent = targetEventList[i];
        if(
            event.start.getTime() >= startDate.getTime() &&
            event.start.getTime() <= endDate.getTime()
        ){
            const markerElem: EventMarker = {
                time: formatDateYYYY_MM_DD(event.start),
                position: "aboveBar",
                color: COLORS.eventMarkerColor,
                shape: "circle",
                size: 1,
                text: VALUES.emptyStr//"E" + (i+1)
            };
            resultList.push(markerElem);
        }
    }
    return resultList;
}