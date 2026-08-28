import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMarkersByMonth,
  registerCycle,
  MarkerType,
  Marker,
  MenstrualCycle,
  getCycles,
} from "../../../services/ciclo";
import {
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  maskDate,
  parseDateInput,
  toDateString,
} from "../../../utils/agenda";
import { addDays } from "../../../utils/ciclo";

const TIPOS: Record<MarkerType, { label: string; color: string }> = {
  sintoma: { label: "Menstruação", color: "#F4A7B9" },
  ovulacao: { label: "Ovulação", color: "#7BC67E" },
  fertil: { label: "Fértil", color: "#F9E07A" },
  evento: { label: "Evento", color: "#BBBBBB" },
  menstruacao: { label: "Menstruação", color: "#F4A7B9" },
};

export default function AgendaScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const compact = screenWidth < 390;
  const daySize = Math.floor((Math.min(screenWidth - 32, 720) - 24) / 7);
  const now = new Date();
  const today = {
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear(),
  };

  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [currentYear, setCurrentYear] = useState(today.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [marcadores, setMarcadores] = useState<Marker[]>([]);
  const [loadingMarcadores, setLoadingMarcadores] = useState(false);
  const [ciclos, setCiclos] = useState<MenstrualCycle[]>([]);
  const [loadingCiclos, setLoadingCiclos] = useState(true);
  const [erroCiclos, setErroCiclos] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [dateError, setDateError] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [painelVisible, setPainelVisible] = useState(false);
  const [painelDia, setPainelDia] = useState<number>(1);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1,
  );

  const carregarMarcadores = useCallback(async () => {
    setLoadingMarcadores(true);
    try {
      const data = await getMarkersByMonth(currentYear, currentMonth);
      setMarcadores(data);
    } catch (e) {
      console.error("Erro ao carregar marcadores:", e);
    } finally {
      setLoadingMarcadores(false);
    }
  }, [currentYear, currentMonth]);

  const carregarCiclos = useCallback(async () => {
    setLoadingCiclos(true);
    setErroCiclos(false);
    try {
      setCiclos(await getCycles());
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
      setErroCiclos(true);
    } finally {
      setLoadingCiclos(false);
    }
  }, []);

  useEffect(() => {
    carregarMarcadores();
  }, [carregarMarcadores]);

  useEffect(() => {
    carregarCiclos();
  }, [carregarCiclos]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
    setPainelVisible(false);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
    setPainelVisible(false);
  };

  const isToday = (day: number) =>
    day === today.day &&
    currentMonth === today.month &&
    currentYear === today.year;

  const getMarcadoresDia = (day: number): Marker[] => {
    const dateStr = toDateString(currentYear, currentMonth, day);
    return marcadores.filter((m) => m.data === dateStr);
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    setPainelDia(day);
    setPainelVisible(true);
  };

  const abrirModalCiclo = () => {
    setDateInput("");
    setDateError("");
    setModalVisible(true);
  };

  const salvarCiclo = async () => {
    const dateStr = parseDateInput(dateInput);
    if (!dateStr) {
      setDateError("Informe uma data válida no formato DD/MM/AAAA");
      return;
    }
    setDateError("");
    setSalvando(true);
    try {
      await registerCycle(dateStr);
      setModalVisible(false);
      await Promise.all([carregarMarcadores(), carregarCiclos()]);
      Alert.alert(
        "Ciclo registrado!",
        "Os períodos de menstruação, fértil e ovulação foram calculados e marcados no calendário.",
      );
    } catch (e: any) {
      console.error(JSON.stringify(e));
      Alert.alert(
        "Erro",
        e instanceof Error && e.message.includes("Já existe")
          ? e.message
          : "Não foi possível registrar o ciclo. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const cells: { day: number; type: "prev" | "current" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: "current" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, type: "next" });

  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const marcadoresPainel = getMarcadoresDia(painelDia);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.pageContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Agenda</Text>
              <Text style={styles.subtitle}>
                Agendamentos e calendário menstrual
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={abrirModalCiclo}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Calendar Card */}
          <View style={styles.calendarCard}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={18} color="#888" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {new Date(currentYear, currentMonth, 1).toLocaleDateString(
                  "pt-BR",
                  { month: "long", year: "numeric" },
                )}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={18} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {Array.from({ length: 7 }, (_, index) => {
                const day = new Date(2026, 0, 4 + index)
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .replace(/\./g, "")
                  .toUpperCase();

                return (
                  <View
                    key={index}
                    style={[styles.weekDayCell, { width: daySize }]}
                  >
                    <Text
                      style={[
                        styles.weekDayText,
                        index === 6 && styles.saturdayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.divider} />

            {loadingMarcadores ? (
              <ActivityIndicator
                color="#E05C7A"
                style={{ marginVertical: 24 }}
              />
            ) : (
              rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.weekRow}>
                  {row.map((cell, colIndex) => {
                    const isCurrent = cell.type === "current";
                    const todayDay = isToday(cell.day) && isCurrent;
                    const selected = selectedDay === cell.day && isCurrent;
                    const isSat = colIndex === 6;
                    const dayMarcadores = isCurrent
                      ? getMarcadoresDia(cell.day)
                      : [];

                    return (
                      <TouchableOpacity
                        key={colIndex}
                        style={[
                          styles.dayCell,
                          { width: daySize, height: daySize + 10 },
                        ]}
                        onPress={() => isCurrent && handleDayPress(cell.day)}
                        activeOpacity={isCurrent ? 0.7 : 1}
                      >
                        <View
                          style={[
                            styles.dayInner,
                            {
                              width: daySize - 6,
                              height: daySize - 6,
                              borderRadius: (daySize - 6) / 2,
                            },
                            todayDay && styles.todayCircle,
                            selected && !todayDay && styles.selectedCircle,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              !isCurrent && styles.otherMonthText,
                              todayDay && styles.todayText,
                              selected && !todayDay && styles.selectedText,
                              isSat &&
                                isCurrent &&
                                !todayDay &&
                                !selected &&
                                styles.saturdayDayText,
                            ]}
                          >
                            {cell.day}
                          </Text>
                        </View>

                        {dayMarcadores.length > 0 && (
                          <View style={styles.dotsRow}>
                            {dayMarcadores.slice(0, 3).map((m, i) => (
                              <View
                                key={i}
                                style={[
                                  styles.dot,
                                  {
                                    backgroundColor:
                                      TIPOS[m.tipo]?.color ?? "#ccc",
                                  },
                                ]}
                              />
                            ))}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}

            <View style={styles.divider} />

            <View style={styles.legend}>
              <LegendItem color="#E05C7A" label="Hoje" />
              <LegendItem color="#F4A7B9" label="Menstruação" />
              <LegendItem color="#7BC67E" label="Ovulação" />
            </View>
            <View style={styles.legend}>
              <LegendItem color="#F9E07A" label="Fértil" />
            </View>
          </View>

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <View style={styles.historyHeading}>
                <View style={styles.historyIcon}>
                  <Ionicons name="time-outline" size={19} color="#E05C7A" />
                </View>
                <View style={styles.historyTitleGroup}>
                  <Text style={styles.historyTitle}>Histórico</Text>
                  <Text style={styles.historySubtitle}>
                    {ciclos.length === 1
                      ? "1 ciclo registrado"
                      : `${ciclos.length} ciclos registrados`}
                  </Text>
                </View>
              </View>
              {!loadingCiclos && (
                <TouchableOpacity
                  onPress={carregarCiclos}
                  style={styles.refreshButton}
                  accessibilityLabel="Atualizar histórico"
                >
                  <Ionicons name="refresh-outline" size={18} color="#777" />
                </TouchableOpacity>
              )}
            </View>

            {loadingCiclos ? (
              <View style={styles.historyState}>
                <ActivityIndicator color="#E05C7A" />
                <Text style={styles.historyStateText}>
                  Carregando registros...
                </Text>
              </View>
            ) : erroCiclos ? (
              <View style={styles.historyState}>
                <Ionicons
                  name="alert-circle-outline"
                  size={30}
                  color="#C0808A"
                />
                <Text style={styles.historyStateTitle}>
                  Não foi possível carregar o histórico
                </Text>
                <TouchableOpacity
                  onPress={carregarCiclos}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : ciclos.length === 0 ? (
              <View style={styles.historyState}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={34}
                  color="#D8D8D8"
                />
                <Text style={styles.historyStateTitle}>
                  Nenhum registro realizado
                </Text>
                <Text style={styles.historyStateText}>
                  Seus ciclos aparecerão aqui após o primeiro registro.
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {ciclos.map((ciclo, index) => (
                  <View key={ciclo.id} style={styles.historyCard}>
                    <View style={styles.historyDateBadge}>
                      <Text style={styles.historyDateDay}>
                        {ciclo.inicio.split("-")[2]}
                      </Text>
                      <Text style={styles.historyDateMonth}>
                        {new Date(
                          Number(ciclo.inicio.split("-")[0]),
                          Number(ciclo.inicio.split("-")[1]) - 1,
                          1,
                        )
                          .toLocaleDateString("pt-BR", { month: "short" })
                          .replace(/\./g, "")
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.historyInfo}>
                      <View
                        style={[
                          styles.historyCardTop,
                          compact && styles.historyCardTopCompact,
                        ]}
                      >
                        <Text style={styles.historyCardTitle}>
                          Ciclo menstrual
                        </Text>
                        {index === 0 && (
                          <View style={styles.latestBadge}>
                            <Text style={styles.latestBadgeText}>
                              MAIS RECENTE
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        style={[
                          styles.historyMeta,
                          compact && styles.historyMetaCompact,
                        ]}
                      >
                        <View style={styles.historyMetaItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#999"
                          />
                          <Text style={styles.historyMetaText}>
                            {formatDate(ciclo.inicio)} a {formatDate(ciclo.fim)}
                          </Text>
                        </View>
                        <View style={styles.historyMetaItem}>
                          <Ionicons
                            name="repeat-outline"
                            size={14}
                            color="#999"
                          />
                          <Text style={styles.historyMetaText}>
                            {ciclo.duracao_ciclo} dias
                          </Text>
                        </View>
                      </View>
                      {index === 0 && (
                        <View style={styles.nextCycleRow}>
                          <Ionicons
                            name="sparkles-outline"
                            size={14}
                            color="#E05C7A"
                          />
                          <Text style={styles.nextCycleText}>
                            Próximo ciclo previsto para{" "}
                            {formatDate(
                              addDays(ciclo.inicio, ciclo.duracao_ciclo),
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Painel do dia */}
      <Modal
        visible={painelVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPainelVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPainelVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {String(painelDia).padStart(2, "0")} de{" "}
                    {new Date(
                      currentYear,
                      currentMonth,
                      painelDia,
                    ).toLocaleDateString("pt-BR", { month: "long" })}
                  </Text>
                  <Text style={styles.modalSubtitle}>{currentYear}</Text>
                </View>
                <TouchableOpacity onPress={() => setPainelVisible(false)}>
                  <Ionicons name="close" size={22} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {marcadoresPainel.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Ionicons name="calendar-outline" size={36} color="#DDD" />
                  <Text style={styles.emptyDayText}>
                    Nenhum evento neste dia
                  </Text>
                  <Text style={styles.emptyDaySubtext}>
                    Use o botão + para registrar seu ciclo menstrual
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.marcadoresList}
                  showsVerticalScrollIndicator={false}
                >
                  {marcadoresPainel.map((m) => {
                    const tipo = TIPOS[m.tipo] ?? TIPOS.evento;
                    return (
                      <View key={m.id} style={styles.marcadorItem}>
                        <View
                          style={[
                            styles.marcadorColorBar,
                            { backgroundColor: tipo.color },
                          ]}
                        />
                        <View style={styles.marcadorInfo}>
                          <Text style={styles.marcadorTitulo}>
                            {m.titulo || tipo.label}
                          </Text>
                          {m.descricao ? (
                            <Text style={styles.marcadorDescricao}>
                              {m.descricao}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          style={[
                            styles.marcadorBadge,
                            { backgroundColor: tipo.color + "44" },
                          ]}
                        >
                          <Text style={styles.marcadorBadgeText}>
                            {tipo.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal registrar ciclo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar ciclo</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.cicloInfo}>
              Informe o primeiro dia da sua menstruação. O sistema calculará
              automaticamente:
            </Text>

            <View style={styles.calculoList}>
              <CalculoItem
                color="#F4A7B9"
                label="Menstruação"
                desc="Dias 1 a 5"
              />
              <CalculoItem
                color="#F9E07A"
                label="Período fértil"
                desc="Estimado pelo histórico"
              />
              <CalculoItem
                color="#7BC67E"
                label="Ovulação"
                desc="Estimado pelo histórico"
              />
            </View>

            <Text style={styles.label}>Primeiro dia da menstruação</Text>

            <TextInput
              style={[styles.input, dateError ? styles.inputError : null]}
              value={dateInput}
              onChangeText={(v) => {
                setDateInput(maskDate(v));
                setDateError("");
              }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#CCC"
              keyboardType="numeric"
              maxLength={10}
            />
            {dateError ? (
              <Text style={styles.errorText}>{dateError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.saveButton, salvando && { opacity: 0.7 }]}
              onPress={salvarCiclo}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Calcular e registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function CalculoItem({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  return (
    <View style={styles.calculoItem}>
      <View style={[styles.calculoDot, { backgroundColor: color }]} />
      <Text style={styles.calculoLabel}>{label}</Text>
      <Text style={styles.calculoDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  content: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: "center",
  },
  pageContent: { width: "100%", maxWidth: 720 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13, color: "#999", marginTop: 2 },
  addButton: {
    backgroundColor: "#E05C7A",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navBtn: { padding: 4 },
  monthTitle: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekDayCell: { alignItems: "center", paddingVertical: 4 },
  weekDayText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: "#AAAAAA",
    letterSpacing: 0.3,
  },
  saturdayText: { color: "#C0808A" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 8 },
  dayCell: { alignItems: "center", justifyContent: "center" },
  dayInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 13, color: "#333", fontFamily: "Poppins_400Regular" },
  otherMonthText: { color: "#CCCCCC" },
  todayCircle: { backgroundColor: "#E05C7A" },
  todayText: { color: "#fff", fontFamily: "Poppins_700Bold" },
  selectedCircle: { backgroundColor: "#F4D0D8" },
  selectedText: { color: "#E05C7A", fontFamily: "Poppins_600SemiBold" },
  saturdayDayText: { color: "#C0808A" },
  dotsRow: { flexDirection: "row", gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: "row", gap: 16, paddingHorizontal: 4, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: "#666" },

  historySection: { marginTop: 24 },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  historyHeading: { flexDirection: "row", alignItems: "center", flex: 1 },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FCEEF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  historyTitleGroup: { flex: 1 },
  historyTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#222" },
  historySubtitle: { fontSize: 12, color: "#999", marginTop: 1 },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  historyList: { gap: 10 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  historyDateBadge: {
    width: 52,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FCEEF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  historyDateDay: {
    fontSize: 20,
    lineHeight: 23,
    fontFamily: "Poppins_700Bold",
    color: "#E05C7A",
  },
  historyDateMonth: {
    fontSize: 9,
    fontFamily: "Poppins_700Bold",
    color: "#C0808A",
    letterSpacing: 0.8,
  },
  historyInfo: { flex: 1, minWidth: 0 },
  historyCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  historyCardTopCompact: { alignItems: "flex-start" },
  historyCardTitle: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#333",
    flexShrink: 1,
  },
  latestBadge: {
    backgroundColor: "#EAF6EB",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  latestBadgeText: {
    fontSize: 8,
    fontFamily: "Poppins_700Bold",
    color: "#4D9B53",
    letterSpacing: 0.3,
  },
  historyMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 7,
  },
  historyMetaCompact: { gap: 5 },
  historyMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  historyMetaText: { fontSize: 11, color: "#777" },
  nextCycleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    backgroundColor: "#FCEEF1",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  nextCycleText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "#B54D66",
  },
  historyState: {
    minHeight: 140,
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    gap: 7,
  },
  historyStateTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#777",
    textAlign: "center",
  },
  historyStateText: { fontSize: 12, color: "#AAA", textAlign: "center" },
  retryButton: {
    marginTop: 5,
    backgroundColor: "#FCEEF1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  retryButtonText: {
    color: "#E05C7A",
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#1A1A1A" },
  modalSubtitle: { fontSize: 13, color: "#999", marginTop: 2 },

  cicloInfo: { fontSize: 13, color: "#777", marginTop: 12, lineHeight: 20 },
  calculoList: { marginTop: 12, gap: 8 },
  calculoItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  calculoDot: { width: 10, height: 10, borderRadius: 5 },
  calculoLabel: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#444",
    width: 110,
  },
  calculoDesc: { fontSize: 13, color: "#999" },

  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#555",
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FAFAFA",
    letterSpacing: 1,
  },
  inputError: { borderColor: "#E05C7A" },
  errorText: { fontSize: 12, color: "#E05C7A", marginTop: 4 },

  saveButton: {
    backgroundColor: "#E05C7A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
  },

  // Painel do dia
  marcadoresList: { maxHeight: 300 },
  marcadorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  marcadorColorBar: { width: 4, height: 40, borderRadius: 2 },
  marcadorInfo: { flex: 1 },
  marcadorTitulo: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
  },
  marcadorDescricao: { fontSize: 12, color: "#888", marginTop: 2 },
  marcadorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  marcadorBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: "#444",
  },

  emptyDay: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyDayText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#BBB",
  },
  emptyDaySubtext: { fontSize: 12, color: "#CCC", textAlign: "center" },
});
