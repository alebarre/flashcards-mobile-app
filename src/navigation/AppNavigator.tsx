import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import FlashcardsScreen from "../screens/FlashcardsScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  Flashcards: { category: string };
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Categorias",
            headerLeft: () => null, // Remove o botão de voltar
            gestureEnabled: false, // Desabilita gesto de voltar
          }}
        />
        <Stack.Screen
          name="Flashcards"
          component={FlashcardsScreen}
          options={{
            title: "Flashcards",
            gestureEnabled: true, // Permite gesto de voltar nos flashcards
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Perfil" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
