import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useApp } from "../context/AppContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLayoutEffect } from "react";

type FlashcardsScreenRouteProp = RouteProp<RootStackParamList, "Flashcards">;

interface Props {
  route: FlashcardsScreenRouteProp;
}

export default function FlashcardsScreen({ route }: Props) {
  const { category } = route.params;
  const { state } = useApp();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // VERIFICAÇÃO DE SEGURANÇA
  const filteredFlashcards =
    state.flashcards && Array.isArray(state.flashcards)
      ? state.flashcards.filter(
          (card) => category === "all" || card.category === category
        )
      : [];

  const currentCard = filteredFlashcards[currentIndex];

  // Efeito para navegar automaticamente quando completar
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const handleBackPress = (): boolean => {
    handleBackToHome();
    return true;
  };

  const handleNext = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Último flashcard - usuário completou todos
      setHasCompleted(true);
      Alert.alert(
        "🎉 Parabéns!",
        `Você completou todos os flashcards de ${getCategoryName(category)}!`,
        [
          {
            text: "Voltar às Categorias",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setHasCompleted(false);
  };

  // Função para obter o nome amigável da categoria
  const getCategoryName = (cat: string): string => {
    const categoryNames: { [key: string]: string } = {
      math: "Matemática",
      science: "Ciências",
      history: "História",
      geography: "Geografia",
      literature: "Literatura",
      all: "Todas as Categorias",
    };
    return categoryNames[cat] || cat;
  };

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCards}>Nenhum flashcard disponível</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Voltar às Categorias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se completou todos, mostrar tela de conclusão
  if (hasCompleted) {
    return (
      <View style={styles.completionContainer}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={styles.completionTitle}>Parabéns!</Text>
        <Text style={styles.completionSubtitle}>
          Você completou todos os flashcards de{"\n"}
          <Text style={styles.categoryName}>{getCategoryName(category)}</Text>
        </Text>
        <Text style={styles.completionText}>
          Voltando para as categorias...
        </Text>

        <View style={styles.completionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={handleRestart}
          >
            <Text style={styles.buttonText}>Refazer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Categorias</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com Progresso */}
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{getCategoryName(category)}</Text>
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {filteredFlashcards.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentIndex + 1) / filteredFlashcards.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Card Principal */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowAnswer(!showAnswer)}
      >
        <Text style={styles.cardText}>
          {showAnswer ? currentCard.answer : currentCard.question}
        </Text>
        <Text style={styles.hint}>
          {showAnswer
            ? "Toque para ver a pergunta"
            : "Toque para ver a resposta"}
        </Text>

        {/* Indicador de Dificuldade */}
        <View
          style={[
            styles.difficultyBadge,
            styles[`${currentCard.difficulty}Badge`],
          ]}
        >
          <Text style={styles.difficultyText}>
            {currentCard.difficulty === "easy"
              ? "Fácil"
              : currentCard.difficulty === "medium"
              ? "Médio"
              : "Difícil"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Controles de Navegação */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.buttonText,
              currentIndex === 0 && styles.disabledButtonText,
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            currentIndex === filteredFlashcards.length - 1 &&
              styles.finishButton,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === filteredFlashcards.length - 1
              ? "Finalizar"
              : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botão para voltar às categorias a qualquer momento */}
      <TouchableOpacity
        style={styles.homeButtonSmall}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.homeButtonText}>↶ Voltar às Categorias</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  progress: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardText: {
    fontSize: 20,
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
    lineHeight: 28,
  },
  hint: {
    fontSize: 14,
    color: "#007AFF",
    fontStyle: "italic",
    marginTop: 10,
  },
  difficultyBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: "#4CAF50",
  },
  mediumBadge: {
    backgroundColor: "#FF9800",
  },
  hardBadge: {
    backgroundColor: "#F44336",
  },
  difficultyText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  backButton: {
    marginLeft: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#666",
  },
  finishButton: {
    backgroundColor: "#4CAF50",
  },
  restartButton: {
    backgroundColor: "#FF9800",
    flex: 1,
    marginHorizontal: 5,
  },
  homeButton: {
    backgroundColor: "#666",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  homeButtonSmall: {
    padding: 10,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#666",
    fontSize: 14,
  },
  noCards: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#f5f5f5",
  },
  completionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  completionSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  categoryName: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  completionText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
    fontStyle: "italic",
  },
  completionButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
});
