import type { MyEvent } from "../downloader/EventJsonDownloader";

/**
 * 주어진 이벤트 리스트(inputList)에서,
 * 이벤트 구간이 [startDate, endDate] 와 겹치는 모든 이벤트를 찾아 반환한다.
 *
 * 이벤트 하나가 반환 대상이 되려면 반드시 아래 두 조건을 모두 만족해야 한다:
 *
 *   1) 이벤트의 시작일(event.start) <= endDate
 *      → 즉, 이벤트가 구간의 끝보다 늦게 시작하지 않아야 한다.
 *
 *   2) 이벤트의 종료일(event.end) >= startDate
 *      → 즉, 이벤트가 구간의 시작보다 일찍 끝나지 않아야 한다.
 *
 * 위 두 조건은 "이벤트 구간과 조회 구간이 하나라도 겹친다(overlap)"는 의미이다.
 *
 * 이 함수는 미리 준비된 두 정렬 리스트:
 *   - startDate 기준 ASC 정렬 리스트 (starts[])
 *   - endDate 기준 ASC 정렬 리스트 (ends[])
 * 에서 각각의 조건을 만족하는 후보 집합을 얻은 뒤,
 * 두 집합의 교집합을 최종 결과로 반환한다.
 */
export function findEventsInRangeByStartAsc(
    startDate: Date,
    endDate: Date,
    inputListStartAsc: MyEvent[],
    inputListEndAsc: MyEvent[],
    totalEvents: MyEvent[]
): MyEvent[]{
    const qStartTime = startDate.getTime();
    const qEndTime = endDate.getTime();

    const idxStart = upperBound(inputListStartAsc, qEndTime, e=>e.start.getTime());
    const candidatesByStart = new Set(
        inputListStartAsc.slice(0, idxStart).map(e => e.id)
    );

    const idxEnd = lowerBound(inputListEndAsc, qStartTime, e=>e.end.getTime());
    const candidatesByEnd = new Set(
        inputListEndAsc.slice(idxEnd).map(e => e.id)
    );

    const resultIdice = [...candidatesByStart].filter(id => candidatesByEnd.has(id));
    
    // 여기 마지막에 있는 ! 는 Non-null Assertion Operator 다.
    const filteredEvnts = resultIdice.map(id => totalEvents.find(e => e.id === id)!);

    // 이벤트 시작 날짜 순으로 정렬
    return [...filteredEvnts].sort((a, b) => a.start.getTime() - b.start.getTime());
}

// endDate < 추적대상구간의 시작날짜(qs) 
// 의 조건을 만족하는 첫 번째 인덱스를 찾는다. 이 인덱스를 m이라 하자.
// 따라서 여기에는 '이벤트 종료 날짜' 기준 ASC 정렬한 이벤트 리스트를 전달해야 한다.
// 이 리스트 안에서 m 보다 작거나 같은 이벤트들은 전부 걸러내야 한다.
function lowerBound<T>(arr: T[], target: number, get: (t: T) => number): number{
    let start = 0;
    let end = arr.length;
    while(start < end){
        const mid = (start + end) >> 1;
        if(get(arr[mid]) < target){
            start = mid + 1;
        } else {
            end = mid;
        }
    }
    return start;
}

// startDate > 추적대상구간의 마지막날짜(pe)
// 의 조건을 만족하는 첫 번째 이벤트를 찾는다. 이 인덱스를 k라 하자.
// 따라서 여기에는 '이벤트 시작 날짜' 기준 ASC 정렬한 이벤트 리스트를 전달해야 한다.
// 이 리스트 안에서 k 보다 작은 이벤트들은 전부 걸러내야 한다.
function upperBound<T>(arr: T[], target: number, get: (t: T) => number): number{
    let start = 0;
    let end = arr.length;
    // 이진 탐색
    while(start < end){
        const mid = (start + end) >> 1;
        if(get(arr[mid]) <= target){
            start = mid + 1;
        } else {
            end = mid;
        }
    }
    return start;
}