import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')
const DAY_SIZE = Math.floor((width - 48) / 7)

const WEEK_DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
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

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  )

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDay(null)
  }

  const isToday = (day: number) =>
    day === today.day &&
    currentMonth === today.month &&
    currentYear === today.year

  // Build calendar grid
  const cells: { day: number; type: 'prev' | 'current' | 'next' }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, type: 'prev' })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'current' })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'next' })
  }

  const rows: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.subtitle}>Agendamentos e calendário menstrual</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Calendar Card */}
      <View style={styles.calendarCard}>
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color="#888" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Week day headers */}
        <View style={styles.weekRow}>
          {WEEK_DAYS.map(day => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={[styles.weekDayText, day === 'SÁB' && styles.saturdayText]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Days grid */}
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.weekRow}>
            {row.map((cell, colIndex) => {
              const isCurrent = cell.type === 'current'
              const todayDay = isToday(cell.day) && isCurrent
              const selected = selectedDay === cell.day && isCurrent
              const isSat = colIndex === 6

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.dayCell}
                  onPress={() => isCurrent && setSelectedDay(cell.day)}
                  activeOpacity={isCurrent ? 0.7 : 1}
                >
                  <View
                    style={[
                      styles.dayInner,
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
                        isSat && isCurrent && !todayDay && !selected && styles.saturdayDayText,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ))}

        {/* Legend */}
        <View style={styles.divider} />
        <View style={styles.legend}>
          <LegendItem color="#E05C7A" label="Hoje" />
          <LegendItem color="#F4A7B9" label="Sintomas" />
          <LegendItem color="#7BC67E" label="Ovulação" />
        </View>
        <View style={styles.legend}>
          <LegendItem color="#E0E0E0" label="Eventos" />
          <LegendItem color="#C8A8E9" label="Selecionados" />
          <LegendItem color="#F9E07A" label="Fértil" />
        </View>
      </View>
    </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#E05C7A',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navBtn: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AAAAAA',
    letterSpacing: 0.3,
  },
  saturdayText: {
    color: '#C0808A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: DAY_SIZE - 6,
    height: DAY_SIZE - 6,
    borderRadius: (DAY_SIZE - 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '400',
  },
  otherMonthText: {
    color: '#CCCCCC',
  },
  todayCircle: {
    backgroundColor: '#E05C7A',
  },
  todayText: {
    color: '#fff',
    fontWeight: '700',
  },
  selectedCircle: {
    backgroundColor: '#F4D0D8',
  },
  selectedText: {
    color: '#E05C7A',
    fontWeight: '600',
  },
  saturdayDayText: {
    color: '#C0808A',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: '#666',
  },
})
