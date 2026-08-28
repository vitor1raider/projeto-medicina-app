import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ArticleContent from "../../../components/ArticleContent";
import { useArticles } from "../../../hooks/useArticles";
import { Article } from "../../../services/articles";
import { buildArticleHtml } from "../../../utils/articleHtml";

export default function Articles() {
  const { articles, loading } = useArticles();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );

  const selectedArticle =
    articles.find((a) => a.id === selectedArticleId) ?? null;

  function handleOpenArticle(article: Article) {
    setSelectedArticleId(article.id);
  }

  function handleCloseArticle() {
    setSelectedArticleId(null);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Artigos</Text>
          <Text style={styles.subtitle}>
            Conteúdos preparados pela equipe para te ajudar a se cuidar melhor.
          </Text>
        </View>

        {loading && <Text style={styles.emptyText}>Carregando…</Text>}

        {!loading && articles.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhum artigo disponível no momento.
          </Text>
        )}

        <View style={styles.cardsArea}>
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.card}
              onPress={() => handleOpenArticle(article)}
              activeOpacity={0.8}
            >
              {article.cover_image_url ? (
                <Image
                  source={{ uri: article.cover_image_url }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.cardIconArea}>
                  <Text style={styles.cardIcon}>📰</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {article.title}
                </Text>
              </View>

              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedArticle !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCloseArticle}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedArticle && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
                </View>

                <View style={styles.modalTextArea}>
                  <ArticleContent
                    html={buildArticleHtml(selectedArticle.content)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseArticle}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    fontFamily: "Poppins_700Bold",
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
  cardsArea: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardIconArea: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardImage: {
    width: 46,
    height: 46,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: "#222",
  },
  cardArrow: {
    fontSize: 28,
    color: "#d94686",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#222",
  },
  modalTextArea: {
    marginBottom: 20,
    minHeight: 300,
  },
  closeButton: {
    height: 48,
    backgroundColor: "#d94686",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});
