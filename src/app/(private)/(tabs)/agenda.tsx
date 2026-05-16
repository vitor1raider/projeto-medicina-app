import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  getMarcadoresByMes,
  registrarCiclo,
  TipoMarcador,
  Marcador,
} from '../../../services/ciclo'

const { width } = Dimensions.get('window')
const DAY_SIZE = Math.floor((width - 48) / 7)

const WEEK_DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const TIPOS: Record<TipoMarcador, { label: string; color: string }> = {
  sintoma: { label: 'Menstruação', color: '#F4A7B9' },
  ovulacao: { label: 'Ovulação', color: '#7BC67E' },
  fertil: { label: 'Fértil', color: '#F9E07A' },
  evento: { label: 'Evento', color: '#BBBBBB' },
  menstruacao: { label: 'Menstruação', color: '#F4A7B9' },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Formata input do usuário: aceita DD/MM/AAAA e converte para YYYY-MM-DD
function parseDateInput(input: string): string | null {
  const clean = input.replace(/\D/g, '')
  if (clean.length !== 8) return null
  const day = clean.slice(0, 2)
  const month = clean.slice(2, 4)
  const year = clean.slice(4, 8)
  const d = parseInt(day), m = parseInt(month), y = parseInt(year)
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000) return null
  return `${year}-${month}-${day}`
}

// Mascara DD/MM/AAAA enquanto digita
function maskDate(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 8)
  if (clean.length <= 2) return clean
  if (clean.length <= 4) return `${clean.slice(0, 2)}/${clean.slice(2)}`
  return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`
}

export default function AgendaScreen() {
  const now = new Date()
  const today = {
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear(),
  }

  const [currentMonth, setCurrentMonth] = useState(today.month)
  const [currentYear, setCurrentYear] = useState(today.year)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [marcadores, setMarcadores] = useState<Marcador[]>([])
  const [loadingMarcadores, setLoadingMarcadores] = useState(false)

  // Modal registrar ciclo
  const [modalVisible, setModalVisible] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [dateError, setDateError] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Painel do dia
  const [painelVisible, setPainelVisible] = useState(false)
  const [painelDia, setPainelDia] = useState<number>(1)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  )

  const carregarMarcadores = useCallback(async () => {
    setLoadingMarcadores(true)
    try {
      const data = await getMarcadoresByMes(currentYear, currentMonth)
      setMarcadores(data)
    } catch (e) {
      console.error('Erro ao carregar marcadores:', e)
    } finally {
      setLoadingMarcadores(false)
    }
  }, [currentYear, currentMonth])

  useEffect(() => {
    carregarMarcadores()
  }, [carregarMarcadores])

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(null)
    setPainelVisible(false)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(null)
    setPainelVisible(false)
  }

  const isToday = (day: number) =>
    day === today.day && currentMonth === today.month && currentYear === today.year

  const getMarcadoresDia = (day: number): Marcador[] => {
    const dateStr = toDateString(currentYear, currentMonth, day)
    return marcadores.filter(m => m.data === dateStr)
  }

  const handleDayPress = (day: number) => {
    setSelectedDay(day)
    setPainelDia(day)
    setPainelVisible(true)
  }

  const abrirModalCiclo = () => {
    setDateInput('')
    setDateError('')
    setModalVisible(true)
  }

  const salvarCiclo = async () => {
    const dateStr = parseDateInput(dateInput)
    if (!dateStr) {
      setDateError('Informe uma data válida no formato DD/MM/AAAA')
      return
    }
    setDateError('')
    setSalvando(true)
    try {
      await registrarCiclo(dateStr)
      setModalVisible(false)
      await carregarMarcadores()
      Alert.alert(
        'Ciclo registrado!',
        'Os períodos de menstruação, fértil e ovulação foram calculados e marcados no calendário.'
      )
    } catch (e: any) {
      console.error(JSON.stringify(e))
      Alert.alert('Erro', 'Não foi possível registrar o ciclo. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  // Build grid
  const cells: { day: number; type: 'prev' | 'current' | 'next' }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, type: 'prev' })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: 'current' })
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, type: 'next' })

  const rows: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7)
    rows.push(cells.slice(i, i + 7))

  const marcadoresPainel = getMarcadoresDia(painelDia)

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Agenda</Text>
            <Text style={styles.subtitle}>Agendamentos e calendário menstrual</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={abrirModalCiclo}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={18} color="#888" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map(day => (
              <View key={day} style={styles.weekDayCell}>
                <Text style={[styles.weekDayText, day === 'SÁB' && styles.saturdayText]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {loadingMarcadores ? (
            <ActivityIndicator color="#E05C7A" style={{ marginVertical: 24 }} />
          ) : (
            rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.weekRow}>
                {row.map((cell, colIndex) => {
                  const isCurrent = cell.type === 'current'
                  const todayDay = isToday(cell.day) && isCurrent
                  const selected = selectedDay === cell.day && isCurrent
                  const isSat = colIndex === 6
                  const dayMarcadores = isCurrent ? getMarcadoresDia(cell.day) : []

                  return (
                    <TouchableOpacity
                      key={colIndex}
                      style={styles.dayCell}
                      onPress={() => isCurrent && handleDayPress(cell.day)}
                      activeOpacity={isCurrent ? 0.7 : 1}
                    >
                      <View style={[
                        styles.dayInner,
                        todayDay && styles.todayCircle,
                        selected && !todayDay && styles.selectedCircle,
                      ]}>
                        <Text style={[
                          styles.dayText,
                          !isCurrent && styles.otherMonthText,
                          todayDay && styles.todayText,
                          selected && !todayDay && styles.selectedText,
                          isSat && isCurrent && !todayDay && !selected && styles.saturdayDayText,
                        ]}>
                          {cell.day}
                        </Text>
                      </View>

                      {dayMarcadores.length > 0 && (
                        <View style={styles.dotsRow}>
                          {dayMarcadores.slice(0, 3).map((m, i) => (
                            <View
                              key={i}
                              style={[styles.dot, { backgroundColor: TIPOS[m.tipo]?.color ?? '#ccc' }]}
                            />
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  )
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
          <TouchableOpacity activeOpacity={1} onPress={() => { }}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {String(painelDia).padStart(2, '0')} de {MONTHS[currentMonth]}
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
                  <Text style={styles.emptyDayText}>Nenhum evento neste dia</Text>
                  <Text style={styles.emptyDaySubtext}>
                    Use o botão + para registrar seu ciclo menstrual
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.marcadoresList} showsVerticalScrollIndicator={false}>
                  {marcadoresPainel.map(m => {
                    const tipo = TIPOS[m.tipo] ?? TIPOS.evento
                    return (
                      <View key={m.id} style={styles.marcadorItem}>
                        <View style={[styles.marcadorColorBar, { backgroundColor: tipo.color }]} />
                        <View style={styles.marcadorInfo}>
                          <Text style={styles.marcadorTitulo}>{m.titulo || tipo.label}</Text>
                          {m.descricao ? (
                            <Text style={styles.marcadorDescricao}>{m.descricao}</Text>
                          ) : null}
                        </View>
                        <View style={[styles.marcadorBadge, { backgroundColor: tipo.color + '44' }]}>
                          <Text style={styles.marcadorBadgeText}>{tipo.label}</Text>
                        </View>
                      </View>
                    )
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              Informe o primeiro dia da sua menstruação. O sistema calculará automaticamente:
            </Text>

            <View style={styles.calculoList}>
              <CalculoItem color="#F4A7B9" label="Menstruação" desc="Dias 1 a 5" />
              <CalculoItem color="#F9E07A" label="Período fértil" desc="Dias 10 a 13" />
              <CalculoItem color="#7BC67E" label="Ovulação" desc="Dia 14" />
            </View>

            <Text style={styles.label}>Primeiro dia da menstruação</Text>

            <TextInput
              style={[styles.input, dateError ? styles.inputError : null]}
              value={dateInput}
              onChangeText={v => {
                setDateInput(maskDate(v))
                setDateError('')
              }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#CCC"
              keyboardType="numeric"
              maxLength={10}
            />
            {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

            <TouchableOpacity
              style={[styles.saveButton, salvando && { opacity: 0.7 }]}
              onPress={salvarCiclo}
              disabled={salvando}
            >
              {salvando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveButtonText}>Calcular e registrar</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  )
}

function CalculoItem({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <View style={styles.calculoItem}>
      <View style={[styles.calculoDot, { backgroundColor: color }]} />
      <Text style={styles.calculoLabel}>{label}</Text>
      <Text style={styles.calculoDesc}>{desc}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  addButton: {
    backgroundColor: '#E05C7A', width: 36, height: 36,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  calendarCard: {
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4,
  },
  navBtn: { padding: 4 },
  monthTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDayCell: { width: DAY_SIZE, alignItems: 'center', paddingVertical: 4 },
  weekDayText: { fontSize: 10, fontWeight: '600', color: '#AAAAAA', letterSpacing: 0.3 },
  saturdayText: { color: '#C0808A' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  dayCell: { width: DAY_SIZE, height: DAY_SIZE + 10, alignItems: 'center', justifyContent: 'center' },
  dayInner: {
    width: DAY_SIZE - 6, height: DAY_SIZE - 6,
    borderRadius: (DAY_SIZE - 6) / 2, alignItems: 'center', justifyContent: 'center',
  },
  dayText: { fontSize: 13, color: '#333', fontWeight: '400' },
  otherMonthText: { color: '#CCCCCC' },
  todayCircle: { backgroundColor: '#E05C7A' },
  todayText: { color: '#fff', fontWeight: '700' },
  selectedCircle: { backgroundColor: '#F4D0D8' },
  selectedText: { color: '#E05C7A', fontWeight: '600' },
  saturdayDayText: { color: '#C0808A' },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', gap: 16, paddingHorizontal: 4, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: '#666' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  modalSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },

  cicloInfo: { fontSize: 13, color: '#777', marginTop: 12, lineHeight: 20 },
  calculoList: { marginTop: 12, gap: 8 },
  calculoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calculoDot: { width: 10, height: 10, borderRadius: 5 },
  calculoLabel: { fontSize: 13, fontWeight: '600', color: '#444', width: 110 },
  calculoDesc: { fontSize: 13, color: '#999' },

  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#333', backgroundColor: '#FAFAFA',
    letterSpacing: 1,
  },
  inputError: { borderColor: '#E05C7A' },
  errorText: { fontSize: 12, color: '#E05C7A', marginTop: 4 },

  saveButton: {
    backgroundColor: '#E05C7A', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Painel do dia
  marcadoresList: { maxHeight: 300 },
  marcadorItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  marcadorColorBar: { width: 4, height: 40, borderRadius: 2 },
  marcadorInfo: { flex: 1 },
  marcadorTitulo: { fontSize: 14, fontWeight: '600', color: '#222' },
  marcadorDescricao: { fontSize: 12, color: '#888', marginTop: 2 },
  marcadorBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  marcadorBadgeText: { fontSize: 11, fontWeight: '700', color: '#444' },

  emptyDay: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyDayText: { fontSize: 15, fontWeight: '600', color: '#BBB' },
  emptyDaySubtext: { fontSize: 12, color: '#CCC', textAlign: 'center' },
})
