import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useApp } from "../context/AppContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { authService } from "../services/authService";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          dispatch({ type: "LOGOUT" });
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  const handleClearProgress = () => {
    Alert.alert(
      "Limpar Progresso",
      "Isso resetará todos os seus flashcards. Tem certeza?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "SET_FLASHCARDS", payload: [] });
            Alert.alert("Sucesso", "Progresso limpo com sucesso!");
          },
        },
      ]
    );
  };

  const getStats = () => {
    // VERIFICAÇÃO DE SEGURANÇA
    if (!state.flashcards || !Array.isArray(state.flashcards)) {
      return {
        totalFlashcards: 0,
        completedFlashcards: 0,
        categoriesCount: 0,
        progress: 0,
      };
    }

    const totalFlashcards = state.flashcards.length;
    const completedFlashcards = state.flashcards.filter(
      (card) => card.difficulty === "easy"
    ).length;
    const categories = [
      ...new Set(state.flashcards.map((card) => card.category)),
    ];

    return {
      totalFlashcards,
      completedFlashcards,
      categoriesCount: categories.length,
      progress:
        totalFlashcards > 0 ? (completedFlashcards / totalFlashcards) * 100 : 0,
    };
  };

  const stats = getStats();

  return (
    <ScrollView style={styles.container}>
      {/* Header do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {state.user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{state.user?.name || "Usuário"}</Text>
        <Text style={styles.userEmail}>
          {state.user?.email || "email@exemplo.com"}
        </Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas de Aprendizado</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalFlashcards}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedFlashcards}</Text>
            <Text style={styles.statLabel}>Completos</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.categoriesCount}</Text>
            <Text style={styles.statLabel}>Categorias</Text>
          </View>
        </View>

        {/* Barra de Progresso */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Progresso Geral: {stats.progress.toFixed(1)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${stats.progress}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Configurações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notificações</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Modo Escuro</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleClearProgress}>
          <Text style={[styles.menuText, styles.dangerText]}>
            Limpar Progresso
          </Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre o App</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Versão</Text>
          <Text style={styles.menuValue}>1.0.0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Avaliar App</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Ajuda & Suporte</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Sair */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
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
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  dangerText: {
    color: "#FF3B30",
  },
  menuValue: {
    fontSize: 14,
    color: "#666",
  },
  menuArrow: {
    fontSize: 18,
    color: "#999",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    margin: 16,
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
