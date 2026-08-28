import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../../../lib/supabase'

interface Perfil {
  id: string
  name: string | null
  email: string | null
  birth_date: string | null
  created_at: string
}

function calcularIdade(birthDate: string | null): string {
  if (!birthDate) return '—'
  const hoje = new Date()
  const nasc = new Date(birthDate)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return `${idade} anos`
}

function formatarData(dateStr: string | null): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function getIniciais(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}

export default function PerfilScreen() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPerfil()
  }, [])

  async function carregarPerfil() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      // Tenta buscar perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()   // ← aqui está a correção principal

      if (error) throw error

      if (data) {
        // Perfil já existe
        setPerfil(data)
      } else {
        // Perfil não existe → cria agora com dados do auth
        const { data: novoPerfil, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email ?? null,
            name: user.user_metadata?.name ?? null,
            birth_date: user.user_metadata?.birth_date ?? null,
          })
          .select()
          .maybeSingle()

        if (insertError) throw insertError
        setPerfil(novoPerfil)
      }
    } catch (e) {
      console.error('Erro ao carregar perfil:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          router.replace('/login')
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C7A" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meu Perfil</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/perfil/editar')}>
          <Ionicons name="pencil-outline" size={18} color="#E05C7A" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getIniciais(perfil?.name ?? null)}</Text>
        </View>
        <Text style={styles.nome}>{perfil?.name ?? 'Usuária'}</Text>
        <Text style={styles.email}>{perfil?.email ?? '—'}</Text>
      </View>

      {/* Dados */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dados da conta</Text>

        <InfoRow
          icon="person-outline"
          label="Nome"
          value={perfil?.name ?? '—'}
        />
        <View style={styles.divider} />
        <InfoRow
          icon="mail-outline"
          label="E-mail"
          value={perfil?.email ?? '—'}
        />
        <View style={styles.divider} />
        <InfoRow
          icon="calendar-outline"
          label="Data de nascimento"
          value={formatarData(perfil?.birth_date ?? null)}
        />
        <View style={styles.divider} />
        <InfoRow
          icon="time-outline"
          label="Idade"
          value={calcularIdade(perfil?.birth_date ?? null)}
        />
      </View>

      {/* Opções */}
      {/* /*
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configurações</Text>

        <MenuRow
          icon="create-outline"
          label="Alterar dados da conta"
          onPress={() => router.push('/perfil/editar')}
        />
        <View style={styles.divider} />
        <MenuRow
          icon="lock-closed-outline"
          label="Alterar senha"
          onPress={() => router.push('/perfil/senha')}
        />
        <View style={styles.divider} />
        <MenuRow
          icon="notifications-outline"
          label="Notificações"
          onPress={() => router.push('/perfil/notificacoes')}
        />
      </View> */}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#E05C7A" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.versao}>Versão 1.0.0</Text>
    </ScrollView>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color="#E05C7A" />
      </View>
      <View style={styles.infoTexts}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

function MenuRow({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color="#E05C7A" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CCC" />
    </TouchableOpacity>
  )
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 40 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F7' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: '#1A1A1A', letterSpacing: -0.5 },
  editButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FDE8EE',
    alignItems: 'center', justifyContent: 'center',
  },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#E05C7A',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#E05C7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: { fontSize: 30, fontFamily: 'Poppins_700Bold', color: '#fff' },
  nome: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#1A1A1A', marginBottom: 4 },
  email: { fontSize: 13, color: '#999' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#AAAAAA',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
  },

  divider: { height: 1, backgroundColor: '#F5F5F5' },

  // InfoRow
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FDE8EE',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTexts: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#AAAAAA', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#222', fontFamily: 'Poppins_500Medium' },

  // MenuRow
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  menuLabel: { flex: 1, fontSize: 14, color: '#333', fontFamily: 'Poppins_500Medium' },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FDE8EE',
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: '#E05C7A' },

  versao: { textAlign: 'center', fontSize: 12, color: '#CCC' },
})
