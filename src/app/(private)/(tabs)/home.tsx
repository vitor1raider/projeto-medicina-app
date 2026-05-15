import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

type HealthTopic = {
  id: string
  title: string
  description: string
  icon: string
  content: string[]
}

const healthTopics: HealthTopic[] = [
  {
    id: 'ciclo-menstrual',
    title: 'Ciclo menstrual',
    description: 'Entenda fases do ciclo, sintomas comuns e alterações que merecem atenção.',
    icon: '🌙',
    content: [
      'O ciclo menstrual pode variar de pessoa para pessoa e envolve mudanças hormonais ao longo do mês.',
      'É comum perceber alterações no humor, cólicas, sensibilidade nas mamas e mudanças no fluxo menstrual.',
      'Alterações muito intensas, sangramentos fora do período ou dor forte devem ser avaliados por um profissional de saúde.',
    ],
  },
  {
    id: 'colicas',
    title: 'Cólicas menstruais',
    description: 'Informações sobre dor menstrual e quando procurar orientação.',
    icon: '🌸',
    content: [
      'Cólicas leves ou moderadas podem acontecer durante o período menstrual.',
      'Dor muito intensa, incapacitante ou que piora com o tempo não deve ser ignorada.',
      'Nesses casos, é importante buscar atendimento para investigar possíveis causas.',
    ],
  },
  {
    id: 'contraceptivos',
    title: 'Métodos contraceptivos',
    description: 'Conheça opções contraceptivas e a importância da orientação profissional.',
    icon: '🛡️',
    content: [
      'Existem diferentes métodos contraceptivos, como preservativo, pílula, DIU, injetáveis e outros.',
      'A escolha do método ideal depende da saúde, rotina, preferências e orientação profissional.',
      'O preservativo também ajuda na prevenção de infecções sexualmente transmissíveis.',
    ],
  },
  {
    id: 'prevencao',
    title: 'Prevenção ginecológica',
    description: 'Cuidados preventivos, exames e acompanhamento de rotina.',
    icon: '🩺',
    content: [
      'Consultas de rotina ajudam na prevenção e identificação precoce de alterações de saúde.',
      'Exames preventivos podem ser recomendados conforme idade, histórico e orientação médica.',
      'Manter acompanhamento regular é uma forma importante de cuidado com a saúde.',
    ],
  },
  {
    id: 'saude-intima',
    title: 'Saúde íntima',
    description: 'Cuidados básicos e sinais que merecem atenção.',
    icon: '💧',
    content: [
      'A saúde íntima envolve cuidados com higiene, conforto e observação de alterações.',
      'Coceira, ardência, dor, odor forte ou corrimento diferente podem indicar necessidade de avaliação.',
      'Evite automedicação, pois isso pode mascarar sintomas ou piorar o problema.',
    ],
  },
  {
    id: 'gravidez',
    title: 'Gravidez',
    description: 'Informações iniciais sobre cuidados e acompanhamento.',
    icon: '🤰',
    content: [
      'A gravidez exige acompanhamento pré-natal para monitorar a saúde da gestante e do bebê.',
      'Sintomas como náuseas, cansaço e alterações no corpo podem ser comuns.',
      'Sangramento, dor forte ou perda de líquido devem ser avaliados com urgência.',
    ],
  },
  {
    id: 'menopausa',
    title: 'Menopausa',
    description: 'Mudanças hormonais, sintomas comuns e cuidados nessa fase.',
    icon: '🍃',
    content: [
      'A menopausa está relacionada à redução natural dos hormônios reprodutivos.',
      'Ondas de calor, alterações no sono, humor e ciclo menstrual podem ocorrer nessa fase.',
      'O acompanhamento profissional pode ajudar a lidar melhor com os sintomas.',
    ],
  },
  {
    id: 'saude-mental',
    title: 'Saúde mental',
    description: 'Relação entre emoções, rotina, ciclo hormonal e bem-estar.',
    icon: '🧠',
    content: [
      'A saúde mental também faz parte do cuidado com a saúde da mulher.',
      'Estresse, ansiedade, alterações de humor e cansaço constante merecem atenção.',
      'Buscar apoio profissional pode ser importante quando esses sintomas afetam a rotina.',
    ],
  },
  {
    id: 'sinais-alerta',
    title: 'Sinais de alerta',
    description: 'Sintomas que não devem ser ignorados.',
    icon: '⚠️',
    content: [
      'Dor intensa, sangramento fora do comum, febre, desmaios ou corrimento com odor forte devem ser observados.',
      'Mudanças persistentes no corpo precisam ser avaliadas por um profissional.',
      'Em caso de sintomas graves ou repentinos, procure atendimento de saúde.',
    ],
  },
]

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<HealthTopic | null>(null)

  function handleOpenTopic(topic: HealthTopic) {
    setSelectedTopic(topic)
  }

  function handleCloseTopic() {
    setSelectedTopic(null)
  }

  const [profileName, setProfileName] = useState('')

  useEffect(() => {
    loadProfileName()
  }, [])

  function getFirstName(fullName: string) {
  return fullName.trim().split(' ')[0]
}

  async function loadProfileName() {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      console.log('Erro ao buscar usuário:', userError?.message)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userData.user.id)
      .maybeSingle()

    if (error) {
      console.log('Erro ao buscar perfil:', error.message)
      return
    }

    if (!data) {
      console.log('Perfil não encontrado para este usuário.')

      const fallbackName =
        userData.user.user_metadata?.name ||
        userData.user.email?.split('@')[0] ||
        ''

      setProfileName(fallbackName ? getFirstName(fallbackName) : '')
      return
    }

    setProfileName(data.name ? getFirstName(data.name) : '')
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {profileName
              ? `Cuide da sua saúde, ${profileName}!`
              : 'Cuide da sua saúde!'}
          </Text>
          <Text style={styles.subtitle}>
            Informações rápidas sobre cuidados, prevenção e bem-estar.
          </Text>
        </View>

        <View style={styles.cardsArea}>
          {healthTopics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.card}
              onPress={() => handleOpenTopic(topic)}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconArea}>
                <Text style={styles.cardIcon}>{topic.icon}</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{topic.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {topic.description}
                </Text>
              </View>

              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedTopic !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCloseTopic}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTopic && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>{selectedTopic.icon}</Text>
                  <View style={styles.modalTitleArea}>
                    <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
                    <Text style={styles.modalSubtitle}>
                      Informação geral sobre o tema
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalTextArea}>
                  {selectedTopic.content.map((item, index) => (
                    <View key={index} style={styles.infoItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.infoText}>{item}</Text>
                    </View>
                  ))}

                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      Este conteúdo é apenas informativo e não substitui a avaliação de um profissional de saúde.
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseTopic}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    lineHeight: 22,
  },
  cardsArea: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardIconArea: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 19,
  },
  cardArrow: {
    fontSize: 28,
    color: '#d94686',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  modalTitleArea: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalTextArea: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 18,
    color: '#d94686',
    marginRight: 8,
    lineHeight: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#9a3412',
    lineHeight: 20,
  },
  closeButton: {
    height: 48,
    backgroundColor: '#d94686',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})