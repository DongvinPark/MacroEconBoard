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
    const response = await fetch("http://localhost:8554/events/events.json");
    if (!response.ok){
        throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    return data as Promise<Event[]>;
}