import type { IChartApi, Time } from "lightweight-charts";
import { type RefObject } from "react";



export function clearOverlay(overlayRef: RefObject<HTMLDivElement | null>){
  if(!overlayRef.current) return;
  overlayRef.current.style.display = "none";
}


export function drawOverlay(
  chart: IChartApi,
  overlayRef: RefObject<HTMLDivElement | null>,
  startTime: Time|undefined,
  endTime: Time|undefined,
  curTime: Time|undefined
) {
  if (!chart || !overlayRef.current) return;
  if (
    (startTime === null || startTime === undefined)
    && (endTime === null || endTime === undefined)
  ) return;

  const timeScale = chart.timeScale();

  const x1 = timeScale.timeToCoordinate(startTime);
  let x2 = timeScale.timeToCoordinate(curTime);
  if(endTime !== null && endTime !== undefined){
    x2 = timeScale.timeToCoordinate(endTime);
  }

  if (x1 == null || x2 == null) return;

  const left = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);

  overlayRef.current.style.display = "block";
  overlayRef.current.style.left = `${left}px`;
  overlayRef.current.style.width = `${width}px`;
}