import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Splash"
>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Timer para navegar para Login após 3 segundos
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Simples - Substitua por uma imagem se preferir */}
        <View style={styles.logo}>
          <Text style={styles.logoText}>🎓</Text>
        </View>
        <Text style={styles.appName}>Flashcards Edu</Text>
        <Text style={styles.appSubtitle}>Aprenda de forma inteligente</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Carregando...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 100,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: "white",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
