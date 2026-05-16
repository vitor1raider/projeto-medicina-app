import { supabase } from '../lib/supabase'

export type TipoMarcador = 'sintoma' | 'ovulacao' | 'evento' | 'fertil' | 'menstruacao'

export interface Marcador {
  id: string
  user_id: string
  data: string
  tipo: TipoMarcador
  titulo: string | null
  descricao: string | null
  created_at: string
}

export interface CicloMestrual {
  id: string
  user_id: string
  inicio: string
  fim: string
  duracao_ciclo: number
  created_at: string
}

const DURACAO_CICLO = 28
const DURACAO_MENSTRUACAO = 5  // dias 1-5: menstruação
const DIA_OVULACAO = 14        // dia 14: ovulação
const INICIO_FERTIL = 10       // dias 10-14: período fértil
const FIM_FERTIL = 14

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00') // evita problema de timezone
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function gerarMarcadoresDoCiclo(inicio: string): { data: string; tipo: TipoMarcador; titulo: string; descricao: string }[] {
  const marcadores = []

  // Menstruação: dias 1 a 5
  for (let i = 0; i < DURACAO_MENSTRUACAO; i++) {
    marcadores.push({
      data: addDays(inicio, i),
      tipo: 'sintoma' as TipoMarcador,
      titulo: 'Menstruação',
      descricao: `Dia ${i + 1} da menstruação`,
    })
  }

  // Período fértil: dias 10 a 13
  for (let i = INICIO_FERTIL - 1; i < FIM_FERTIL - 1; i++) {
    marcadores.push({
      data: addDays(inicio, i),
      tipo: 'fertil' as TipoMarcador,
      titulo: 'Período fértil',
      descricao: 'Alta chance de fertilidade',
    })
  }

  // Ovulação: dia 14
  marcadores.push({
    data: addDays(inicio, DIA_OVULACAO - 1),
    tipo: 'ovulacao' as TipoMarcador,
    titulo: 'Ovulação',
    descricao: 'Dia estimado de ovulação',
  })

  return marcadores
}

export async function registrarCiclo(inicioCiclo: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const fim = addDays(inicioCiclo, DURACAO_CICLO - 1)

  // Salva o ciclo na tabela ciclo_mestrual
  const { error: cicloError } = await supabase
    .from('ciclo_mestrual')
    .insert({
      user_id: user.id,
      inicio: inicioCiclo,
      fim,
      duracao_ciclo: DURACAO_CICLO,
    })

  if (cicloError) throw cicloError

  // Gera e salva os marcadores calculados
  const marcadores = gerarMarcadoresDoCiclo(inicioCiclo)

  const rows = marcadores.map(m => ({
    user_id: user.id,
    data: m.data,
    tipo: m.tipo,
    titulo: m.titulo,
    descricao: m.descricao,
  }))

  const { error: marcErr } = await supabase
    .from('agenda_marcadores')
    .insert(rows)

  if (marcErr) throw marcErr
}

export async function getMarcadoresByMes(year: number, month: number): Promise<Marcador[]> {
  const inicio = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const fim = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

  const { data, error } = await supabase
    .from('agenda_marcadores')
    .select('*')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) throw error
  return data ?? []
}

export async function getCiclos(): Promise<CicloMestrual[]> {
  const { data, error } = await supabase
    .from('ciclo_mestrual')
    .select('*')
    .order('inicio', { ascending: false })

  if (error) throw error
  return data ?? []
}