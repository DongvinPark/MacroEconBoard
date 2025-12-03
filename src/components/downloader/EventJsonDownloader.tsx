export type Event = {
    startDate: string;
    endDate: string;
    titleKr: string;
    titleEn: string;
    descriptionKr: string;
    descriptionEn: string;
    locationKr: string;
    locationEn: string;
}

export async function loadEventsData(): Promise<Event[]> {
                                // TODO : 이런 URL은 나중에 .env로 빼야 한다.
    const response = await fetch("http://localhost:8554/events/events.json");
    if (!response.ok){
        throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    return data as Promise<Event[]>;
}