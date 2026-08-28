import { supabase } from "../lib/supabase";
import {
  addDays,
  calculateEstimatedCycleLength,
  differenceInDays,
  generateCycleMarkers,
} from "../utils/ciclo";

export type MarkerType =
  | "sintoma"
  | "ovulacao"
  | "evento"
  | "fertil"
  | "menstruacao";

export interface Marker {
  id: string;
  user_id: string;
  data: string;
  tipo: MarkerType;
  titulo: string | null;
  descricao: string | null;
  created_at: string;
}

export interface MenstrualCycle {
  id: string;
  user_id: string;
  inicio: string;
  fim: string;
  duracao_ciclo: number;
  created_at: string;
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuária não autenticada");
  return user.id;
}

export async function registerCycle(cycleStartDate: string): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const { data: existingCycles, error: historyError } = await supabase
    .from("ciclo_mestrual")
    .select("*")
    .eq("user_id", userId)
    .order("inicio", { ascending: true });

  if (historyError) throw historyError;
  if (existingCycles?.some((cycle) => cycle.inicio === cycleStartDate)) {
    throw new Error("Já existe um ciclo registrado nesta data");
  }

  const sortedCycles = existingCycles ?? [];
  const cycleStartDates = [
    ...sortedCycles.map((cycle) => cycle.inicio),
    cycleStartDate,
  ].sort();
  const estimatedCycleLength = calculateEstimatedCycleLength(cycleStartDates);
  const previousCycle = [...sortedCycles]
    .reverse()
    .find((cycle) => cycle.inicio < cycleStartDate);
  const nextCycle = sortedCycles.find((cycle) => cycle.inicio > cycleStartDate);
  const newCycleLength = nextCycle
    ? differenceInDays(cycleStartDate, nextCycle.inicio)
    : estimatedCycleLength;

  if (previousCycle) {
    const { error: updateError } = await supabase
      .from("ciclo_mestrual")
      .update({
        fim: addDays(cycleStartDate, -1),
        duracao_ciclo: differenceInDays(previousCycle.inicio, cycleStartDate),
      })
      .eq("id", previousCycle.id)
      .eq("user_id", userId);

    if (updateError) throw updateError;
  }

  const { error: cycleError } = await supabase.from("ciclo_mestrual").insert({
    user_id: userId,
    inicio: cycleStartDate,
    fim: addDays(cycleStartDate, newCycleLength - 1),
    duracao_ciclo: newCycleLength,
  });

  if (cycleError) throw cycleError;

  const markers = generateCycleMarkers(cycleStartDate, newCycleLength);
  const rows = markers.map((marker) => ({ user_id: userId, ...marker }));
  const { error: markerError } = await supabase
    .from("agenda_marcadores")
    .insert(rows);
  if (markerError) throw markerError;
}

export async function getMarkersByMonth(
  year: number,
  month: number,
): Promise<Marker[]> {
  const userId = await getAuthenticatedUserId();
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
  const { data, error } = await supabase
    .from("agenda_marcadores")
    .select("*")
    .eq("user_id", userId)
    .gte("data", startDate)
    .lte("data", endDate);

  if (error) throw error;
  return data ?? [];
}

export async function getCycles(): Promise<MenstrualCycle[]> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("ciclo_mestrual")
    .select("*")
    .eq("user_id", userId)
    .order("inicio", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
