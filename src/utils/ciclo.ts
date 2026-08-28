import type { MarkerType } from "../services/ciclo";

export const DEFAULT_CYCLE_LENGTH = 28;
const MENSTRUATION_LENGTH = 5;
const CYCLES_USED_FOR_CALCULATION = 6;
const MINIMUM_VALID_INTERVAL = 21;
const MAXIMUM_VALID_INTERVAL = 45;

export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function differenceInDays(
  startDateString: string,
  endDateString: string,
): number {
  const startDate = new Date(`${startDateString}T12:00:00`);
  const endDate = new Date(`${endDateString}T12:00:00`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

export function calculateEstimatedCycleLength(
  cycleStartDates: string[],
): number {
  const sortedDates = [...new Set(cycleStartDates)].sort();
  const intervals = sortedDates
    .slice(1)
    .map((date, index) => differenceInDays(sortedDates[index], date))
    .filter(
      (interval) =>
        interval >= MINIMUM_VALID_INTERVAL &&
        interval <= MAXIMUM_VALID_INTERVAL,
    )
    .slice(-CYCLES_USED_FOR_CALCULATION);

  if (intervals.length === 0) return DEFAULT_CYCLE_LENGTH;
  return Math.round(
    intervals.reduce((total, interval) => total + interval, 0) /
      intervals.length,
  );
}

export function generateCycleMarkers(startDate: string, cycleLength: number) {
  const markers: {
    data: string;
    tipo: MarkerType;
    titulo: string;
    descricao: string;
  }[] = [];
  const ovulationDay = Math.max(1, cycleLength - 14);
  const fertileWindowStart = Math.max(1, ovulationDay - 4);

  for (let index = 0; index < MENSTRUATION_LENGTH; index++) {
    markers.push({
      data: addDays(startDate, index),
      tipo: "sintoma",
      titulo: "Menstruação",
      descricao: `Dia ${index + 1} da menstruação`,
    });
  }
  for (let day = fertileWindowStart; day < ovulationDay; day++) {
    markers.push({
      data: addDays(startDate, day - 1),
      tipo: "fertil",
      titulo: "Período fértil",
      descricao: "Estimativa baseada no histórico de ciclos",
    });
  }
  markers.push({
    data: addDays(startDate, ovulationDay - 1),
    tipo: "ovulacao",
    titulo: "Ovulação",
    descricao: "Data estimada com base na duração média do ciclo",
  });
  return markers;
}
