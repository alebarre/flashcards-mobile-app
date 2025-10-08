import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useApp } from "../context/AppContext";
import { flashcardService } from "../services/api";
import { RootStackParamList } from "../navigation/AppNavigator";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const categories = [
  { id: "math", name: "Matemática", color: "#FF6B6B" },
  { id: "science", name: "Ciências", color: "#4ECDC4" },
  { id: "history", name: "História", color: "#45B7D1" },
  { id: "geography", name: "Geografia", color: "#96CEB4" },
  { id: "literature", name: "Literatura", color: "#FFEAA7" },
  { id: "all", name: "Todos", color: "#DDA0DD" },
];

export default function HomeScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashcards();
  }, []);

  // Configurar o handler do botão voltar
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleBackPress = (): boolean => {
    // Mostrar alerta de confirmação quando pressionar voltar na Home
    showExitConfirmation();
    return true; // Impede o comportamento padrão (voltar para Login)
  };

  const showExitConfirmation = () => {
    Alert.alert("Sair do App", "Tem certeza que deseja sair do aplicativo?", [
      {
        text: "Cancelar",
        style: "cancel",
        onPress: () => {},
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          // Sai do app
          BackHandler.exitApp();
        },
      },
    ]);
  };

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const flashcards = await flashcardService.getFlashcards();
      dispatch({ type: "SET_FLASHCARDS", payload: flashcards });
    } catch (error) {
      console.error("Erro ao carregar flashcards:", error);
      Alert.alert("Erro", "Não foi possível carregar os flashcards");
      dispatch({ type: "SET_FLASHCARDS", payload: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    dispatch({ type: "SET_CATEGORY", payload: categoryId });
    navigation.navigate("Flashcards", { category: categoryId });
  };

  const getFlashcardsCount = (categoryId: string): number => {
    if (!state.flashcards || !Array.isArray(state.flashcards)) {
      return 0;
    }

    if (categoryId === "all") {
      return state.flashcards.length;
    }
    return state.flashcards.filter((f) => f.category === categoryId).length;
  };

  const renderCategory = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>
        {getFlashcardsCount(item.id)} cards
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando flashcards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Olá, {state.user?.name || "Estudante"}!
      </Text>
      <Text style={styles.subtitle}>Escolha uma categoria para estudar:</Text>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.profileButtonText}>Meu Perfil</Text>
      </TouchableOpacity>

      {/* Botão de saída manual */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={showExitConfirmation}
      >
        <Text style={styles.exitButtonText}>Sair do App</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  categoryCount: {
    fontSize: 12,
    color: "white",
    marginTop: 5,
    opacity: 0.9,
  },
  profileButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  profileButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  exitButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  exitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
