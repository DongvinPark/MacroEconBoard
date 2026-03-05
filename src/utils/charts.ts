//import type { SeriesMarker, SeriesMarkerPosition, SeriesMarkerShape } from 'lightweight-charts';
// 20260305 현재 사용하지 않음.

export type RawMarker = {
    time: string;
    position: string;
    color?: string;
    shape: string;
    text?: string;
}

// 20260305 현재 사용하지 않음.
// export function toSeriesMarkers(raw: RawMarker[]): SeriesMarker<string>[]{
//     return raw.map(
//         (m) => ({
//             time: m.time,
//             position: m.position as SeriesMarkerPosition,
//             color: m.color ?? "black",
//             shape: m.shape as SeriesMarkerShape,
//             text: m.text ?? "",
//         })
//     );
// }